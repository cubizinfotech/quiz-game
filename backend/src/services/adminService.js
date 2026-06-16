const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { signToken } = require('../config/jwt');

const login = async (email, password) => {
  const [rows] = await pool.query('SELECT * FROM admins WHERE email = ? LIMIT 1', [email]);
  const admin = rows[0];
  if (!admin) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ id: admin.id, email: admin.email, role: 'admin' });
  return { token, admin: { id: admin.id, email: admin.email, name: admin.name } };
};

const getById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, email, name, created_at as createdAt FROM admins WHERE id = ? LIMIT 1',
    [id]
  );
  const admin = rows[0];
  if (!admin) {
    const err = new Error('Admin not found');
    err.statusCode = 404;
    throw err;
  }
  return admin;
};

module.exports = { login, getById };
