const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const adminAuth = require('../middleware/adminAuth');
const validate = require('../middleware/validate');
const { settingsValidator } = require('../validators/settingsValidator');

router.get('/', settingsController.getAll);
router.put('/', adminAuth, settingsValidator, validate, settingsController.update);

module.exports = router;
