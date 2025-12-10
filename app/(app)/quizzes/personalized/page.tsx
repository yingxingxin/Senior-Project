import { redirect } from 'next/navigation';
import { auth } from '@/src/lib/auth';
import { headers } from 'next/headers';
import { getUserAICourses } from '@/app/(app)/courses/_lib/actions';
import { GenerateQuizForm } from '../_components/generate-quiz-form';
import { Heading, Body } from '@/components/ui/typography';
import { Stack } from '@/components/ui/spacing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

/**
 * Personalized Quiz Generation Page
 *
 * Allows users to generate quizzes based on their AI-generated courses.
 */
export default async function PersonalizedQuizPage() {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect('/login');
  }

  // Get user's AI courses
  const aiCourses = await getUserAICourses();

  if (aiCourses.length === 0) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <main className="mx-auto max-w-3xl px-4 pt-6 pb-16">
          <Stack gap="loose">
            <Button variant="outline" asChild className="self-start">
              <Link href="/quizzes">
                <ArrowLeft className="h-4 w-4" />
                Back to Quizzes
              </Link>
            </Button>

            <Card className="p-12 text-center">
              <Stack gap="tight">
                <Sparkles className="h-12 w-12 text-primary mx-auto" />
                <Heading level={2}>No AI Courses Found</Heading>
                <Body className="text-muted-foreground">
                  You need to create an AI course first before you can generate personalized quizzes.
                </Body>
                <Button asChild className="mt-4">
                  <Link href="/courses/new">Create Your First AI Course</Link>
                </Button>
              </Stack>
            </Card>
          </Stack>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-16">
        <Stack gap="loose">
          {/* Back button */}
          <Button variant="outline" asChild className="self-start">
            <Link href="/quizzes">
              <ArrowLeft className="h-4 w-4" />
              Back to Quizzes
            </Link>
          </Button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <Heading level={1} className="text-foreground">
                Generate Personalized Quiz
              </Heading>
              <Body className="text-muted-foreground">
                Create a quiz based on your AI-generated courses
              </Body>
            </div>
          </div>

          {/* Form card */}
          <Card className="p-8">
            <GenerateQuizForm courses={aiCourses} />
          </Card>

          {/* Info section */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <Stack gap="tight">
              <Body className="font-semibold">How it works</Body>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Select one of your AI-generated courses</li>
                <li>Choose the quiz type and number of questions</li>
                <li>AI generates questions based on your course content</li>
                <li>Generation typically takes 15-30 seconds</li>
              </ul>
            </Stack>
          </Card>
        </Stack>
      </main>
    </div>
  );
}

