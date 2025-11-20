/**
 * Migration Script: Restructure Quizzes Table
 * 
 * This script applies the quizzes table restructure migration.
 * Run with: npm run db:migrate-quizzes
 */

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
    const migrationPath = join(__dirname, '../src/db/migrations/0011_restructure_quizzes.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('🚀 Running migration...');
    console.log('⚠️  WARNING: This will drop and recreate quiz-related tables!');
    console.log('   All existing quiz data will be lost.\n');
    
    // Execute the entire migration as one transaction
    // Split by semicolons but keep DO blocks together
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
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      try {
        await sql.unsafe(statement);
        console.log(`✓ [${i + 1}/${statements.length}] Executed statement`);
      } catch (error) {
        // Some errors are expected (IF NOT EXISTS, etc.)
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('already exists') || 
            errorMsg.includes('does not exist') ||
            errorMsg.includes('duplicate') ||
            errorMsg.includes('cannot drop') && errorMsg.includes('because other objects depend')) {
          console.log(`⚠ [${i + 1}/${statements.length}] Skipped: ${error.message.split('\n')[0]}`);
        } else {
          console.error(`❌ [${i + 1}/${statements.length}] Failed:`, error.message);
          throw error;
        }
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('📝 Note: You may need to set NOT NULL constraints on new columns if you have existing data.');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

runMigration()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

