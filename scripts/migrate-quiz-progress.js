/**
 * Migration Script: Add quiz_progress table
 * 
 * Creates the quiz_progress table for tracking incomplete quiz attempts.
 * Run with: node scripts/migrate-quiz-progress.js
 */

const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let sql;
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in .env');
    }

    sql = postgres(process.env.DATABASE_URL);

    console.log('📦 Reading migration file...');
    const migrationPath = path.join(__dirname, '../src/db/migrations/0012_add_quiz_progress.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('🚀 Running migration...');
    console.log('   This will create the quiz_progress table for tracking incomplete quiz attempts.\n');

    // Parse statements more carefully (handle multi-line statements)
    const statements = [];
    let currentStatement = '';
    
    const lines = migrationSQL.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('--')) {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // If line ends with semicolon, we have a complete statement
      if (trimmed.endsWith(';')) {
        const stmt = currentStatement.trim();
        if (stmt) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      try {
        await sql.unsafe(statement);
        console.log(`✓ [${i + 1}/${statements.length}] Executed statement`);
      } catch (error) {
        // Ignore "already exists" errors for idempotency
        const errorMsg = error.message.toLowerCase();
        const errorCode = error.code;
        
        if (errorMsg.includes('already exists') || 
            errorCode === '42P07' || // duplicate_table
            errorCode === '42710' || // duplicate_object
            (errorCode === '42P01' && errorMsg.includes('index'))) { // relation does not exist for indexes (they'll be created after table)
          console.log(`⚠ [${i + 1}/${statements.length}] Skipped: ${error.message.split('\n')[0]}`);
        } else {
          console.error(`[${i + 1}/${statements.length}] Failed:`, error.message);
          throw error;
        }
      }
    }

    console.log('\nMigration completed successfully!');
    console.log('Done!');

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Error running migration:', error);
    if (sql) await sql.end();
    process.exit(1);
  }
}

runMigration();

