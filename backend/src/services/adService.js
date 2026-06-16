const { pool, mapRows, mapRow } = require('../config/database');

const formatAd = (row) => ({
  ...mapRow(row),
  isActive: !!row.is_active,
});

const getActive = async () => {
  const [rows] = await pool.query(
    'SELECT * FROM ads WHERE is_active = 1 ORDER BY position ASC'
  );
  return rows.map(formatAd);
};

const getByPosition = async (position) => {
  const [rows] = await pool.query(
    'SELECT * FROM ads WHERE is_active = 1 AND position = ?',
    [position]
  );
  return rows.map(formatAd);
};

const getAll = async () => {
  const [rows] = await pool.query('SELECT * FROM ads ORDER BY created_at DESC');
  return rows.map(formatAd);
};

const create = async (data) => {
  const [result] = await pool.query(
    'INSERT INTO ads (name, position, ad_type, content, is_active, delay_seconds, frequency) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      data.name,
      data.position,
      data.adType,
      data.content,
      data.isActive !== undefined ? data.isActive : true,
      data.delaySeconds || 0,
      data.frequency || 1,
    ]
  );
  const [[row]] = await pool.query('SELECT * FROM ads WHERE id = ?', [result.insertId]);
  return formatAd(row);
};

const update = async (id, data) => {
  const [[existing]] = await pool.query('SELECT id FROM ads WHERE id = ? LIMIT 1', [Number(id)]);
  if (!existing) {
    const err = new Error('Ad not found');
    err.statusCode = 404;
    throw err;
  }

  const fields = [];
  const values = [];
  if (data.name !== undefined)         { fields.push('name = ?');          values.push(data.name); }
  if (data.position !== undefined)     { fields.push('position = ?');      values.push(data.position); }
  if (data.adType !== undefined)       { fields.push('ad_type = ?');       values.push(data.adType); }
  if (data.content !== undefined)      { fields.push('content = ?');       values.push(data.content); }
  if (data.isActive !== undefined)     { fields.push('is_active = ?');     values.push(data.isActive); }
  if (data.delaySeconds !== undefined) { fields.push('delay_seconds = ?'); values.push(data.delaySeconds); }
  if (data.frequency !== undefined)    { fields.push('frequency = ?');     values.push(data.frequency); }
  fields.push('updated_at = NOW()');

  await pool.query(`UPDATE ads SET ${fields.join(', ')} WHERE id = ?`, [...values, Number(id)]);
  const [[row]] = await pool.query('SELECT * FROM ads WHERE id = ?', [Number(id)]);
  return formatAd(row);
};

const remove = async (id) => {
  const [[existing]] = await pool.query('SELECT id FROM ads WHERE id = ? LIMIT 1', [Number(id)]);
  if (!existing) {
    const err = new Error('Ad not found');
    err.statusCode = 404;
    throw err;
  }
  await pool.query('DELETE FROM ads WHERE id = ?', [Number(id)]);
};

module.exports = { getActive, getByPosition, getAll, create, update, remove };
