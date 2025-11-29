/**
 * app/onboarding/[step]/page.tsx
 *
 * Renders the appropriate form based on the step
 */
import { notFound, redirect } from 'next/navigation';
import { isValidStep, getOnboardingStepHref } from '@/app/onboarding/_lib/steps';
import { canAccessStep, getNextAllowedStep } from '@/app/onboarding/_lib/guard';
import { getAssistantOptions, loadActiveUser } from '@/app/onboarding/_lib/actions';
import { getSkillQuizQuestions } from '@/app/onboarding/_lib/actions';
import { PERSONA_OPTIONS } from '@/src/lib/constants';
// Individual onboarding steps
import { AssistantSelectionForm } from '@/app/onboarding/_components/assistant-selection-form';
import { PersonaSelectionForm } from '@/app/onboarding/_components/persona-selection-form';
import { SkillQuizForm } from '@/app/onboarding/_components/skill-quiz-form';
import { GuidedIntroCompletion } from '@/app/onboarding/_components/guided-intro-completion';
import { Display, Body } from '@/components/ui/typography';
import { Stack } from '@/components/ui/spacing';

type Props = {
  params: Promise<{ step: string }>;
};

export default async function OnboardingStepPage({ params }: Props) {
  const { step } = await params;

  // Validate step exists
  if (!isValidStep(step)) {
    notFound();
  }

  // Load user data (cached, so won't duplicate layout's query)
  const user = await loadActiveUser();

  // Check if user can access this step
  if (!canAccessStep(user, step)) {
    const nextStep = getNextAllowedStep(user);
    redirect(getOnboardingStepHref(nextStep));
  }

  // Render appropriate form based on step
  if (step === 'gender') {
    const assistants = await getAssistantOptions();
    return (
      <Stack gap="loose">
        <Stack gap="tight">
          <Display level={1}>Choose Your Assistant</Display>
          <Body variant="large" className="text-muted-foreground">
            These portraits shape the energy your companion brings to every study session.
          </Body>
        </Stack>
        <AssistantSelectionForm options={assistants} />
      </Stack>
    );
  }

  if (step === 'skill_quiz') {
    const questions = await getSkillQuizQuestions();

    // Handle missing quiz gracefully
    if (!questions) {
      return (
        <Stack gap="loose">
          <Stack gap="tight">
            <Display level={1}>Setup Incomplete</Display>
            <Body variant="large" className="text-muted-foreground">
              The skill assessment quiz hasn&apos;t been configured yet. Please contact support or try again later.
            </Body>
          </Stack>
        </Stack>
      );
    }

    return (
      <Stack gap="loose">
        <Stack gap="tight">
          <Display level={1}>Quick Skill Check</Display>
          <Body variant="large" className="text-muted-foreground">
            Answer a few questions so we can start at the right level.
          </Body>
        </Stack>
        <SkillQuizForm questions={questions} />
      </Stack>
    );
  }

  if (step === 'persona') {
    return (
      <Stack gap="loose">
        <Stack gap="tight">
          <Display level={1}>Tune Their Personality</Display>
          <Body variant="large" className="text-muted-foreground">
            Preview how your assistant speaks and pick your tone.
          </Body>
        </Stack>
        <PersonaSelectionForm options={PERSONA_OPTIONS} />
      </Stack>
    );
  }

  if (step === 'guided_intro') {
    return (
      <Stack gap="loose">
        <Stack gap="tight">
          <Display level={1}>Ready to Start!</Display>
          <Body variant="large" className="text-muted-foreground">
            You&apos;re all set! Let&apos;s take a quick tour of your personalized dashboard.
          </Body>
        </Stack>
        <GuidedIntroCompletion />
      </Stack>
    );
  }

  notFound();
}
