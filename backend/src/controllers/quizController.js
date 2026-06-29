const quizService = require('../services/quizService');

const getAll = async (req, res, next) => {
  try {
    const result = await quizService.getAll(req.query);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getFeatured = async (req, res, next) => {
  try {
    const quizzes = await quizService.getFeatured();
    res.json({ success: true, data: quizzes });
  } catch (err) {
    next(err);
  }
};

const getBySlug = async (req, res, next) => {
  try {
    const quiz = await quizService.getBySlug(req.params.slug);
    res.json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const quiz = await quizService.create(req.body);
    res.status(201).json({ success: true, message: 'Quiz created', data: quiz });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const quiz = await quizService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Quiz updated', data: quiz });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await quizService.remove(req.params.id);
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (err) {
    next(err);
  }
};

const togglePublish = async (req, res, next) => {
  try {
    const quiz = await quizService.togglePublish(req.params.id);
    res.json({ success: true, message: `Quiz ${quiz.isPublished ? 'published' : 'unpublished'}`, data: quiz });
  } catch (err) {
    next(err);
  }
};

const toggleFeature = async (req, res, next) => {
  try {
    const quiz = await quizService.toggleFeature(req.params.id);
    res.json({ success: true, message: `Quiz ${quiz.isFeatured ? 'featured' : 'unfeatured'}`, data: quiz });
  } catch (err) {
    next(err);
  }
};

const getQuestions = async (req, res, next) => {
  try {
    const questions = await quizService.getQuestions(req.params.id);
    res.json({ success: true, data: questions });
  } catch (err) {
    next(err);
  }
};

const addQuestion = async (req, res, next) => {
  try {
    const question = await quizService.addQuestion(req.params.id, req.body);
    res.status(201).json({ success: true, message: 'Question added', data: question });
  } catch (err) {
    next(err);
  }
};

const bulkUpdateQuestions = async (req, res, next) => {
  try {
    const result = await quizService.bulkUpdateQuestions(req.params.id, req.body.questions);
    res.json({ success: true, message: 'Questions updated', data: result });
  } catch (err) {
    next(err);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const question = await quizService.updateQuestion(req.params.quizId, req.params.questionId, req.body);
    res.json({ success: true, message: 'Question updated', data: question });
  } catch (err) {
    next(err);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    await quizService.deleteQuestion(req.params.quizId, req.params.questionId);
    res.json({ success: true, message: 'Question deleted' });
  } catch (err) {
    next(err);
  }
};

const submitAttempt = async (req, res, next) => {
  try {
    const { answers, timeTaken } = req.body;
    const userId = req.user?.id || null;
    const isGuest = req.user?.isGuest || false;
    const result = await quizService.submitAttempt(req.params.id, answers, timeTaken, userId, isGuest);
    res.json({ success: true, message: 'Quiz submitted', data: result });
  } catch (err) {
    next(err);
  }
};

// POST /api/quizzes/:id/join — deducts entry fee at join time (guests and logged-in users both pay)
const { pool } = require('../config/database');
const joinQuiz = async (req, res, next) => {
  try {
    const quizId = Number(req.params.id);
    const userId = req.user?.id;

    const [[quiz]] = await pool.query(
      'SELECT id, entry_fee, title, is_published FROM quizzes WHERE id = ? LIMIT 1',
      [quizId]
    );
    if (!quiz || !quiz.is_published) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const entryFee = quiz.entry_fee || 0;

    // Free quiz — no deduction needed
    if (entryFee === 0) {
      return res.json({ success: true, data: { entryFee: 0, newBalance: null } });
    }

    // Paid quiz with no user session
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Login required' });
    }

    // Coin balance check temporarily disabled — users can play regardless of balance
    const [[userRow]] = await pool.query('SELECT coins FROM users WHERE id = ? LIMIT 1', [Number(userId)]);

    // Deduct entry fee only if user has sufficient coins
    if (userRow && userRow.coins >= entryFee) {
      await pool.query('UPDATE users SET coins = coins - ? WHERE id = ?', [entryFee, Number(userId)]);
    }
    try {
      await pool.query(
        'INSERT INTO coin_transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
        [Number(userId), -entryFee, 'entry_fee', `Entry fee: ${quiz.title}`]
      );
    } catch { /* ignore schema issues */ }

    const [[updated]] = await pool.query('SELECT coins FROM users WHERE id = ? LIMIT 1', [Number(userId)]);
    res.json({ success: true, data: { entryFee, newBalance: updated.coins } });
  } catch (err) {
    next(err);
  }
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
  joinQuiz,
};
