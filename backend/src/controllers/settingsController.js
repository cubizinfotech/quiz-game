const settingsService = require('../services/settingsService');

const getAll = async (req, res, next) => {
  try {
    const settings = await settingsService.getAll();
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const settings = await settingsService.update(req.body);
    res.json({ success: true, message: 'Settings updated', data: settings });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, update };
