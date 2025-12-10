import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Stack, Inline } from '@/components/ui/spacing';
import { Heading, Body, Muted } from '@/components/ui/typography';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type QuizHeaderProps = {
  title: string;
  description?: string | null;
  assistantName: string;
  assistantAvatar?: string | null;
  assistantTagline?: string | null;
  skillLevel: string;
  questionCount: number;
};

export function QuizHeader({
  title,
  description,
  assistantName,
  assistantAvatar,
  assistantTagline,
  skillLevel,
  questionCount,
}: QuizHeaderProps) {
  const skillLevelColors = {
    beginner: 'bg-success/20 text-success border-success/30',
    intermediate: 'bg-warning/20 text-warning border-warning/30',
    advanced: 'bg-destructive/20 text-destructive border-destructive/30',
  };

  return (
    <Card className="relative">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 h-8 w-8 z-10"
        aria-label="Close quiz and return to all quizzes"
      >
        <Link href="/quizzes">
          <X className="h-4 w-4" />
        </Link>
      </Button>
      <CardHeader>
        <CardTitle>
          <Heading level={1}>{title}</Heading>
        </CardTitle>
        {description && (
          <Muted>{description}</Muted>
        )}
      </CardHeader>
      <CardContent>
        <Stack gap="default">
          <Inline gap="default" align="center" wrap>
            {assistantAvatar && (
              <Avatar className="h-12 w-12">
                <AvatarImage src={assistantAvatar} alt={assistantName} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                  {assistantName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <Stack gap="tight">
              <Body className="font-medium">Hosted by {assistantName}</Body>
              {assistantTagline && (
                <Muted variant="small">{assistantTagline}</Muted>
              )}
            </Stack>
          </Inline>

          <Inline gap="default" align="center" wrap>
            <Badge
              className={cn(skillLevelColors[skillLevel as keyof typeof skillLevelColors])}
            >
              {skillLevel}
            </Badge>
            <Badge variant="outline">
              {questionCount} {questionCount === 1 ? 'question' : 'questions'}
            </Badge>
          </Inline>
        </Stack>
      </CardContent>
    </Card>
  );
}

