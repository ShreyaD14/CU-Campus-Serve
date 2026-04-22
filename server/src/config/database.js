const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '../../database');
const DB_PATH = path.join(DB_DIR, 'campusserve.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone VARCHAR(15) UNIQUE NOT NULL,
      name VARCHAR(100),
      uid VARCHAR(50),
      role VARCHAR(20) DEFAULT 'user',
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clusters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      icon VARCHAR(50)
    );

    CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cluster_id INTEGER REFERENCES clusters(id),
      vendor_id INTEGER REFERENCES users(id),
      name VARCHAR(100) NOT NULL,
      description TEXT,
      image_url TEXT,
      cuisine_tags TEXT,
      rating REAL DEFAULT 4.0,
      review_count INTEGER DEFAULT 0,
      is_open BOOLEAN DEFAULT 1,
      avg_delivery_time INTEGER DEFAULT 20,
      min_order REAL DEFAULT 50,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_id INTEGER REFERENCES shops(id),
      name VARCHAR(100) NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category VARCHAR(50),
      image_url TEXT,
      is_veg BOOLEAN DEFAULT 1,
      is_available BOOLEAN DEFAULT 1,
      is_bestseller BOOLEAN DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(20) NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number VARCHAR(20) UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id),
      shop_id INTEGER REFERENCES shops(id),
      delivery_location_id INTEGER REFERENCES locations(id),
      delivery_type VARCHAR(20) NOT NULL,
      status VARCHAR(30) DEFAULT 'placed',
      total_amount REAL NOT NULL,
      delivery_fee REAL DEFAULT 20,
      delivery_agent_id INTEGER REFERENCES users(id),
      estimated_time INTEGER DEFAULT 30,
      special_instructions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id),
      menu_item_id INTEGER REFERENCES menu_items(id),
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      item_name VARCHAR(100)
    );

    CREATE TABLE IF NOT EXISTS delivery_agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) UNIQUE,
      vehicle_type VARCHAR(30) DEFAULT 'bicycle',
      is_available BOOLEAN DEFAULT 1,
      current_latitude REAL DEFAULT 30.7714,
      current_longitude REAL DEFAULT 76.5762,
      total_deliveries INTEGER DEFAULT 0,
      rating REAL DEFAULT 4.5
    );

    CREATE TABLE IF NOT EXISTS otps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone VARCHAR(15) NOT NULL,
      otp VARCHAR(6) NOT NULL,
      expires_at DATETIME NOT NULL,
      used BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS seed_meta (
      key VARCHAR(50) PRIMARY KEY,
      value TEXT
    );
  `);

  console.log('✅ Database initialized at:', DB_PATH);
}

module.exports = { db, initializeDatabase };
