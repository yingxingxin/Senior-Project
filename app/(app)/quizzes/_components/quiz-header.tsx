import { Card } from '@/components/ui/card';
import { Stack, Inline } from '@/components/ui/spacing';
import { Heading, Body, Muted } from '@/components/ui/typography';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Link from 'next/link';

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
    beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <Card className="p-6 relative">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 h-8 w-8"
        aria-label="Close quiz and return to all quizzes"
      >
        <Link href="/quizzes">
          <X className="h-4 w-4" />
        </Link>
      </Button>
      <Stack gap="default">
        <Stack gap="tight">
          <Heading level={1}>{title}</Heading>
          {description && <Muted>{description}</Muted>}
        </Stack>

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
            className={skillLevelColors[skillLevel as keyof typeof skillLevelColors]}
          >
            {skillLevel}
          </Badge>
          <Badge variant="outline">
            {questionCount} {questionCount === 1 ? 'question' : 'questions'}
          </Badge>
        </Inline>
      </Stack>
    </Card>
  );
}

