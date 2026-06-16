const express = require('express');
const router = express.Router();
const funFactController = require('../controllers/funFactController');
const adminAuth = require('../middleware/adminAuth');
const validate = require('../middleware/validate');
const { funFactValidator } = require('../validators/funFactValidator');

router.get('/', funFactController.getActive);

router.get('/admin/all', adminAuth, funFactController.getAll);
router.post('/', adminAuth, funFactValidator, validate, funFactController.create);
router.put('/:id', adminAuth, funFactValidator, validate, funFactController.update);
router.delete('/:id', adminAuth, funFactController.remove);

module.exports = router;
