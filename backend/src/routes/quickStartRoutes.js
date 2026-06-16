const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const adminAuth = require('../middleware/adminAuth');
const userAuth = require('../middleware/userAuth');
const ctrl = require('../controllers/quickStartController');

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/', ctrl.getActive);

router.post(
  '/complete',
  userAuth,
  [
    body('quizId').isInt({ min: 1 }),
    body('correctAnswers').isInt({ min: 0, max: 2 }),
  ],
  validate,
  ctrl.complete
);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get('/admin', adminAuth, ctrl.adminGet);

router.put(
  '/admin',
  adminAuth,
  [
    body('isActive').isBoolean(),
    body('rewardCoins').isInt({ min: 0 }),
    body('questions').isArray({ min: 1, max: 2 }),
    body('questions.*.questionText').trim().notEmpty(),
    body('questions.*.optionA').trim().notEmpty(),
    body('questions.*.optionB').trim().notEmpty(),
    body('questions.*.optionC').trim().notEmpty(),
    body('questions.*.optionD').trim().notEmpty(),
    body('questions.*.correctAnswer').isIn(['A', 'B', 'C', 'D']),
    body('questions.*.explanation').optional().trim(),
  ],
  validate,
  ctrl.adminSave
);

router.patch('/admin/toggle', adminAuth, ctrl.adminToggle);

module.exports = router;
