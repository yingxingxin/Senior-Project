const { readFileSync } = require('fs');
const { join } = require('path');
const postgres = require('postgres');
require('dotenv').config();

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    console.log('📦 Reading migration file...');
    const migrationPath = join(__dirname, '../src/db/migrations/0016_add_ai_quiz_support.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('🚀 Running migration...');
    console.log('   This will add is_ai_generated and owner_user_id columns to the quizzes table.\n');

    // Parse statements (handle DO blocks and regular statements)
    const statements = [];
    let currentStatement = '';
    let inDoBlock = false;
    
    const lines = migrationSQL.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('--')) {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // Check if we're entering or exiting a DO block
      if (trimmed.startsWith('DO $$')) {
        inDoBlock = true;
      }
      if (inDoBlock && trimmed.endsWith('$$;')) {
        inDoBlock = false;
        statements.push(currentStatement.trim());
        currentStatement = '';
      } else if (!inDoBlock && trimmed.endsWith(';')) {
        statements.push(currentStatement.trim());
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
            errorCode === '42P16' || // invalid_table_definition (column already exists)
            (errorCode === '42P01' && errorMsg.includes('index'))) {
          console.log(`⚠ [${i + 1}/${statements.length}] Skipped: ${error.message.split('\n')[0]}`);
        } else {
          console.error(`✗ [${i + 1}/${statements.length}] Failed:`, error.message);
          throw error;
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('   Added is_ai_generated and owner_user_id columns to quizzes table.');

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migration:', error);
    if (sql) await sql.end();
    process.exit(1);
  }
}

runMigration();

