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
    const result = await quizService.submitAttempt(req.params.id, answers, timeTaken, userId);
    res.json({ success: true, message: 'Quiz submitted', data: result });
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
};
