const { body } = require('express-validator');

const categoryValidator = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 100 }).withMessage('Name max 100 chars'),
  body('description').optional().trim(),
  body('icon').optional().trim().isLength({ max: 10 }).withMessage('Icon max 10 chars'),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex code'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

module.exports = { categoryValidator };
