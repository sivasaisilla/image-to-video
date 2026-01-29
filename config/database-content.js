const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '..', 'data', 'imob_motion.db');
const db = new sqlite3.Database(dbPath);

// Content database operations
const contentOperations = {
  // Create content record
  async createContent(contentData) {
    return new Promise((resolve, reject) => {
      const {
        userId,
        title,
        description,
        contentType,
        fileUrl,
        thumbnailUrl,
        fileSize,
        duration,
        format,
        locationName,
        latitude,
        longitude,
        address,
        city,
        country
      } = contentData;

      db.run(`
        INSERT INTO user_content (
          user_id, title, description, content_type, file_url, thumbnail_url,
          file_size, duration, format, location_name, latitude, longitude,
          address, city, country, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processing')
      `, [
        userId, title, description, contentType, fileUrl, thumbnailUrl,
        fileSize, duration, format, locationName, latitude, longitude,
        address, city, country
      ], function(err) {
        if (err) reject(err);
        else resolve({
          id: this.lastID,
          ...contentData,
          status: 'processing',
          createdAt: new Date().toISOString()
        });
      });
    });
  },

  // Get content by ID
  async getContentById(contentId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM user_content WHERE id = ?',
        [contentId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  },

  // Get user's content
  async getUserContent(userId, contentType = null, limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM user_content WHERE user_id = ?';
      const params = [userId];

      if (contentType) {
        query += ' AND content_type = ?';
        params.push(contentType);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Update content status
  async updateContentStatus(contentId, status) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE user_content SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, contentId],
        function(err) {
          if (err) reject(err);
          else resolve({ success: true });
        }
      );
    });
  },

  // Delete content
  async deleteContent(contentId, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM user_content WHERE id = ? AND user_id = ?',
        [contentId, userId],
        function(err) {
          if (err) reject(err);
          else resolve({ success: true, changes: this.changes });
        }
      );
    });
  },

  // Get content statistics
  async getContentStats(userId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_content,
          COUNT(CASE WHEN content_type = 'video' THEN 1 END) as video_count,
          COUNT(CASE WHEN content_type = 'image' THEN 1 END) as image_count,
          COALESCE(SUM(CASE WHEN content_type = 'video' THEN duration END), 0) as total_duration,
          COALESCE(SUM(file_size), 0) as total_size
        FROM user_content 
        WHERE user_id = ?
      `, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Search content
  async searchContent(userId, searchTerm, contentType = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT * FROM user_content 
        WHERE user_id = ? AND (title LIKE ? OR description LIKE ?)
      `;
      const params = [userId, `%${searchTerm}%`, `%${searchTerm}%`];

      if (contentType) {
        query += ' AND content_type = ?';
        params.push(contentType);
      }

      query += ' ORDER BY created_at DESC LIMIT 20';

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

// Initialize content table if not exists
function initializeContentTable() {
  return new Promise((resolve, reject) => {
    // Check if user_content table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='user_content'", (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (!row) {
        // Create the user_content table
        db.run(`
          CREATE TABLE user_content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            content_type VARCHAR(20) NOT NULL,
            file_url VARCHAR(500) NOT NULL,
            thumbnail_url VARCHAR(500),
            file_size BIGINT,
            duration INTEGER,
            format VARCHAR(50),
            location_name VARCHAR(255),
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            address TEXT,
            city VARCHAR(100),
            country VARCHAR(100),
            status VARCHAR(20) DEFAULT 'processing',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) reject(err);
          else {
            console.log('✅ Content table created successfully');
            resolve();
          }
        });
      } else {
        console.log('✅ Content table already exists');
        resolve();
      }
    });
  });
}

module.exports = { contentOperations, initializeContentTable };
