require('dotenv').config();
const postgres = require('postgres');

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  try {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (!command) {
      console.log('=== DEVELOPMENT ONBOARDING TOOL ===\n');
      console.log('Usage:');
      console.log('  node scripts/dev_onboarding.js reset <email>     - Reset user to welcome step');
      console.log('  node scripts/dev_onboarding.js goto <email> <step> - Jump to specific step');
      console.log('  node scripts/dev_onboarding.js list              - List all users');
      console.log('  node scripts/dev_onboarding.js complete <email>  - Mark onboarding as complete');
      console.log('\nAvailable steps: welcome, gender, skill_quiz, persona, guided_intro');
      return;
    }

    if (command === 'list') {
      const users = await sql`
        SELECT id, name, email, onboarding_completed_at, onboarding_step, skill_level
        FROM users 
        ORDER BY created_at DESC
      `;
      
      console.log('=== ALL USERS ===');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   ID: ${user.id} | Completed: ${user.onboarding_completed_at ? 'Yes' : 'No'} | Step: ${user.onboarding_step || 'None'}`);
      });
      return;
    }

    const email = args[1];
    if (!email) {
      console.log('Error: Email required for this command');
      return;
    }

    const [user] = await sql`
      SELECT id, name, email, onboarding_completed_at, onboarding_step
      FROM users 
      WHERE email = ${email}
    `;

    if (!user) {
      console.log(`Error: User with email ${email} not found`);
      return;
    }

    console.log(`Found user: ${user.name} (${user.email})`);

    if (command === 'reset') {
      await sql`
        UPDATE users 
        SET 
          onboarding_completed_at = NULL,
          onboarding_step = 'welcome',
          skill_level = NULL,
          assistant_id = NULL,
          assistant_persona = NULL
        WHERE id = ${user.id}
      `;
      console.log('✅ Reset to welcome step');
    }
    else if (command === 'goto') {
      const step = args[2];
      const validSteps = ['welcome', 'gender', 'skill_quiz', 'persona', 'guided_intro'];
      
      if (!step || !validSteps.includes(step)) {
        console.log(`Error: Valid steps are: ${validSteps.join(', ')}`);
        return;
      }

      // Set up prerequisites based on step
      let updates = { onboarding_step: step, onboarding_completed_at: null };
      
      if (step === 'gender' || step === 'skill_quiz' || step === 'persona' || step === 'guided_intro') {
        // Need assistant selected for these steps
        updates.assistant_id = 1; // Default to first assistant
      }
      
      if (step === 'persona' || step === 'guided_intro') {
        // Need skill level for these steps
        updates.skill_level = 'intermediate'; // Default skill level
      }
      
      if (step === 'guided_intro') {
        // Need persona for this step
        updates.assistant_persona = 'kind'; // Default persona
      }

      await sql`
        UPDATE users 
        SET ${sql(updates)}
        WHERE id = ${user.id}
      `;
      
      console.log(`✅ Jumped to ${step} step`);
    }
    else if (command === 'complete') {
      await sql`
        UPDATE users 
        SET 
          onboarding_completed_at = NOW(),
          onboarding_step = NULL
        WHERE id = ${user.id}
      `;
      console.log('✅ Marked onboarding as complete');
    }
    else {
      console.log('Error: Unknown command');
    }

  } finally {
    await sql.end({ timeout: 1 });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
