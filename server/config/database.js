const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Read SQL schema from file
const sqlSchema = fs.readFileSync(path.join(__dirname, 'db_schema.sql'), 'utf8');

const dbName = process.env.DB_NAME || 'coffee_monitoring';

// Initial connection config (without specifying database)
const initialDbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let promisePool = null;

// Initialize database and tables
const initializeDatabase = async () => {
  try {
    await createDatabase();
    await createDatabaseConnection();
    await createTables();
    await seedDefaultAdmin(); // Seed default admin after tables are ready
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  }
};

// Create database if it doesn't exist
const createDatabase = async () => {
  const initialPool = mysql.createPool(initialDbConfig).promise();
  try {
    await initialPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database "${dbName}" ensured.`);
  } catch (error) {
    console.error('Error creating database:', error.message);
    throw error;
  } finally {
    await initialPool.end();
  }
};

// Create connection pool with database selected
const createDatabaseConnection = async () => {
  if (pool) {
    try { await pool.end(); } catch (_) {}
  }

  pool = mysql.createPool({
    ...initialDbConfig,
    database: dbName
  });
  promisePool = pool.promise();
  console.log('Database connection established.');
};

// Get promise pool
const getPromisePool = () => {
  if (!promisePool) throw new Error('Database not initialized');
  return promisePool;
};

// Remove SQL comments
const stripSqlComments = (query) => {
  return query
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();
};

// Extract table name from CREATE TABLE query
const extractTableName = (query) => {
  const normalized = stripSqlComments(query);
  const match = normalized.match(/create\s+table\s+if\s+not\s+exists\s+[`"]?(\w+)[`"]?/i);
  return match ? match[1] : null;
};

// Create tables from SQL schema
const createTables = async () => {
  const queries = sqlSchema
    .split(';')
    .map(q => q.trim())
    .filter(q => q.length > 0)
    .filter(q => !q.toLowerCase().startsWith('create database') && !q.toLowerCase().startsWith('use'));

  for (const query of queries) {
    const normalized = stripSqlComments(query);
    if (!normalized) continue;

    if (normalized.toLowerCase().includes('create table if not exists')) {
      const tableName = extractTableName(normalized);
      if (tableName) {
        const [existsRows] = await getPromisePool().query('SHOW TABLES LIKE ?', [tableName]);
        if (existsRows.length > 0) continue; // Table already exists
        await getPromisePool().query(normalized);
        console.log(`Table "${tableName}" created.`);
        continue;
      }
    }

    // Execute other statements (indexes, foreign keys, etc.)
    try {
      await getPromisePool().query(normalized);
    } catch (error) {
      const msg = (error.message || '').toLowerCase();
      if (
        error.code === 'ER_DUP_KEYNAME' ||
        error.code === 'ER_CANT_DROP_FIELD_OR_KEY' ||
        msg.includes('duplicate key name') ||
        msg.includes('duplicate foreign key constraint') ||
        (msg.includes("can't create table") && msg.includes('errno: 121')) ||
        msg.includes('doesn\'t exist')
      ) {
        continue;
      }
      throw error;
    }
  }
};

// Seed default admin if none exists
const seedDefaultAdmin = async () => {
  try {
    const [rows] = await getPromisePool().query('SELECT COUNT(*) AS cnt FROM admins');
    const exists = rows && rows[0] && rows[0].cnt > 0;
    if (!exists) {
      const username = process.env.ADMIN_USERNAME || 'admin';
      const password = process.env.ADMIN_PASSWORD || 'admin123';
      const hash = await bcrypt.hash(password, 10);
      await getPromisePool().query(
        'INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)',
        [username, hash, 'admin']
      );
      console.log('Default admin user created.');
    }
  } catch (err) {
    console.error('Failed to seed admin user:', err.message);
  }
};

module.exports = {
  getPromisePool,
  initializeDatabase,
  createDatabase,
  createDatabaseConnection,
  createTables,
  seedDefaultAdmin
};
