const { dbOperations } = require('./config/database-sqlite');

async function viewUsers() {
  try {
    console.log('📋 Checking database for registered users...\n');
    
    // Check if we can access the database
    const testUser = await dbOperations.checkEmail('test@example.com');
    console.log('Database connection: ✅ Working');
    
    // Try to get all users (we need to modify dbOperations to support this)
    const { db } = require('./config/database-sqlite');
    
    db.all('SELECT id, email, created_at FROM users', (err, rows) => {
      if (err) {
        console.error('Error fetching users:', err);
        return;
      }
      
      if (rows.length === 0) {
        console.log('📝 No users found in the database.');
      } else {
        console.log(`👥 Found ${rows.length} user(s) in the database:\n`);
        rows.forEach((user, index) => {
          console.log(`${index + 1}. ID: ${user.id}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Created: ${user.created_at}`);
          console.log('');
        });
      }
      
      db.close();
    });
    
  } catch (error) {
    console.error('❌ Error accessing database:', error.message);
  }
}

viewUsers();
