const postgres = require('postgres');
require('dotenv').config();

async function fixAIQuizOwner() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    console.log('🔍 Finding AI-generated quizzes without owners...\n');
    
    // Find AI-generated quizzes that don't have an owner
    const aiQuizzesWithoutOwner = await sql`
      SELECT id, title, description, topic_slug, is_ai_generated, owner_user_id
      FROM quizzes
      WHERE is_ai_generated = true
        AND owner_user_id IS NULL
    `;
    
    if (aiQuizzesWithoutOwner.length === 0) {
      console.log('✅ All AI-generated quizzes have owners assigned.');
      await sql.end();
      return;
    }
    
    console.log(`Found ${aiQuizzesWithoutOwner.length} AI-generated quiz(es) without owners:\n`);
    
    for (const quiz of aiQuizzesWithoutOwner) {
      console.log(`Quiz ID: ${quiz.id}`);
      console.log(`Title: ${quiz.title}`);
      console.log(`Topic Slug: ${quiz.topic_slug}`);
      
      // Try to find the course owner by matching topic_slug with course slug
      // The topic_slug is usually derived from the course slug
      const courseSlug = quiz.topic_slug.replace(/_/g, '-');
      
      // Look for a lesson (course) with matching slug that is AI-generated
      const courseOwner = await sql`
        SELECT id, title, slug, owner_user_id, is_ai_generated
        FROM lessons
        WHERE slug = ${courseSlug}
          AND is_ai_generated = true
          AND owner_user_id IS NOT NULL
        LIMIT 1
      `;
      
      if (courseOwner.length > 0) {
        const owner = courseOwner[0];
        console.log(`\n📚 Found matching course: "${owner.title}"`);
        console.log(`   Course Owner User ID: ${owner.owner_user_id}`);
        console.log(`\n   Updating quiz owner to user ${owner.owner_user_id}...`);
        
        await sql`
          UPDATE quizzes
          SET owner_user_id = ${owner.owner_user_id}
          WHERE id = ${quiz.id}
        `;
        
        console.log(`   ✅ Quiz owner updated successfully!\n`);
      } else {
        // Try to find by partial match (topic might be slightly different)
        const partialMatch = await sql`
          SELECT id, title, slug, owner_user_id, is_ai_generated
          FROM lessons
          WHERE slug LIKE ${'%' + courseSlug + '%'}
            AND is_ai_generated = true
            AND owner_user_id IS NOT NULL
          LIMIT 1
        `;
        
        if (partialMatch.length > 0) {
          const owner = partialMatch[0];
          console.log(`\n📚 Found partially matching course: "${owner.title}"`);
          console.log(`   Course Owner User ID: ${owner.owner_user_id}`);
          console.log(`\n   Updating quiz owner to user ${owner.owner_user_id}...`);
          
          await sql`
            UPDATE quizzes
            SET owner_user_id = ${owner.owner_user_id}
            WHERE id = ${quiz.id}
          `;
          
          console.log(`   ✅ Quiz owner updated successfully!\n`);
        } else {
          console.log(`\n   ⚠️  Could not find matching course owner.`);
          console.log(`   You'll need to manually set the owner_user_id.`);
          console.log(`   Run: UPDATE quizzes SET owner_user_id = <user_id> WHERE id = ${quiz.id};\n`);
        }
      }
    }
    
    // Show all users for reference
    console.log('\n📋 Available users (for manual assignment if needed):');
    const users = await sql`
      SELECT id, name, email
      FROM users
      ORDER BY id
    `;
    for (const user of users) {
      console.log(`   User ID: ${user.id} - ${user.name || user.email}`);
    }

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    if (sql) await sql.end();
    process.exit(1);
  }
}

fixAIQuizOwner();

