const { pool, mapRow } = require('../config/database');
const slugify = require('slugify');

const generateSlug = (name) =>
  slugify(name, { lower: true, strict: true, trim: true });

const formatCategory = (row) => ({
  ...mapRow(row),
  isActive: !!row.is_active,
});

const getAll = async (activeOnly = false) => {
  const where = activeOnly ? 'WHERE c.is_active = 1' : '';
  const [rows] = await pool.query(`
    SELECT c.*,
      COUNT(CASE WHEN q.is_published = 1 THEN q.id ELSE NULL END) AS quiz_count
    FROM categories c
    LEFT JOIN quizzes q ON q.category_id = c.id
    ${where}
    GROUP BY c.id
    ORDER BY c.name ASC
  `);
  return rows.map((row) => {
    const { quizCount, ...rest } = { ...formatCategory(row), quizCount: row.quiz_count };
    return { ...rest, _count: { quizzes: Number(row.quiz_count) } };
  });
};

const getBySlug = async (slug) => {
  const [[catRow]] = await pool.query(
    'SELECT * FROM categories WHERE slug = ? LIMIT 1',
    [slug]
  );
  if (!catRow) {
    const err = new Error('Category not found');
    err.statusCode = 404;
    throw err;
  }

  const [quizRows] = await pool.query(`
    SELECT q.*, COUNT(qq.id) AS question_count
    FROM quizzes q
    LEFT JOIN questions qq ON qq.quiz_id = q.id
    WHERE q.category_id = ? AND q.is_published = 1
    GROUP BY q.id
    ORDER BY q.created_at DESC
  `, [catRow.id]);

  const quizzes = quizRows.map((row) => {
    const mapped = mapRow(row);
    return {
      ...mapped,
      isPublished: !!row.is_published,
      isFeatured: !!row.is_featured,
      _count: { questions: Number(row.question_count) },
    };
  });

  return { ...formatCategory(catRow), quizzes };
};

const create = async (data) => {
  const slug = generateSlug(data.name);
  const [result] = await pool.query(
    'INSERT INTO categories (name, slug, description, icon, color, is_active) VALUES (?, ?, ?, ?, ?, ?)',
    [data.name, slug, data.description || null, data.icon || null, data.color || '#2563EB', data.isActive !== undefined ? data.isActive : true]
  );
  const [[row]] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
  return formatCategory(row);
};

const update = async (id, data) => {
  const [[existing]] = await pool.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [Number(id)]);
  if (!existing) {
    const err = new Error('Category not found');
    err.statusCode = 404;
    throw err;
  }

  const slug = data.name && data.name !== existing.name ? generateSlug(data.name) : existing.slug;

  const fields = [];
  const values = [];
  if (data.name !== undefined)        { fields.push('name = ?');        values.push(data.name); }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
  if (data.icon !== undefined)        { fields.push('icon = ?');        values.push(data.icon); }
  if (data.color !== undefined)       { fields.push('color = ?');       values.push(data.color); }
  if (data.isActive !== undefined)    { fields.push('is_active = ?');   values.push(data.isActive); }
  fields.push('slug = ?');   values.push(slug);
  fields.push('updated_at = NOW()');

  await pool.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, [...values, Number(id)]);
  const [[row]] = await pool.query('SELECT * FROM categories WHERE id = ?', [Number(id)]);
  return formatCategory(row);
};

const remove = async (id) => {
  const [[existing]] = await pool.query('SELECT id FROM categories WHERE id = ? LIMIT 1', [Number(id)]);
  if (!existing) {
    const err = new Error('Category not found');
    err.statusCode = 404;
    throw err;
  }
  await pool.query('DELETE FROM categories WHERE id = ?', [Number(id)]);
};

module.exports = { getAll, getBySlug, create, update, remove };
