const { body } = require('express-validator');

const quizValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }).withMessage('Title max 255 chars'),
  body('categoryId').isInt({ min: 1 }).withMessage('Valid category ID is required'),
  body('rewardPoints').optional().isInt({ min: 0 }).withMessage('Reward points must be a non-negative integer'),
  body('rewardCoins').optional().isInt({ min: 0 }).withMessage('Reward coins must be a non-negative integer'),
  body('timeLimit').optional().isInt({ min: 0 }).withMessage('Time limit must be a non-negative integer'),
  body('description').optional().trim(),
  body('isPublished').optional().isBoolean(),
  body('isFeatured').optional().isBoolean(),
];

const questionValidator = [
  body('questionText').trim().notEmpty().withMessage('Question text is required'),
  body('optionA').trim().notEmpty().withMessage('Option A is required'),
  body('optionB').trim().notEmpty().withMessage('Option B is required'),
  body('optionC').trim().notEmpty().withMessage('Option C is required'),
  body('optionD').trim().notEmpty().withMessage('Option D is required'),
  body('correctAnswer').isIn(['A', 'B', 'C', 'D']).withMessage('Correct answer must be A, B, C, or D'),
  body('explanation').optional().trim(),
  body('orderIndex').optional().isInt({ min: 0 }),
];

const bulkQuestionsValidator = [
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questions.*.questionText').trim().notEmpty().withMessage('Question text is required'),
  body('questions.*.optionA').trim().notEmpty().withMessage('Option A is required'),
  body('questions.*.optionB').trim().notEmpty().withMessage('Option B is required'),
  body('questions.*.optionC').trim().notEmpty().withMessage('Option C is required'),
  body('questions.*.optionD').trim().notEmpty().withMessage('Option D is required'),
  body('questions.*.correctAnswer').isIn(['A', 'B', 'C', 'D']).withMessage('Correct answer must be A, B, C, or D'),
];

const attemptValidator = [
  body('answers').isArray({ min: 1 }).withMessage('Answers array is required'),
  body('answers.*.questionId').isInt({ min: 1 }).withMessage('Valid question ID required'),
  body('answers.*.selectedAnswer').isIn(['A', 'B', 'C', 'D']).withMessage('Selected answer must be A, B, C, or D'),
  body('timeTaken').optional().isInt({ min: 0 }),
];

module.exports = { quizValidator, questionValidator, bulkQuestionsValidator, attemptValidator };
