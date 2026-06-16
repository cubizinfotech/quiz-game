const adService = require('../services/adService');

const getActive = async (req, res, next) => {
  try {
    const ads = await adService.getActive();
    res.json({ success: true, data: ads });
  } catch (err) {
    next(err);
  }
};

const getByPosition = async (req, res, next) => {
  try {
    const ads = await adService.getByPosition(req.params.position);
    res.json({ success: true, data: ads });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const ads = await adService.getAll();
    res.json({ success: true, data: ads });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const ad = await adService.create(req.body);
    res.status(201).json({ success: true, message: 'Ad created', data: ad });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const ad = await adService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Ad updated', data: ad });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await adService.remove(req.params.id);
    res.json({ success: true, message: 'Ad deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getActive, getByPosition, getAll, create, update, remove };
