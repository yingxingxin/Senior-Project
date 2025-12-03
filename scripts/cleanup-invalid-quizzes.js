/**
 * Cleanup Script: Remove Invalid Quizzes
 * 
 * This script removes quizzes that don't have required fields (slug, title, etc.)
 * Run with: node scripts/cleanup-invalid-quizzes.js
 */

const postgres = require('postgres');
require('dotenv').config();

async function cleanupInvalidQuizzes() {
  let sql;
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in .env');
    }

    sql = postgres(process.env.DATABASE_URL);

    console.log('🧹 Cleaning up invalid quizzes...\n');

    // Find quizzes with null or empty required fields
    const invalidQuizzes = await sql`
      SELECT id, slug, title, topic_slug, skill_level
      FROM quizzes
      WHERE slug IS NULL 
         OR slug = ''
         OR title IS NULL
         OR title = ''
         OR topic_slug IS NULL
         OR topic_slug = ''
         OR skill_level IS NULL
    `;

    if (invalidQuizzes.length === 0) {
      console.log('No invalid quizzes found. Database is clean!');
      await sql.end();
      process.exit(0);
    }

    console.log(`Found ${invalidQuizzes.length} invalid quiz(es):`);
    invalidQuizzes.forEach(q => {
      console.log(`   - ID ${q.id}: slug="${q.slug || '(null)'}", title="${q.title || '(null)'}"`);
    });

    // Delete invalid quizzes
    const result = await sql`
      DELETE FROM quizzes
      WHERE slug IS NULL 
         OR slug = ''
         OR title IS NULL
         OR title = ''
         OR topic_slug IS NULL
         OR topic_slug = ''
         OR skill_level IS NULL
    `;

    console.log(`\nDeleted ${result.count} invalid quiz(es).`);
    console.log('Cleanup complete!');

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up quizzes:', error);
    if (sql) await sql.end();
    process.exit(1);
  }
}

cleanupInvalidQuizzes();

