const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_create_users_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Database setup completed successfully!');
    console.log('✅ Users table created with indexes and triggers');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase();
