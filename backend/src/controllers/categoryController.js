const categoryService = require('../services/categoryService');

const getAll = async (req, res, next) => {
  try {
    const activeOnly = req.query.active === 'true';
    const categories = await categoryService.getAll(activeOnly);
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

const getBySlug = async (req, res, next) => {
  try {
    const category = await categoryService.getBySlug(req.params.slug);
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const category = await categoryService.create(req.body);
    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const category = await categoryService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Category updated', data: category });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await categoryService.remove(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getBySlug, create, update, remove };
