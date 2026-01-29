const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'data', 'imob_motion.db');
const db = new sqlite3.Database(dbPath);

async function viewDatabase() {
  console.log('🗄️  IMOB Motion Database Viewer\n');
  console.log('📍 Database Location:', dbPath);
  console.log('📊 Database Size:', (require('fs').statSync(dbPath).size / 1024).toFixed(2), 'KB\n');

  // Get all tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('❌ Error getting tables:', err);
      return;
    }

    console.log('📋 Available Tables:');
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.name}`);
    });

    console.log('\n' + '='.repeat(50) + '\n');

    // View each table
    let tableIndex = 0;
    
    function viewNextTable() {
      if (tableIndex >= tables.length) {
        console.log('\n🎉 Database viewing completed!');
        db.close();
        return;
      }

      const tableName = tables[tableIndex].name;
      console.log(`📊 Table: ${tableName}`);
      console.log('-'.repeat(30));

      // Get table structure
      db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
        if (err) {
          console.error('❌ Error getting columns:', err);
          tableIndex++;
          viewNextTable();
          return;
        }

        // Display columns
        console.log('📝 Columns:');
        columns.forEach(col => {
          console.log(`   • ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''}`);
        });

        // Get row count
        db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, result) => {
          if (err) {
            console.error('❌ Error getting count:', err);
            tableIndex++;
            viewNextTable();
            return;
          }

          console.log(`📈 Row Count: ${result.count}`);

          // Get sample data (first 5 rows)
          if (result.count > 0) {
            db.all(`SELECT * FROM ${tableName} LIMIT 5`, (err, rows) => {
              if (err) {
                console.error('❌ Error getting data:', err);
              } else if (rows.length > 0) {
                console.log('📄 Sample Data:');
                rows.forEach((row, index) => {
                  console.log(`   Row ${index + 1}:`, JSON.stringify(row, null, 6));
                });
              } else {
                console.log('📄 No data in table');
              }
              
              console.log('\n' + '='.repeat(50) + '\n');
              tableIndex++;
              viewNextTable();
            });
          } else {
            console.log('📄 No data in table\n');
            console.log('='.repeat(50) + '\n');
            tableIndex++;
            viewNextTable();
          }
        });
      });
    }

    viewNextTable();
  });
}

// Also create a function to run SQL queries
function runQuery(query) {
  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Main execution
if (require.main === module) {
  viewDatabase();
}

module.exports = { viewDatabase, runQuery, db };
