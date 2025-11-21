import { redirect } from 'next/navigation';
import { auth } from '@/src/lib/auth';
import { headers } from 'next/headers';
import { AILessonsList } from './_components/ai-lessons-list';
import { Heading, Body } from '@/components/ui/typography';
import { Stack } from '@/components/ui/spacing';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Sparkles } from 'lucide-react';

/**
 * AI Lessons Dashboard
 *
 * Displays all AI-generated lessons for the authenticated user.
 * Shows generation status, progress, and allows creating new lessons.
 */
export default async function AILessonsPage() {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-dvh relative text-foreground animate-gradient">
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-16 relative z-10">
        <Stack gap="loose">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                <Heading level={1} className="text-foreground">
                  AI-Generated Lessons
                </Heading>
                <Body className="text-muted-foreground">
                  Personalized lessons created just for you
                </Body>
              </div>
            </div>

            <Button asChild>
              <Link href="/ai-lessons/new">
                <Plus className="h-4 w-4" />
                Generate New Lesson
              </Link>
            </Button>
          </div>

          {/* Lessons list */}
          <AILessonsList />
        </Stack>
      </main>
    </div>
  );
}
