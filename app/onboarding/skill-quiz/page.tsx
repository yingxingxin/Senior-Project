import { requireActiveOnboardingUser } from '@/src/lib/onboarding/server';
import { SkillQuizForm } from '@/components/onboarding/SkillQuizForm';
import { getSkillQuizQuestions } from '../actions';

export const metadata = {
  title: 'Quick Skill Check',
};

export default async function SkillQuizPage() {
  // Ensure user is in onboarding
  await requireActiveOnboardingUser();

  // Fetch questions on the server
  const questions = await getSkillQuizQuestions();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Quick skill check</h1>
        <p className="text-sm text-muted-foreground">Answer a few questions so we can start you at the right level.</p>
      </div>
      <SkillQuizForm initialQuestions={questions} />
    </div>
  );
}