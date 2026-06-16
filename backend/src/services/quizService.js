const { pool, mapRow } = require('../config/database');
const slugify = require('slugify');

const generateSlug = (title) =>
  slugify(title, { lower: true, strict: true, trim: true }) + '-' + Date.now();

const formatQuiz = (row) => ({
  ...mapRow(row),
  isPublished: !!row.is_published,
  isFeatured: !!row.is_featured,
});

const formatQuizWithRelations = (row) => {
  const base = formatQuiz(row);
  // Strip JOIN alias fields that were merged into the row
  delete base.catId;
  delete base.catName;
  delete base.catSlug;
  delete base.catIcon;
  delete base.catColor;
  delete base.questionCount;
  delete base.attemptCount;
  return base;
};

const extractCategory = (row) => ({
  id: row.cat_id,
  name: row.cat_name,
  slug: row.cat_slug,
  icon: row.cat_icon,
  color: row.cat_color,
});

const getAll = async ({ categoryId, published, page = 1, limit = 20 } = {}) => {
  const conditions = [];
  const params = [];

  if (categoryId) {
    conditions.push('q.category_id = ?');
    params.push(Number(categoryId));
  }
  if (published !== undefined) {
    conditions.push('q.is_published = ?');
    params.push(published === 'true' || published === true ? 1 : 0);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const skip = (Number(page) - 1) * Number(limit);

  const [rows] = await pool.query(`
    SELECT q.*,
      c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug,
      c.icon AS cat_icon, c.color AS cat_color,
      COUNT(DISTINCT qq.id) AS question_count,
      COUNT(DISTINCT qa.id) AS attempt_count
    FROM quizzes q
    LEFT JOIN categories c ON c.id = q.category_id
    LEFT JOIN questions qq ON qq.quiz_id = q.id
    LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id
    ${where}
    GROUP BY q.id
    ORDER BY q.created_at DESC
    LIMIT ? OFFSET ?
  `, [...params, Number(limit), skip]);

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(DISTINCT q.id) AS total FROM quizzes q ${where}`,
    params
  );

  const quizzes = rows.map((row) => ({
    ...formatQuizWithRelations(row),
    category: extractCategory(row),
    _count: { questions: Number(row.question_count), quizAttempts: Number(row.attempt_count) },
  }));

  return { quizzes, total: Number(total), page: Number(page), limit: Number(limit), totalPages: Math.ceil(Number(total) / Number(limit)) };
};

const getFeatured = async () => {
  const [rows] = await pool.query(`
    SELECT q.*,
      c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug,
      c.icon AS cat_icon, c.color AS cat_color,
      COUNT(DISTINCT qq.id) AS question_count,
      COUNT(DISTINCT qa.id) AS attempt_count
    FROM quizzes q
    LEFT JOIN categories c ON c.id = q.category_id
    LEFT JOIN questions qq ON qq.quiz_id = q.id
    LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id
    WHERE q.is_published = 1 AND q.is_featured = 1
    GROUP BY q.id
    ORDER BY q.total_plays DESC
    LIMIT 6
  `);
  return rows.map((row) => ({
    ...formatQuizWithRelations(row),
    category: extractCategory(row),
    _count: { questions: Number(row.question_count), quizAttempts: Number(row.attempt_count) },
  }));
};

const getBySlug = async (slug) => {
  const [quizRows] = await pool.query(`
    SELECT q.*,
      c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug,
      c.icon AS cat_icon, c.color AS cat_color,
      COUNT(DISTINCT qa.id) AS attempt_count
    FROM quizzes q
    LEFT JOIN categories c ON c.id = q.category_id
    LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id
    WHERE q.slug = ?
    GROUP BY q.id
    LIMIT 1
  `, [slug]);

  const quizRow = quizRows[0];
  if (!quizRow) {
    const err = new Error('Quiz not found');
    err.statusCode = 404;
    throw err;
  }
  if (!quizRow.is_published) {
    const err = new Error('Quiz is not available');
    err.statusCode = 403;
    throw err;
  }

  const [questionRows] = await pool.query(
    'SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index ASC',
    [quizRow.id]
  );

  return {
    ...formatQuizWithRelations(quizRow),
    category: extractCategory(quizRow),
    questions: questionRows.map(mapRow),
    _count: { quizAttempts: Number(quizRow.attempt_count) },
  };
};

const create = async (data) => {
  const slug = generateSlug(data.title);
  const [result] = await pool.query(
    `INSERT INTO quizzes (title, slug, description, category_id, reward_points, reward_coins, time_limit, is_published, is_featured, thumbnail)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title,
      slug,
      data.description || null,
      Number(data.categoryId),
      data.rewardPoints || 10,
      data.rewardCoins || 10,
      data.timeLimit || 0,
      data.isPublished ? 1 : 0,
      data.isFeatured ? 1 : 0,
      data.thumbnail || null,
    ]
  );
  const [[row]] = await pool.query(
    `SELECT q.*, c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug, c.icon AS cat_icon, c.color AS cat_color
     FROM quizzes q LEFT JOIN categories c ON c.id = q.category_id WHERE q.id = ?`,
    [result.insertId]
  );
  return { ...formatQuizWithRelations(row), category: extractCategory(row) };
};

