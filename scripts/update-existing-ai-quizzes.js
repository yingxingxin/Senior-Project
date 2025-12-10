const postgres = require('postgres');
require('dotenv').config();

async function updateAIQuizzes() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    console.log('🔍 Checking for AI-generated quizzes that need to be marked...');
    
    // Find quizzes that are likely AI-generated based on description
    // Look for quizzes with "AI-generated" in the description
    const aiQuizzes = await sql`
      SELECT id, title, description, is_ai_generated, owner_user_id
      FROM quizzes
      WHERE description ILIKE '%AI-generated%'
         OR description ILIKE '%ai-generated%'
         OR title ILIKE '%comprehensive quiz%'
         OR title ILIKE '%quick review%'
    `;
    
    console.log(`Found ${aiQuizzes.length} potential AI-generated quizzes`);
    
    if (aiQuizzes.length === 0) {
      console.log('No quizzes to update.');
      await sql.end();
      return;
    }
    
    // Show what we found
    for (const quiz of aiQuizzes) {
      console.log(`  - ${quiz.title} (ID: ${quiz.id})`);
      console.log(`    Current is_ai_generated: ${quiz.is_ai_generated}`);
      console.log(`    Current owner_user_id: ${quiz.owner_user_id}`);
    }
    
    // Update them to be marked as AI-generated
    // We'll need to set owner_user_id too, but we don't know which user created them
    // For now, we'll just mark them as AI-generated
    console.log('\n⚠️  Note: These quizzes will be marked as AI-generated, but owner_user_id will remain NULL');
    console.log('   (since we don\'t know which user created them)\n');
    
    const result = await sql`
      UPDATE quizzes
      SET is_ai_generated = true
      WHERE description ILIKE '%AI-generated%'
         OR description ILIKE '%ai-generated%'
         OR title ILIKE '%comprehensive quiz%'
         OR title ILIKE '%quick review%'
    `;
    
    console.log(`✅ Updated ${result.count} quizzes to be marked as AI-generated`);
    console.log('\nNote: If you know which user created these quizzes, you can manually update owner_user_id');

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating quizzes:', error);
    if (sql) await sql.end();
    process.exit(1);
  }
}

updateAIQuizzes();

