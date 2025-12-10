import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stack, Inline } from '@/components/ui/spacing';
import { Heading, Body, Muted } from '@/components/ui/typography';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface QuizResultSummaryProps {
  score: number;
  total: number;
  percentage: number;
  quizTitle?: string;
  skillLevel?: SkillLevel;
  topicSlug?: string;
  assistantName?: string;
  onRequestSummary?: () => void;
  className?: string;
}

const skillLevelColors: Record<SkillLevel, string> = {
  beginner: 'bg-success/20 text-success border-success/30',
  intermediate: 'bg-warning/20 text-warning border-warning/30',
  advanced: 'bg-destructive/20 text-destructive border-destructive/30',
};

const getScoreColor = (percentage: number): string => {
  if (percentage >= 80) return 'text-success';
  if (percentage >= 60) return 'text-warning';
  return 'text-destructive';
};

const getScoreLabel = (percentage: number): string => {
  if (percentage >= 90) return 'Excellent!';
  if (percentage >= 80) return 'Great job!';
  if (percentage >= 70) return 'Good work!';
  if (percentage >= 60) return 'Not bad!';
  return 'Keep practicing!';
};

export function QuizResultSummary({
  score,
  total,
  percentage,
  quizTitle,
  skillLevel,
  topicSlug,
  assistantName,
  onRequestSummary,
  className,
}: QuizResultSummaryProps) {
  const scoreColor = getScoreColor(percentage);
  const scoreLabel = getScoreLabel(percentage);

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>
          <Heading level={2}>Quiz Results</Heading>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Stack gap="default">
          {/* Score Display */}
          <div className="text-center py-4">
            <Body className="text-lg mb-2">{scoreLabel}</Body>
            <Heading level={1} className={cn('text-4xl font-bold mb-1', scoreColor)}>
              {percentage}%
            </Heading>
            <Muted>
              You got {score} out of {total} correct
            </Muted>
          </div>

          {/* Quiz Metadata */}
          {(quizTitle || skillLevel || topicSlug) && (
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {skillLevel && (
                <Badge className={skillLevelColors[skillLevel]}>
                  {skillLevel}
                </Badge>
              )}
              {topicSlug && (
                <Badge variant="outline">
                  {topicSlug.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Badge>
              )}
            </div>
          )}

          {/* AI Summary Button */}
          {onRequestSummary && assistantName && (
            <Button
              type="button"
              variant="outline"
              onClick={onRequestSummary}
              className="w-full"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Get overall summary from {assistantName}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

