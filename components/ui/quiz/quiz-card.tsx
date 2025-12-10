import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/ui/spacing';
import { Heading, Body, Muted } from '@/components/ui/typography';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface QuizCardProps {
  id: number;
  title: string;
  description?: string | null;
  slug: string;
  skillLevel: SkillLevel;
  questionCount: number;
  hasCompleted?: boolean;
  bestPercentage?: number | null;
  className?: string;
}

const skillLevelColors: Record<SkillLevel, string> = {
  beginner: 'bg-success/20 text-success border-success/30',
  intermediate: 'bg-warning/20 text-warning border-warning/30',
  advanced: 'bg-destructive/20 text-destructive border-destructive/30',
};

export function QuizCard({
  id,
  title,
  description,
  slug,
  skillLevel,
  questionCount,
  hasCompleted = false,
  bestPercentage = null,
  className,
}: QuizCardProps) {
  return (
    <Card className={cn('hover:shadow-lg transition-shadow flex flex-col', className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>
            <Heading level={4}>{title}</Heading>
          </CardTitle>
          {hasCompleted && (
            <Badge className="bg-success/20 text-success border-success/30 shrink-0">
              ✓ Completed
            </Badge>
          )}
        </div>
        {description && (
          <Tooltip>
            <TooltipTrigger asChild>
              <CardDescription className="line-clamp-2">
                {description}
              </CardDescription>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{description}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {hasCompleted && bestPercentage !== null && (
          <Body variant="small" className="text-muted-foreground mt-1">
            Best score: {bestPercentage}%
          </Body>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <Stack gap="tight">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {questionCount} {questionCount === 1 ? 'question' : 'questions'}
            </Badge>
            <Badge className={skillLevelColors[skillLevel]}>
              {skillLevel}
            </Badge>
          </div>
        </Stack>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/quizzes/${slug}`}>
            {hasCompleted ? 'Retake Quiz' : 'Start Quiz'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

