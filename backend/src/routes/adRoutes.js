const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const adminAuth = require('../middleware/adminAuth');
const validate = require('../middleware/validate');
const { adValidator } = require('../validators/adValidator');

router.get('/', adController.getActive);
router.get('/position/:position', adController.getByPosition);

router.get('/admin/all', adminAuth, adController.getAll);
router.post('/', adminAuth, adValidator, validate, adController.create);
router.put('/:id', adminAuth, adValidator, validate, adController.update);
router.delete('/:id', adminAuth, adController.remove);

module.exports = router;
