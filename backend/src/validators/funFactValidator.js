const { body } = require('express-validator');

const funFactValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('image').optional().trim(),
  body('isActive').optional().isBoolean(),
];

module.exports = { funFactValidator };
