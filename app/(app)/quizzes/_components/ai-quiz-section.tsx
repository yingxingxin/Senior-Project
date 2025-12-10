'use client';

import { Grid } from '@/components/ui/spacing';
import { Heading, Body } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { QuizCard } from '@/components/ui/quiz';
import { Stack } from '@/components/ui/spacing';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

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

interface AIQuizSectionProps {
  aiQuizzesByLevel: Map<string, Quiz[]>;
  statusMap: Map<number, QuizStatus>;
}

export function AIQuizSection({ aiQuizzesByLevel, statusMap }: AIQuizSectionProps) {
  const skillLevels = Array.from(aiQuizzesByLevel.keys());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const skillLevelColors = {
    beginner: 'bg-success/20 text-success border-success/30',
    intermediate: 'bg-warning/20 text-warning border-warning/30',
    advanced: 'bg-destructive/20 text-destructive border-destructive/30',
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

  if (skillLevels.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-primary" />
        <Heading level={2}>A.I. Generated Quiz</Heading>
      </div>

      {/* Quizzes by Skill Level */}
      {isMounted ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {skillLevels.map((skillLevel, skillIndex) => {
            const quizzes = aiQuizzesByLevel.get(skillLevel) || [];
            return (
              <motion.div
                key={skillLevel}
                variants={itemVariants}
                transition={{ delay: skillIndex * 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <Heading level={3} className="capitalize">
                    {skillLevel}
                  </Heading>
                  <Badge
                    className={cn(
                      skillLevelColors[skillLevel as keyof typeof skillLevelColors]
                    )}
                  >
                    {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}
                  </Badge>
                </div>

                <Grid cols={3} gap="default">
                  {quizzes.map((quiz, quizIndex) => {
                    const status = statusMap.get(quiz.id);
                    const hasCompleted = status?.hasCompleted ?? false;
                    const bestPercentage = status?.bestPercentage ?? null;

                    return (
                      <motion.div
                        key={quiz.id}
                        variants={itemVariants}
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
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        // Render without animations on initial mount to prevent hydration mismatch
        <div className="space-y-8">
          {skillLevels.map((skillLevel) => {
            const quizzes = aiQuizzesByLevel.get(skillLevel) || [];
            return (
              <div key={skillLevel} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Heading level={3} className="capitalize">
                    {skillLevel}
                  </Heading>
                  <Badge
                    className={cn(
                      skillLevelColors[skillLevel as keyof typeof skillLevelColors]
                    )}
                  >
                    {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}
                  </Badge>
                </div>

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
            );
          })}
        </div>
      )}
    </div>
  );
}

