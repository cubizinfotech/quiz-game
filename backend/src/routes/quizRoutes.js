const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const adminAuth = require('../middleware/adminAuth');
const userAuth = require('../middleware/userAuth');
const validate = require('../middleware/validate');
const {
  quizValidator,
  questionValidator,
  bulkQuestionsValidator,
  attemptValidator,
} = require('../validators/quizValidator');

// Public routes
router.get('/', quizController.getAll);
router.get('/featured', quizController.getFeatured);
router.get('/:slug', quizController.getBySlug);

// Submit attempt — userAuth is optional: sets req.user when token present, null when not
router.post('/:id/attempt', userAuth, attemptValidator, validate, quizController.submitAttempt);

// Admin routes
router.post('/', adminAuth, quizValidator, validate, quizController.create);
router.put('/:id', adminAuth, quizValidator, validate, quizController.update);
router.delete('/:id', adminAuth, quizController.remove);
router.patch('/:id/publish', adminAuth, quizController.togglePublish);
router.patch('/:id/feature', adminAuth, quizController.toggleFeature);

// Question management (admin)
router.get('/:id/questions', adminAuth, quizController.getQuestions);
router.post('/:id/questions', adminAuth, questionValidator, validate, quizController.addQuestion);
router.put('/:id/questions/bulk', adminAuth, bulkQuestionsValidator, validate, quizController.bulkUpdateQuestions);
router.put('/:quizId/questions/:questionId', adminAuth, questionValidator, validate, quizController.updateQuestion);
router.delete('/:quizId/questions/:questionId', adminAuth, quizController.deleteQuestion);

module.exports = router;
