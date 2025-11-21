import { redirect } from 'next/navigation';
import { auth } from '@/src/lib/auth';
import { headers } from 'next/headers';
import { GenerateLessonForm } from '../_components/generate-lesson-form';
import { Heading, Body } from '@/components/ui/typography';
import { Stack } from '@/components/ui/spacing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

/**
 * Generate New AI Lesson Page
 *
 * Provides a form to create a new AI-generated personalized lesson.
 */
export default async function NewAILessonPage() {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-dvh relative text-foreground animate-gradient">
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-16 relative z-10">
        <Stack gap="loose">
          {/* Back button */}
          <Button variant="outline" asChild className="self-start">
            <Link href="/ai-lessons">
              <ArrowLeft className="h-4 w-4" />
              Back to AI Lessons
            </Link>
          </Button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <Heading level={1} className="text-foreground">
                Generate AI Lesson
              </Heading>
              <Body className="text-muted-foreground">
                Create a personalized lesson tailored to your learning style
              </Body>
            </div>
          </div>

          {/* Form card */}
          <Card className="p-8">
            <GenerateLessonForm />
          </Card>

          {/* Info section */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <Stack gap="compact">
              <Body className="font-semibold">How it works</Body>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Choose any topic you want to learn</li>
                <li>AI generates a comprehensive lesson with interactive elements</li>
                <li>Content is personalized to your skill level and learning preferences</li>
                <li>Generation typically takes 30-60 seconds</li>
              </ul>
            </Stack>
          </Card>
        </Stack>
      </main>
    </div>
  );
}
