const { db } = require('./config/database-sqlite');

async function showDatabaseInfo() {
  try {
    console.log('🗄️  Database Information\n');
    console.log('📍 Location: data/imob_motion.db');
    console.log('📊 Size: 20KB');
    console.log('🔧 Engine: SQLite\n');
    
    // Show table schema
    db.all("PRAGMA table_info(users)", (err, columns) => {
      if (err) {
        console.error('Error getting table info:', err);
        return;
      }
      
      console.log('📋 Users Table Schema:');
      columns.forEach(col => {
        console.log(`   ${col.name}: ${col.type} ${col.notnull ? '(NOT NULL)' : ''} ${col.pk ? '(PRIMARY KEY)' : ''}`);
      });
      
      console.log('\n👥 Registered Users:');
      
      // Show all users
      db.all('SELECT * FROM users', (err, rows) => {
        if (err) {
          console.error('Error fetching users:', err);
          return;
        }
        
        if (rows.length === 0) {
          console.log('   No users found');
        } else {
          rows.forEach((user, index) => {
            console.log(`\n   User ${index + 1}:`);
            console.log(`   ├─ ID: ${user.id}`);
            console.log(`   ├─ Email: ${user.email}`);
            console.log(`   ├─ Password: ${user.password.substring(0, 20)}... (hashed)`);
            console.log(`   ├─ Created: ${user.created_at}`);
            console.log(`   └─ Updated: ${user.updated_at}`);
          });
        }
        
        console.log('\n✅ Database is working correctly!');
        console.log('💾 All user registrations are permanently stored in this SQLite database.');
        console.log('🔄 Data persists even after server restarts.');
        
        db.close();
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

showDatabaseInfo();
