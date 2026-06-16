const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const validate = require('../middleware/validate');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { loginValidator } = require('../validators/adminValidator');

router.post('/login', authRateLimiter, loginValidator, validate, adminController.login);
router.get('/me', adminAuth, adminController.getMe);

module.exports = router;
