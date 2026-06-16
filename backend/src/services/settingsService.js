const { pool } = require('../config/database');

const getAll = async () => {
  const [rows] = await pool.query('SELECT `key`, value FROM settings');
  return rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
};

const update = async (data) => {
  for (const [key, value] of Object.entries(data)) {
    await pool.query(
      'INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?, updated_at = NOW()',
      [key, String(value), String(value)]
    );
  }
  return getAll();
};

module.exports = { getAll, update };
