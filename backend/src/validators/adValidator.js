const { body } = require('express-validator');

const ALL_POSITIONS = [
  'header',
  'middle',
  'footer',
  'welcome_popup',
  'before_quiz',
  'between_questions',
  'wrong_answer',
  'quiz_complete',
  'rewarded_video',
];

const adValidator = [
  body('name').trim().notEmpty().withMessage('Ad name is required').isLength({ max: 255 }),
  body('position').isIn(ALL_POSITIONS).withMessage('Invalid ad position'),
  body('adType').isIn(['adsense', 'html']).withMessage('Ad type must be adsense or html'),
  body('content').trim().notEmpty().withMessage('Ad content is required'),
  body('isActive').optional().isBoolean(),
  body('delaySeconds')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('delaySeconds must be 0–120'),
  body('frequency')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('frequency must be 1–100'),
];

module.exports = { adValidator };