const update = async (id, data) => {
  const [[existing]] = await pool.query('SELECT id FROM quizzes WHERE id = ? LIMIT 1', [Number(id)]);
  if (!existing) {
    const err = new Error('Quiz not found');
    err.statusCode = 404;
    throw err;
  }

  const fields = [];
  const values = [];
  if (data.title !== undefined)        { fields.push('title = ?');        values.push(data.title); }
  if (data.description !== undefined)  { fields.push('description = ?');  values.push(data.description); }
  if (data.categoryId !== undefined)   { fields.push('category_id = ?');  values.push(Number(data.categoryId)); }
  if (data.rewardPoints !== undefined) { fields.push('reward_points = ?'); values.push(data.rewardPoints); }
  if (data.rewardCoins !== undefined)  { fields.push('reward_coins = ?');  values.push(data.rewardCoins); }
  if (data.timeLimit !== undefined)    { fields.push('time_limit = ?');    values.push(data.timeLimit); }
  if (data.isPublished !== undefined)  { fields.push('is_published = ?');  values.push(data.isPublished ? 1 : 0); }
  if (data.isFeatured !== undefined)   { fields.push('is_featured = ?');   values.push(data.isFeatured ? 1 : 0); }
  if (data.thumbnail !== undefined)    { fields.push('thumbnail = ?');     values.push(data.thumbnail); }
  fields.push('updated_at = NOW()');

  await pool.query(`UPDATE quizzes SET ${fields.join(', ')} WHERE id = ?`, [...values, Number(id)]);
  const [[row]] = await pool.query(
    `SELECT q.*, c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug, c.icon AS cat_icon, c.color AS cat_color
     FROM quizzes q LEFT JOIN categories c ON c.id = q.category_id WHERE q.id = ?`,
    [Number(id)]
  );
  return { ...formatQuizWithRelations(row), category: extractCategory(row) };
};

const remove = async (id) => {
  const [[existing]] = await pool.query('SELECT id FROM quizzes WHERE id = ? LIMIT 1', [Number(id)]);
  if (!existing) {
    const err = new Error('Quiz not found');
    err.statusCode = 404;
    throw err;
  }
  await pool.query('DELETE FROM quizzes WHERE id = ?', [Number(id)]);
};

const togglePublish = async (id) => {
  const [[quiz]] = await pool.query('SELECT id, is_published FROM quizzes WHERE id = ? LIMIT 1', [Number(id)]);
  if (!quiz) {
    const err = new Error('Quiz not found');
    err.statusCode = 404;
    throw err;
  }
  const newVal = quiz.is_published ? 0 : 1;
  await pool.query('UPDATE quizzes SET is_published = ?, updated_at = NOW() WHERE id = ?', [newVal, Number(id)]);
  const [[row]] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [Number(id)]);
  return formatQuiz(row);
};

const toggleFeature = async (id) => {
  const [[quiz]] = await pool.query('SELECT id, is_featured FROM quizzes WHERE id = ? LIMIT 1', [Number(id)]);
  if (!quiz) {
    const err = new Error('Quiz not found');
    err.statusCode = 404;
    throw err;
  }
  const newVal = quiz.is_featured ? 0 : 1;
  await pool.query('UPDATE quizzes SET is_featured = ?, updated_at = NOW() WHERE id = ?', [newVal, Number(id)]);
  const [[row]] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [Number(id)]);
  return formatQuiz(row);
};

const getQuestions = async (id) => {
  const [[quiz]] = await pool.query('SELECT id FROM quizzes WHERE id = ? LIMIT 1', [Number(id)]);
  if (!quiz) {
    const err = new Error('Quiz not found');
    err.statusCode = 404;
    throw err;
  }
  const [rows] = await pool.query(
    'SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index ASC',
    [Number(id)]
  );
  return rows.map(mapRow);
};

