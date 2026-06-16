const { pool, mapRow } = require('../config/database');

const formatFact = (row) => ({
  ...mapRow(row),
  isActive: !!row.is_active,
});

const getActive = async () => {
  const [rows] = await pool.query(
    'SELECT * FROM fun_facts WHERE is_active = 1 ORDER BY created_at DESC'
  );
  return rows.map(formatFact);
};

const getAll = async () => {
  const [rows] = await pool.query('SELECT * FROM fun_facts ORDER BY created_at DESC');
  return rows.map(formatFact);
};

const create = async (data) => {
  const [result] = await pool.query(
    'INSERT INTO fun_facts (title, description, image, is_active) VALUES (?, ?, ?, ?)',
    [data.title, data.description, data.image || null, data.isActive !== undefined ? data.isActive : true]
  );
  const [[row]] = await pool.query('SELECT * FROM fun_facts WHERE id = ?', [result.insertId]);
  return formatFact(row);
};

const update = async (id, data) => {
  const [[existing]] = await pool.query('SELECT id FROM fun_facts WHERE id = ? LIMIT 1', [Number(id)]);
  if (!existing) {
    const err = new Error('Fun fact not found');
    err.statusCode = 404;
    throw err;
  }

  const fields = [];
  const values = [];
  if (data.title !== undefined)       { fields.push('title = ?');       values.push(data.title); }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
  if (data.image !== undefined)       { fields.push('image = ?');       values.push(data.image); }
  if (data.isActive !== undefined)    { fields.push('is_active = ?');   values.push(data.isActive); }
  fields.push('updated_at = NOW()');

  await pool.query(`UPDATE fun_facts SET ${fields.join(', ')} WHERE id = ?`, [...values, Number(id)]);
  const [[row]] = await pool.query('SELECT * FROM fun_facts WHERE id = ?', [Number(id)]);
  return formatFact(row);
};

const remove = async (id) => {
  const [[existing]] = await pool.query('SELECT id FROM fun_facts WHERE id = ? LIMIT 1', [Number(id)]);
  if (!existing) {
    const err = new Error('Fun fact not found');
    err.statusCode = 404;
    throw err;
  }
  await pool.query('DELETE FROM fun_facts WHERE id = ?', [Number(id)]);
};

module.exports = { getActive, getAll, create, update, remove };
