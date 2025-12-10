const postgres = require('postgres');
require('dotenv').config();

async function updateAIQuizOwners() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    console.log('🔍 Finding AI-generated quizzes without owners...');
    
    // Find AI-generated quizzes that don't have an owner
    const aiQuizzesWithoutOwner = await sql`
      SELECT id, title, description, is_ai_generated, owner_user_id
      FROM quizzes
      WHERE is_ai_generated = true
        AND owner_user_id IS NULL
    `;
    
    console.log(`Found ${aiQuizzesWithoutOwner.length} AI-generated quizzes without owners`);
    
    if (aiQuizzesWithoutOwner.length === 0) {
      console.log('No quizzes to update.');
      await sql.end();
      return;
    }
    
    // Show what we found
    for (const quiz of aiQuizzesWithoutOwner) {
      console.log(`  - ${quiz.title} (ID: ${quiz.id})`);
    }
    
    console.log('\n⚠️  These quizzes need to be assigned to a user.');
    console.log('   Since we cannot determine the original creator, you will need to:');
    console.log('   1. Manually update owner_user_id in the database, OR');
    console.log('   2. Delete these quizzes if they are test data\n');
    
    // Optionally, you could try to match by course ownership if there's a relationship
    // For now, we'll just show what needs to be done
    
    console.log('To update a quiz owner, run:');
    console.log('  UPDATE quizzes SET owner_user_id = <user_id> WHERE id = <quiz_id>;');

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    if (sql) await sql.end();
    process.exit(1);
  }
}

updateAIQuizOwners();

