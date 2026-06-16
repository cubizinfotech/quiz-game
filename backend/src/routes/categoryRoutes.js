const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const adminAuth = require('../middleware/adminAuth');
const validate = require('../middleware/validate');
const { categoryValidator } = require('../validators/categoryValidator');

router.get('/', categoryController.getAll);
router.get('/:slug', categoryController.getBySlug);

router.post('/', adminAuth, categoryValidator, validate, categoryController.create);
router.put('/:id', adminAuth, categoryValidator, validate, categoryController.update);
router.delete('/:id', adminAuth, categoryController.remove);

module.exports = router;
