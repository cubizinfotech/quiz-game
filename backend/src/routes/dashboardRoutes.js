const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const adminAuth = require('../middleware/adminAuth');

router.get('/stats', adminAuth, dashboardController.getStats);
router.get('/recent-attempts', adminAuth, dashboardController.getRecentAttempts);

module.exports = router;
