require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

async function main() {
  // Default admin
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await pool.query(
    `INSERT INTO admins (email, password, name) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE updated_at = NOW()`,
    ['admin@quizgame.com', hashedPassword, 'Super Admin']
  );

  // Default settings
  const defaultSettings = [
    ['site_name', 'QuizGame'],
    ['logo', '/logo.png'],
    ['favicon', '/favicon.ico'],
    ['footer_text', '© 2026 QuizGame. All rights reserved.'],
  ];
  for (const [key, value] of defaultSettings) {
    await pool.query(
      'INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE updated_at = NOW()',
      [key, value]
    );
  }

  // Default categories
  const categories = [
    { name: 'General Knowledge', slug: 'general-knowledge', icon: '🧠', color: '#2563EB', description: 'Test your general knowledge' },
    { name: 'Science',           slug: 'science',           icon: '🔬', color: '#16A34A', description: 'Explore science topics' },
    { name: 'History',           slug: 'history',           icon: '📜', color: '#D97706', description: 'Journey through history' },
    { name: 'Sports',            slug: 'sports',            icon: '⚽', color: '#DC2626', description: 'All about sports' },
    { name: 'Technology',        slug: 'technology',        icon: '💻', color: '#7C3AED', description: 'Tech and innovations' },
    { name: 'Geography',         slug: 'geography',         icon: '🌍', color: '#0891B2', description: 'World geography' },
  ];
  for (const cat of categories) {
    await pool.query(
      `INSERT INTO categories (name, slug, icon, color, description)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE updated_at = NOW()`,
      [cat.name, cat.slug, cat.icon, cat.color, cat.description]
    );
  }

  // Sample fun facts
  const funFacts = [
    { title: 'Honey Never Spoils',  description: 'Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still perfectly edible.' },
    { title: 'Bananas Are Berries', description: 'Botanically speaking, bananas are berries, but strawberries are not.' },
    { title: 'Octopus Hearts',      description: 'An octopus has three hearts: two pump blood to the gills, and one pumps it to the rest of the body.' },
  ];
  for (const fact of funFacts) {
    const [[existing]] = await pool.query(
      'SELECT id FROM fun_facts WHERE title = ? LIMIT 1',
      [fact.title]
    );
    if (!existing) {
      await pool.query(
        'INSERT INTO fun_facts (title, description, is_active) VALUES (?, ?, 1)',
        [fact.title, fact.description]
      );
    }
  }

  // Sample quiz
  const [[gkCategory]] = await pool.query(
    'SELECT id FROM categories WHERE slug = ? LIMIT 1',
    ['general-knowledge']
  );
  if (gkCategory) {
    const [[existingQuiz]] = await pool.query(
      'SELECT id FROM quizzes WHERE slug = ? LIMIT 1',
      ['basic-general-knowledge']
    );
    if (!existingQuiz) {
      const [quizResult] = await pool.query(
        `INSERT INTO quizzes (title, slug, description, category_id, reward_points, is_published, is_featured)
         VALUES (?, ?, ?, ?, ?, 1, 1)`,
        [
          'Basic General Knowledge',
          'basic-general-knowledge',
          'Test your basic general knowledge with these fun questions!',
          gkCategory.id,
          50,
        ]
      );
      const quizId = quizResult.insertId;

      const questions = [
        { questionText: 'What is the capital of France?',              optionA: 'London', optionB: 'Berlin', optionC: 'Paris',   optionD: 'Madrid',  correctAnswer: 'C', orderIndex: 1 },
        { questionText: 'How many continents are there on Earth?',     optionA: '5',      optionB: '6',      optionC: '8',       optionD: '7',       correctAnswer: 'D', orderIndex: 2 },
        { questionText: 'What is the largest planet in our solar system?', optionA: 'Saturn', optionB: 'Jupiter', optionC: 'Neptune', optionD: 'Uranus', correctAnswer: 'B', orderIndex: 3 },
        { questionText: 'Who painted the Mona Lisa?',                  optionA: 'Van Gogh', optionB: 'Picasso', optionC: 'Michelangelo', optionD: 'Leonardo da Vinci', correctAnswer: 'D', orderIndex: 4 },
        { questionText: 'What is the chemical symbol for water?',      optionA: 'O2',     optionB: 'CO2',    optionC: 'H2O',     optionD: 'HO',      correctAnswer: 'C', orderIndex: 5 },
      ];

      const values = questions.map((q) => [
        quizId, q.questionText, q.optionA, q.optionB, q.optionC, q.optionD, q.correctAnswer, q.orderIndex,
      ]);
      await pool.query(
        'INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_index) VALUES ?',
        [values]
      );
    }
  }

  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
