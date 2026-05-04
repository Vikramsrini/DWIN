const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db;

function getDb() {
  if (db) return db;

  const dbPath = process.env.DB_PATH || './data/health.db';
  const fullPath = path.resolve(dbPath);
  const dir = path.dirname(fullPath);

  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(fullPath);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Initialize tables
  initTables(db);

  // Auto-migrate to add password column
  try {
    db.exec('ALTER TABLE users ADD COLUMN password TEXT;');
  } catch (err) {
    // Column already exists or table doesn't exist
  }

  return db;
}

function initTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      age INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('calories','sleep','hygiene','exercise')),
      value REAL NOT NULL,
      unit TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_activities_user_date
      ON activities(user_id, date);

    CREATE INDEX IF NOT EXISTS idx_activities_type
      ON activities(user_id, type);
  `);
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, closeDb };