const addQuestion = async (quizId, data) => {
  const [[quiz]] = await pool.query('SELECT id FROM quizzes WHERE id = ? LIMIT 1', [Number(quizId)]);
  if (!quiz) {
    const err = new Error('Quiz not found');
    err.statusCode = 404;
    throw err;
  }
  const [[{ count }]] = await pool.query(
    'SELECT COUNT(*) AS count FROM questions WHERE quiz_id = ?',
    [Number(quizId)]
  );
  const orderIndex = data.orderIndex !== undefined ? data.orderIndex : Number(count);
  const [result] = await pool.query(
    `INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [Number(quizId), data.questionText, data.optionA, data.optionB, data.optionC, data.optionD, data.correctAnswer, data.explanation || null, orderIndex]
  );
  const [[row]] = await pool.query('SELECT * FROM questions WHERE id = ?', [result.insertId]);
  return mapRow(row);
};

const bulkUpdateQuestions = async (quizId, questions) => {
  const [[quiz]] = await pool.query('SELECT id FROM quizzes WHERE id = ? LIMIT 1', [Number(quizId)]);
  if (!quiz) {
    const err = new Error('Quiz not found');
    err.statusCode = 404;
    throw err;
  }

  await pool.query('DELETE FROM questions WHERE quiz_id = ?', [Number(quizId)]);

  if (!questions || questions.length === 0) return { count: 0 };

  const values = questions.map((q, index) => [
    Number(quizId),
    q.questionText,
    q.optionA,
    q.optionB,
    q.optionC,
    q.optionD,
    q.correctAnswer,
    q.explanation ?? null,
    q.orderIndex !== undefined ? q.orderIndex : index,
  ]);

  const [result] = await pool.query(
    `INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
     VALUES ?`,
    [values]
  );
  return { count: result.affectedRows };
};

const updateQuestion = async (quizId, questionId, data) => {
  const [[question]] = await pool.query(
    'SELECT * FROM questions WHERE id = ? AND quiz_id = ? LIMIT 1',
    [Number(questionId), Number(quizId)]
  );
  if (!question) {
    const err = new Error('Question not found');
    err.statusCode = 404;
    throw err;
  }

  const fields = [];
  const values = [];
  if (data.questionText !== undefined)  { fields.push('question_text = ?');  values.push(data.questionText); }
  if (data.optionA !== undefined)       { fields.push('option_a = ?');       values.push(data.optionA); }
  if (data.optionB !== undefined)       { fields.push('option_b = ?');       values.push(data.optionB); }
  if (data.optionC !== undefined)       { fields.push('option_c = ?');       values.push(data.optionC); }
  if (data.optionD !== undefined)       { fields.push('option_d = ?');       values.push(data.optionD); }
  if (data.correctAnswer !== undefined) { fields.push('correct_answer = ?'); values.push(data.correctAnswer); }
  if (data.explanation !== undefined)   { fields.push('explanation = ?');    values.push(data.explanation); }
  if (data.orderIndex !== undefined)    { fields.push('order_index = ?');    values.push(data.orderIndex); }
  fields.push('updated_at = NOW()');

  await pool.query(`UPDATE questions SET ${fields.join(', ')} WHERE id = ?`, [...values, Number(questionId)]);
  const [[row]] = await pool.query('SELECT * FROM questions WHERE id = ?', [Number(questionId)]);
  return mapRow(row);
};

const deleteQuestion = async (quizId, questionId) => {
  const [[question]] = await pool.query(
    'SELECT id FROM questions WHERE id = ? AND quiz_id = ? LIMIT 1',
    [Number(questionId), Number(quizId)]
  );
  if (!question) {
    const err = new Error('Question not found');
    err.statusCode = 404;
    throw err;
  }
  await pool.query('DELETE FROM questions WHERE id = ?', [Number(questionId)]);
};

const submitAttempt = async (quizId, answers, timeTaken = 0, userId = null) => {
  const [[quizRow]] = await pool.query(
    'SELECT * FROM quizzes WHERE id = ? AND is_published = 1 LIMIT 1',
    [Number(quizId)]
  );
  if (!quizRow) {
    const err = new Error('Quiz not found');
    err.statusCode = 404;
    throw err;
  }

  const [questionRows] = await pool.query(
    'SELECT * FROM questions WHERE quiz_id = ?',
    [Number(quizId)]
  );

  const questionMap = new Map(questionRows.map((q) => [q.id, q]));
  let correct = 0;
  let wrong = 0;

  for (const answer of answers) {
    const question = questionMap.get(Number(answer.questionId));
    if (question && question.correct_answer === answer.selectedAnswer) {
      correct++;
    } else if (question) {
      wrong++;
    }
  }

  const total = questionRows.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const pointsEarned = correct > 0 ? Math.round((correct / total) * quizRow.reward_points) : 0;

  const [attemptResult] = await pool.query(
    `INSERT INTO quiz_attempts (quiz_id, user_id, score, total_questions, correct_answers, wrong_answers, points_earned, time_taken)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [Number(quizId), userId ? Number(userId) : null, score, total, correct, wrong, pointsEarned, Number(timeTaken)]
  );
  const attemptId = attemptResult.insertId;

  await Promise.all([
    pool.query('UPDATE quizzes SET total_plays = total_plays + 1 WHERE id = ?', [Number(quizId)]),
    userId
      ? pool.query('UPDATE users SET total_points = total_points + ? WHERE id = ?', [pointsEarned, Number(userId)])
      : Promise.resolve(),
  ]);

  const [[attempt]] = await pool.query('SELECT * FROM quiz_attempts WHERE id = ?', [attemptId]);

  const detailedAnswers = answers.map((answer) => {
    const question = questionMap.get(Number(answer.questionId));
    return {
      questionId: answer.questionId,
      selectedAnswer: answer.selectedAnswer,
      correctAnswer: question?.correct_answer ?? null,
      isCorrect: question?.correct_answer === answer.selectedAnswer,
      explanation: question?.explanation ?? null,
    };
  });

  return { attempt: mapRow(attempt), detailedAnswers };
};

module.exports = {
  getAll,
  getFeatured,
  getBySlug,
  create,
  update,
  remove,
  togglePublish,
  toggleFeature,
  getQuestions,
  addQuestion,
  bulkUpdateQuestions,
  updateQuestion,
  deleteQuestion,
  submitAttempt,
};
