const postgres = require('postgres');
require('dotenv').config();

async function checkQuizzes() {
  let sql;
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in .env');
    }

    sql = postgres(process.env.DATABASE_URL);

    console.log('🔍 Checking for quizzes in the database...\n');

    // Count total quizzes
    const countResult = await sql`
      SELECT COUNT(*) as count
      FROM quizzes
    `;

    const count = Number(countResult[0].count);
    console.log(`📊 Total quizzes: ${count}`);

    if (count > 0) {
      // Get all quizzes with their details
      const allQuizzes = await sql`
        SELECT 
          id,
          slug,
          title,
          topic_slug,
          skill_level,
          default_length
        FROM quizzes
        ORDER BY id
      `;

      console.log('\n📝 Quiz details:');
      console.log('─'.repeat(80));
      allQuizzes.forEach((quiz, index) => {
        console.log(`\n${index + 1}. ID: ${quiz.id}`);
        console.log(`   Slug: ${quiz.slug || '(null)'}`);
        console.log(`   Title: ${quiz.title || '(null)'}`);
        console.log(`   Topic: ${quiz.topic_slug || '(null)'}`);
        console.log(`   Skill Level: ${quiz.skill_level || '(null)'}`);
        console.log(`   Default Length: ${quiz.default_length || '(null)'}`);
      });
      console.log('\n' + '─'.repeat(80));

      // Check for quizzes without slugs
      const quizzesWithoutSlugs = allQuizzes.filter(q => !q.slug || q.slug.trim() === '');
      if (quizzesWithoutSlugs.length > 0) {
        console.log(`\nWarning: ${quizzesWithoutSlugs.length} quiz(es) without valid slugs:`);
        quizzesWithoutSlugs.forEach(q => {
          console.log(`   - ID ${q.id}: "${q.title}"`);
        });
      }
    } else {
      console.log('\nNo quizzes found in the database.');
      console.log('   You can create quizzes using the seed script or manually insert them.');
    }

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Error checking quizzes:', error);
    if (sql) await sql.end();
    process.exit(1);
  }
}

checkQuizzes();

