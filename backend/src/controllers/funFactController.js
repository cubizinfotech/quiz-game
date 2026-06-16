const funFactService = require('../services/funFactService');

const getActive = async (req, res, next) => {
  try {
    const facts = await funFactService.getActive();
    res.json({ success: true, data: facts });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const facts = await funFactService.getAll();
    res.json({ success: true, data: facts });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const fact = await funFactService.create(req.body);
    res.status(201).json({ success: true, message: 'Fun fact created', data: fact });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const fact = await funFactService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Fun fact updated', data: fact });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await funFactService.remove(req.params.id);
    res.json({ success: true, message: 'Fun fact deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getActive, getAll, create, update, remove };
