const adminService = require('../services/adminService');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await adminService.login(email, password);
    res.json({ success: true, message: 'Login successful', data: result });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const admin = await adminService.getById(req.admin.id);
    res.json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe };
