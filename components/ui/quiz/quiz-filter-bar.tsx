'use client';

import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stack, Inline } from '@/components/ui/spacing';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';

export interface QuizFilterBarProps {
  selectedTopic?: string | null;
  selectedSkillLevel?: SkillLevel;
  searchQuery?: string;
  topics?: string[];
  onTopicChange?: (topic: string | null) => void;
  onSkillLevelChange?: (level: SkillLevel) => void;
  onSearchChange?: (query: string) => void;
  className?: string;
  compact?: boolean;
}

export function QuizFilterBar({
  selectedTopic,
  selectedSkillLevel = 'all',
  searchQuery = '',
  topics = [],
  onTopicChange,
  onSkillLevelChange,
  onSearchChange,
  className,
  compact = false,
}: QuizFilterBarProps) {
  if (compact) {
    return (
      <Card className={cn('p-4', className)}>
        <Stack gap="default">
          {onSearchChange && (
            <div>
              <Label htmlFor="quiz-search" className="sr-only">
                Search quizzes
              </Label>
              <Input
                id="quiz-search"
                type="text"
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {onTopicChange && topics.length > 0 && (
              <div>
                <Label htmlFor="quiz-topic" className="mb-2 block text-sm">
                  Topic
                </Label>
                <Select
                  value={selectedTopic || 'all'}
                  onValueChange={(value) => onTopicChange(value === 'all' ? null : value)}
                >
                  <SelectTrigger id="quiz-topic">
                    <SelectValue placeholder="All topics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All topics</SelectItem>
                    {topics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {onSkillLevelChange && (
              <div>
                <Label htmlFor="quiz-skill-level" className="mb-2 block text-sm">
                  Difficulty
                </Label>
                <Select
                  value={selectedSkillLevel}
                  onValueChange={(value) => onSkillLevelChange(value as SkillLevel)}
                >
                  <SelectTrigger id="quiz-skill-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </Stack>
      </Card>
    );
  }

  return (
    <Card className={cn('p-4', className)}>
      <Stack gap="default">
        {onSearchChange && (
          <div>
            <Label htmlFor="quiz-search" className="sr-only">
              Search quizzes
            </Label>
            <Input
              id="quiz-search"
              type="text"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        <Inline gap="default" align="center" wrap>
          {onTopicChange && topics.length > 0 && (
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="quiz-topic" className="mb-2 block text-sm">
                Topic
              </Label>
              <Select
                value={selectedTopic || 'all'}
                onValueChange={(value) => onTopicChange(value === 'all' ? null : value)}
              >
                <SelectTrigger id="quiz-topic">
                  <SelectValue placeholder="All topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All topics</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {onSkillLevelChange && (
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="quiz-skill-level" className="mb-2 block text-sm">
                Difficulty
              </Label>
              <Tabs
                value={selectedSkillLevel}
                onValueChange={(value) => onSkillLevelChange(value as SkillLevel)}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="beginner" className="flex-1">Beginner</TabsTrigger>
                  <TabsTrigger value="intermediate" className="flex-1">Intermediate</TabsTrigger>
                  <TabsTrigger value="advanced" className="flex-1">Advanced</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
        </Inline>
      </Stack>
    </Card>
  );
}

