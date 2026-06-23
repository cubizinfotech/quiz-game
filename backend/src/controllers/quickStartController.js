const { pool, mapRow } = require('../config/database');

const formatQuiz = (quizRow, questionRows) => ({
  id: quizRow.id,
  isActive: !!quizRow.is_active,
  rewardCoins: quizRow.reward_coins,
  createdAt: quizRow.created_at,
  updatedAt: quizRow.updated_at,
  questions: questionRows.map((q) => ({
    id: q.id,
    quizId: q.quiz_id,
    questionText: q.question_text,
    optionA: q.option_a,
    optionB: q.option_b,
    optionC: q.option_c,
    optionD: q.option_d,
    correctAnswer: q.correct_answer,
    explanation: q.explanation,
    orderIndex: q.order_index,
  })),
});

// GET /api/quick-start
const getActive = async (req, res, next) => {
  try {
    const [[quizRow]] = await pool.query(
      'SELECT * FROM quick_start_quizzes WHERE is_active = 1 LIMIT 1'
    );
    if (!quizRow) {
      return res.json({ success: true, data: null });
    }
    const [questionRows] = await pool.query(
      'SELECT * FROM quick_start_questions WHERE quiz_id = ? ORDER BY order_index ASC LIMIT 2',
      [quizRow.id]
    );
    res.json({ success: true, data: formatQuiz(quizRow, questionRows) });
  } catch (err) {
    next(err);
  }
};

// POST /api/quick-start/complete
const complete = async (req, res, next) => {
  try {
    const { quizId, correctAnswers } = req.body;

    const [[quizRow]] = await pool.query(
      'SELECT * FROM quick_start_quizzes WHERE id = ? LIMIT 1',
      [Number(quizId)]
    );
    if (!quizRow || !quizRow.is_active) {
      return res.status(404).json({ success: false, message: 'Quick Start quiz not found' });
    }

    const totalQ = 2;
    const correct = Math.min(Math.max(Number(correctAnswers) || 0, 0), totalQ);
    const coinsEarned = correct * 100;

    let newBalance = null;

    if (req.user && coinsEarned > 0) {
      await pool.query('UPDATE users SET coins = coins + ? WHERE id = ?', [coinsEarned, Number(req.user.id)]);
      if (!req.user.isGuest) {
        await pool.query(
          'INSERT INTO coin_transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
          [Number(req.user.id), coinsEarned, 'bonus', 'Quick Start Quiz reward']
        );
      }
      const [[userRow]] = await pool.query('SELECT coins FROM users WHERE id = ? LIMIT 1', [Number(req.user.id)]);
      newBalance = userRow.coins;
    }

    res.json({ success: true, data: { coinsEarned, newBalance } });
  } catch (err) {
    next(err);
  }
};

// GET /api/quick-start/admin
const adminGet = async (req, res, next) => {
  try {
    const [[quizRow]] = await pool.query('SELECT * FROM quick_start_quizzes LIMIT 1');
    if (!quizRow) {
      return res.json({ success: true, data: null });
    }
    const [questionRows] = await pool.query(
      'SELECT * FROM quick_start_questions WHERE quiz_id = ? ORDER BY order_index ASC',
      [quizRow.id]
    );
    res.json({ success: true, data: formatQuiz(quizRow, questionRows) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/quick-start/admin
const adminSave = async (req, res, next) => {
  try {
    const { isActive, rewardCoins, questions = [] } = req.body;
    const [[existing]] = await pool.query('SELECT * FROM quick_start_quizzes LIMIT 1');

    let quizId;
    if (existing) {
      await pool.query('DELETE FROM quick_start_questions WHERE quiz_id = ?', [existing.id]);
      await pool.query(
        'UPDATE quick_start_quizzes SET is_active = ?, reward_coins = ?, updated_at = NOW() WHERE id = ?',
        [Boolean(isActive) ? 1 : 0, Number(rewardCoins) || 20, existing.id]
      );
      quizId = existing.id;
    } else {
      const [result] = await pool.query(
        'INSERT INTO quick_start_quizzes (is_active, reward_coins) VALUES (?, ?)',
        [Boolean(isActive) ? 1 : 0, Number(rewardCoins) || 20]
      );
      quizId = result.insertId;
    }

    const sliced = questions.slice(0, 2);
    for (const [i, q] of sliced.entries()) {
      await pool.query(
        `INSERT INTO quick_start_questions
         (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [quizId, q.questionText, q.optionA, q.optionB, q.optionC, q.optionD, q.correctAnswer, q.explanation || null, i]
      );
    }

    const [[quizRow]] = await pool.query('SELECT * FROM quick_start_quizzes WHERE id = ?', [quizId]);
    const [questionRows] = await pool.query(
      'SELECT * FROM quick_start_questions WHERE quiz_id = ? ORDER BY order_index ASC',
      [quizId]
    );

    res.json({ success: true, message: 'Quick Start quiz saved', data: formatQuiz(quizRow, questionRows) });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/quick-start/admin/toggle
const adminToggle = async (req, res, next) => {
  try {
    const [[existing]] = await pool.query('SELECT * FROM quick_start_quizzes LIMIT 1');
    if (!existing) {
      return res.status(404).json({ success: false, message: 'No Quick Start quiz exists yet' });
    }
    const newVal = existing.is_active ? 0 : 1;
    await pool.query('UPDATE quick_start_quizzes SET is_active = ?, updated_at = NOW() WHERE id = ?', [newVal, existing.id]);
    const [[quizRow]] = await pool.query('SELECT * FROM quick_start_quizzes WHERE id = ?', [existing.id]);
    res.json({
      success: true,
      message: `Quick Start quiz ${quizRow.is_active ? 'enabled' : 'disabled'}`,
      data: { ...mapRow(quizRow), isActive: !!quizRow.is_active },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getActive, complete, adminGet, adminSave, adminToggle };
