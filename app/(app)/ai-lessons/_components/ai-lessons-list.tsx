'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Stack, Grid } from '@/components/ui/spacing';
import { Body } from '@/components/ui/typography';
import { Clock, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';

// Simple relative time formatter
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

interface AILesson {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  difficulty: 'easy' | 'standard' | 'hard';
  estimatedDurationSec: number;
  scope: 'global' | 'user' | 'shared';
  createdAt: Date;
  aiMetadata: {
    topic: string;
    model_used: string;
    persona_snapshot: string;
  } | null;
  progress: {
    isStarted: boolean;
    isCompleted: boolean;
    startedAt: Date | null;
    lastAccessedAt: Date | null;
  };
  viewUrl: string;
  apiUrl: string;
}

interface AILessonsResponse {
  lessons: AILesson[];
  total: number;
}

const difficultyColors = {
  easy: 'bg-green-500/10 text-green-700 dark:text-green-400',
  standard: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  hard: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

export function AILessonsList() {
  const [lessons, setLessons] = useState<AILesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLessons() {
      try {
        const response = await fetch('/api/ai-lessons');
        if (!response.ok) {
          throw new Error('Failed to fetch lessons');
        }
        const data: AILessonsResponse = await response.json();
        setLessons(data.lessons);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLessons();
  }, []);

  if (isLoading) {
    return (
      <Grid gap="default" className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6">
            <Stack gap="default">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </Stack>
          </Card>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <Body className="text-destructive">Error: {error}</Body>
      </Card>
    );
  }

  if (lessons.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Stack gap="default" className="items-center">
          <Sparkles className="h-12 w-12 text-muted-foreground" />
          <div>
            <Body className="text-lg font-semibold">No AI lessons yet</Body>
            <Body className="text-muted-foreground">
              Generate your first personalized lesson to get started
            </Body>
          </div>
          <Button asChild>
            <Link href="/ai-lessons/new">Generate Your First Lesson</Link>
          </Button>
        </Stack>
      </Card>
    );
  }

  return (
    <Grid gap="default" className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {lessons.map((lesson) => (
        <Card
          key={lesson.id}
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          asChild
        >
          <Link href={lesson.viewUrl}>
            <Stack gap="default">
              {/* Title */}
              <div className="flex items-start justify-between gap-2">
                <Body className="font-semibold text-foreground line-clamp-2">
                  {lesson.title}
                </Body>
                {lesson.progress.isCompleted && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                )}
              </div>

              {/* Description */}
              {lesson.description && (
                <Body className="text-sm text-muted-foreground line-clamp-2">
                  {lesson.description}
                </Body>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={difficultyColors[lesson.difficulty]}>
                  {lesson.difficulty}
                </Badge>
                {lesson.aiMetadata?.persona_snapshot && (
                  <Badge variant="outline">
                    {lesson.aiMetadata.persona_snapshot}
                  </Badge>
                )}
              </div>

              {/* Metadata */}
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {Math.ceil(lesson.estimatedDurationSec / 60)} min
                </div>
                {lesson.progress.isStarted && lesson.progress.lastAccessedAt && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Last accessed{' '}
                    {formatRelativeTime(new Date(lesson.progress.lastAccessedAt))}
                  </div>
                )}
              </div>

              {/* Created date */}
              <Body className="text-xs text-muted-foreground">
                Created {formatRelativeTime(new Date(lesson.createdAt))}
              </Body>
            </Stack>
          </Link>
        </Card>
      ))}
    </Grid>
  );
}
