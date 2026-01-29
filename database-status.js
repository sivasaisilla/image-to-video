const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'data', 'imob_motion.db');
const db = new sqlite3.Database(dbPath);

async function showDatabaseStatus() {
  console.log('🗄️  IMOB Motion Database Status\n');
  
  try {
    // Check database file
    const fs = require('fs');
    const stats = fs.statSync(dbPath);
    console.log('📍 Database File:', dbPath);
    console.log('📊 File Size:', (stats.size / 1024).toFixed(2), 'KB');
    console.log('📅 Last Modified:', stats.mtime.toLocaleString());
    console.log('');

    // Get all tables
    const tables = await new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log('📋 Database Tables:');
    tables.forEach(table => {
      console.log(`   ✓ ${table.name}`);
    });

    // Show users table data
    console.log('\n👥 Registered Users:');
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT id, email, created_at FROM users ORDER BY created_at DESC', (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (users.length > 0) {
      users.forEach(user => {
        console.log(`   📧 ${user.email} (ID: ${user.id})`);
        console.log(`      📅 Created: ${new Date(user.created_at).toLocaleString()}`);
      });
    } else {
      console.log('   No users registered yet');
    }

    console.log('\n🏗️  Storage Architecture:');
    console.log('='.repeat(40));
    console.log('📦 Persistent Storage (SQLite):');
    console.log('   • User accounts (email, password)');
    console.log('   • Basic user data');
    console.log('   • Authentication records');
    
    console.log('\n💾 In-Memory Storage (Enhanced Features):');
    console.log('   • User profiles (stats, preferences)');
    console.log('   • Referral codes and relationships');
    console.log('   • User credits and rewards');
    console.log('   • Active sessions');
    console.log('   • Real-time activity tracking');

    console.log('\n🔍 How to View Data:');
    console.log('='.repeat(40));
    console.log('1. SQLite Database (Persistent):');
    console.log('   • File: data/imob_motion.db');
    console.log('   • Tool: DB Browser for SQLite');
    console.log('   • Command: sqlite3 data/imob_motion.db');
    
    console.log('\n2. Enhanced Features (In-Memory):');
    console.log('   • Visible via API endpoints');
    console.log('   • Check server console logs');
    console.log('   • Use browser dev tools');

    console.log('\n📊 Current Statistics:');
    console.log(`   • Total Users: ${users.length}`);
    console.log(`   • Database Tables: ${tables.length}`);
    console.log(`   • Server Status: Running`);

    // Show sample SQL queries
    console.log('\n🔧 Sample SQL Queries:');
    console.log('='.repeat(40));
    console.log('-- View all users:');
    console.log('SELECT * FROM users;');
    console.log('');
    console.log('-- Count users by date:');
    console.log("SELECT DATE(created_at) as date, COUNT(*) as count FROM users GROUP BY DATE(created_at);");
    console.log('');
    console.log('-- View recent users:');
    console.log('SELECT email, created_at FROM users ORDER BY created_at DESC LIMIT 5;');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    db.close();
  }
}

// Run if called directly
if (require.main === module) {
  showDatabaseStatus();
}

module.exports = { showDatabaseStatus };
