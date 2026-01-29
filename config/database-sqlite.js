const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create SQLite database connection
const dbPath = path.join(__dirname, '..', 'data', 'imob_motion.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT,
          phone TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
          return;
        }
        
        // Add name and phone columns if they don't exist (for existing databases)
        db.run(`
          ALTER TABLE users ADD COLUMN name TEXT
        `, (err) => {
          // Ignore error if column already exists
          if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding name column:', err);
          }
          
          // Add phone column
          db.run(`
            ALTER TABLE users ADD COLUMN phone TEXT
          `, (err) => {
            // Ignore error if column already exists
            if (err && !err.message.includes('duplicate column name')) {
              console.error('Error adding phone column:', err);
            }
            
            // Create index for faster email lookups
            db.run(`
              CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
            `, (err) => {
              if (err) {
                console.error('Error creating email index:', err);
                reject(err);
                return;
              }
              
              console.log('✅ SQLite database initialized successfully');
              resolve();
            });
          });
        });
      });
    });
  });
}

// Helper functions for database operations
const dbOperations = {
  // Check if email exists
  async checkEmail(email) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  },

  // Create new user
  async createUser(email, hashedPassword, name, phone) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (email, password, name, phone) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, phone],
        function(err) {
          if (err) reject(err);
          else resolve({
            id: this.lastID,
            email,
            name,
            phone,
            created_at: new Date().toISOString()
          });
        }
      );
    });
  },

  // Find user by email
  async findUserByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, email, password, name, phone FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }
};

module.exports = { db, initializeDatabase, dbOperations };
