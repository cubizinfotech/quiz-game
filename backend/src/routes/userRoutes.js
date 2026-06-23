const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const adminAuth = require('../middleware/adminAuth');
const userAuth = require('../middleware/userAuth');
const validate = require('../middleware/validate');
const { registerValidator, loginValidator } = require('../validators/userAuthValidator');

// Guest session (no auth required)
router.post('/guest', userController.createGuest);

// User authentication
router.post('/register', registerValidator, validate, userController.register);
router.post('/login', loginValidator, validate, userController.login);
router.get('/me', userAuth, userController.getMe);

// Public leaderboard
router.get('/leaderboard', userController.getLeaderboard);

// Authenticated user history
router.get('/history', userAuth, userController.getUserHistory);

// Admin-only
router.get('/', adminAuth, userController.getAll);

module.exports = router;
