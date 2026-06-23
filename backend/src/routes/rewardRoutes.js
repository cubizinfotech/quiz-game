const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const userAuth = require('../middleware/userAuth');
const { claimReward, adBonus } = require('../controllers/rewardController');

router.post(
  '/claim',
  userAuth,
  [
    body('attemptId').isInt({ min: 1 }).withMessage('Valid attempt ID required'),
    body('doubled').optional().isBoolean(),
  ],
  validate,
  claimReward
);

router.post('/ad-bonus', userAuth, adBonus);

module.exports = router;
