'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Grid } from '@/components/ui/spacing';
import { Heading, Body, Muted } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { QuizCard } from '@/components/ui/quiz';
import { Stack } from '@/components/ui/spacing';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GenerateQuizForm } from './generate-quiz-form';
import { Sparkles, ChevronDown, Sprout, Flame, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type Quiz = {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  defaultLength: number;
};

type QuizStatus = {
  quizId: number;
  bestPercentage: number | null;
  hasCompleted: boolean;
};

type QuizzesByTopic = Map<string, Map<string, Quiz[]>>;

interface Course {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  lessonsCount: number;
}

interface QuizTopicTabsProps {
  quizzesByTopic: QuizzesByTopic;
  statusMap: Map<number, QuizStatus>;
  aiCourses: Course[];
}

export function QuizTopicTabs({
  quizzesByTopic,
  statusMap,
  aiCourses,
}: QuizTopicTabsProps) {
  // Add "Generate Quiz" as a special tab (always first)
  const GENERATE_TAB = "generate_quiz";
  
  // Sort topics to put "A.I. Generated Quiz" first, then alphabetically
  const topics = Array.from(quizzesByTopic.keys()).sort((a, b) => {
    if (a === "ai_generated_quiz") return -1;
    if (b === "ai_generated_quiz") return 1;
    return a.localeCompare(b);
  });
  
  // Initialize with first topic to ensure server/client match
  // If there are no topics, default to generate tab
  const defaultTab = topics.length > 0 ? topics[0] : GENERATE_TAB;
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state after hydration (for animations)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format topic slugs for display
  const formatTopicName = (slug: string | null | undefined): string => {
    if (!slug) return "Uncategorized";
    // Special case for AI-generated quizzes
    if (slug === "ai_generated_quiz") {
      return "A.I. Generated Quiz";
    }
    return slug
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const skillLevelColors = {
    beginner: 'bg-success/20 text-success border-success/30',
    intermediate: 'bg-warning/20 text-warning border-warning/30',
    advanced: 'bg-destructive/20 text-destructive border-destructive/30',
  };

  const skillLevelIcons = {
    beginner: Sprout,
    intermediate: Flame,
    advanced: Trophy,
  };

  const getDifficultyIcon = (level: string) => {
    const Icon = skillLevelIcons[level as keyof typeof skillLevelIcons] || Sprout;
    return <Icon className="h-4 w-4" />;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Ensure we have a valid activeTab (should always be set from useState, but safety check)
  // If no topics, default to Generate Quiz tab
  const currentTab = activeTab || (topics.length > 0 ? topics[0] : GENERATE_TAB);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Smooth scroll to top when switching tabs (client-side only)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Always show the Generate Quiz tab, even if there are no quizzes or AI courses
  const finalDefaultTab = topics.length > 0 ? defaultTab : GENERATE_TAB;

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full" defaultValue={finalDefaultTab}>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b mb-8 -mx-4 px-4 py-4">
        <div className="flex justify-center">
          <TabsList className="inline-flex h-auto items-center justify-center gap-1.5 rounded-lg bg-muted/50 p-1.5 text-muted-foreground shadow-sm border border-border/50">
            {/* Generate Quiz tab - always first */}
            <TabsTrigger
              value={GENERATE_TAB}
              className={cn(
                "relative px-5 py-2.5 text-sm font-medium rounded-md whitespace-nowrap transition-all duration-200",
                "hover:bg-accent/50 hover:text-accent-foreground",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              <Sparkles className="h-4 w-4 mr-2 inline" />
              Generate Quiz
            </TabsTrigger>
            
            {topics.map((topicSlug) => {
              const quizzesByLevel = quizzesByTopic.get(topicSlug);
              const totalQuizzes = Array.from(quizzesByLevel?.values() || []).reduce(
                (sum, quizzes) => sum + quizzes.length,
                0
              );

              return (
                <TabsTrigger
                  key={topicSlug}
                  value={topicSlug}
                  className={cn(
                    "relative px-5 py-2.5 text-sm font-medium rounded-md whitespace-nowrap transition-all duration-200",
                    "hover:bg-accent/50 hover:text-accent-foreground",
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-50"
                  )}
                >
                  {formatTopicName(topicSlug)}
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "ml-2 text-xs font-normal transition-colors",
                      "data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground"
                    )}
                  >
                    {totalQuizzes}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </div>

      {/* Generate Quiz Tab Content - Always show, but prompt to create course if none exist */}
      <TabsContent value={GENERATE_TAB} className="mt-0">
        {aiCourses.length > 0 ? (
          isMounted ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <Heading level={2}>Generate Personalized Quiz</Heading>
                </div>
                <Muted>
                  Create a custom quiz based on your AI-generated courses. Select a course, choose the quiz type and length, and let AI generate questions for you.
                </Muted>
                <Card className="p-6">
                  <GenerateQuizForm courses={aiCourses} />
                </Card>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <Heading level={2}>Generate Personalized Quiz</Heading>
                </div>
                <Muted>
                  Create a custom quiz based on your AI-generated courses. Select a course, choose the quiz type and length, and let AI generate questions for you.
                </Muted>
                <Card className="p-6">
                  <GenerateQuizForm courses={aiCourses} />
                </Card>
              </div>
            </div>
          )
        ) : (
          <Card className="p-12 text-center">
            <Stack gap="tight" className="items-center">
              <Sparkles className="h-12 w-12 text-primary mx-auto" />
              <Heading level={2}>No AI Courses Found</Heading>
              <Muted>
                You need to create an AI-generated course first before you can generate personalized quizzes.
              </Muted>
              <Button asChild className="mt-4">
                <Link href="/courses/new">Create Your First AI Course</Link>
              </Button>
            </Stack>
          </Card>
        )}
      </TabsContent>

      {topics.map((topicSlug) => {
        const quizzesByLevel = quizzesByTopic.get(topicSlug);
        if (!quizzesByLevel) return null;

        return (
          <TabsContent
            key={topicSlug}
            value={topicSlug}
            className="mt-0"
          >
            {isMounted ? (
              <motion.div
                key={`${topicSlug}-${currentTab}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {Array.from(quizzesByLevel.entries()).map(([skillLevel, quizzes], skillIndex) => (
                  <Collapsible
                    key={skillLevel}
                    defaultOpen={skillIndex === 0}
                    className="space-y-2"
                  >
                    <CollapsibleTrigger
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left transition-all hover:bg-accent/50",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getDifficultyIcon(skillLevel)}
                          <Heading level={3} className="capitalize m-0">
                            {skillLevel}
                          </Heading>
                        </div>
                        <Badge
                          className={cn(
                            skillLevelColors[skillLevel as keyof typeof skillLevelColors]
                          )}
                        >
                          {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}
                        </Badge>
                      </div>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                      <div className="pt-4">
                        <Grid cols={3} gap="default">
                          {quizzes.map((quiz, quizIndex) => {
                            const status = statusMap.get(quiz.id);
                            const hasCompleted = status?.hasCompleted ?? false;
                            const bestPercentage = status?.bestPercentage ?? null;

                            return (
                              <motion.div
                                key={quiz.id}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: (skillIndex * 0.1) + (quizIndex * 0.05) }}
                              >
                                <QuizCard
                                  id={quiz.id}
                                  title={quiz.title}
                                  description={quiz.description}
                                  slug={quiz.slug}
                                  skillLevel={quiz.skillLevel}
                                  questionCount={quiz.defaultLength}
                                  hasCompleted={hasCompleted}
                                  bestPercentage={bestPercentage}
                                />
                              </motion.div>
                            );
                          })}
                        </Grid>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </motion.div>
            ) : (
              // Render without animations on initial mount to prevent hydration mismatch
              <div className="space-y-4">
                {Array.from(quizzesByLevel.entries()).map(([skillLevel, quizzes], skillIndex) => (
                  <Collapsible
                    key={skillLevel}
                    defaultOpen={skillIndex === 0}
                    className="space-y-2"
                  >
                    <CollapsibleTrigger
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left transition-all hover:bg-accent/50",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getDifficultyIcon(skillLevel)}
                          <Heading level={3} className="capitalize m-0">
                            {skillLevel}
                          </Heading>
                        </div>
                        <Badge
                          className={cn(
                            skillLevelColors[skillLevel as keyof typeof skillLevelColors]
                          )}
                        >
                          {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}
                        </Badge>
                      </div>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                      <div className="pt-4">
                        <Grid cols={3} gap="default">
                          {quizzes.map((quiz) => {
                            const status = statusMap.get(quiz.id);
                            const hasCompleted = status?.hasCompleted ?? false;
                            const bestPercentage = status?.bestPercentage ?? null;

                            return (
                              <QuizCard
                                key={quiz.id}
                                id={quiz.id}
                                title={quiz.title}
                                description={quiz.description}
                                slug={quiz.slug}
                                skillLevel={quiz.skillLevel}
                                questionCount={quiz.defaultLength}
                                hasCompleted={hasCompleted}
                                bestPercentage={bestPercentage}
                              />
                            );
                          })}
                        </Grid>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

