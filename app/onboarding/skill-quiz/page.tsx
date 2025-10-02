import { requireActiveOnboardingUser } from '@/src/lib/onboarding/server';
import { SkillQuizForm } from '@/components/onboarding/SkillQuizForm';
import { getSkillQuizQuestions } from '../actions';
import { Heading, Muted } from '@/components/ui/typography';

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
        <Heading level={2}>Quick skill check</Heading>
        <Muted variant="small">Answer a few questions so we can start you at the right level.</Muted>
      </div>
      <SkillQuizForm initialQuestions={questions} />
    </div>
  );
}