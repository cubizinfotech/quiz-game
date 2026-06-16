const { body } = require('express-validator');

const settingsValidator = [
  body('site_name').optional().trim().isLength({ max: 100 }).withMessage('Site name max 100 chars'),
  body('logo').optional().trim(),
  body('favicon').optional().trim(),
  body('footer_text').optional().trim(),
];

module.exports = { settingsValidator };
