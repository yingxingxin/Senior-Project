import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heading, Body, Muted } from "@/components/ui/typography";
import { Stack, Inline } from "@/components/ui/spacing";
import { COURSES, SKILL_LEVEL_RECOMMENDATIONS } from "@/src/lib/constants";

interface RecommendedCourseSectionProps {
  skillLevel: string | null;
}

export function RecommendedCourseSection({ skillLevel }: RecommendedCourseSectionProps) {
  // Get recommended course based on skill level
  const recommendedCourseId = skillLevel ? SKILL_LEVEL_RECOMMENDATIONS[skillLevel] : 'programming-foundations';
  const recommendedCourse = COURSES.find(course => course.id === recommendedCourseId) || COURSES[0];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'advanced':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border shadow-lg">
      <div className="p-6">
        <Inline gap="tight" align="center" className="mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <Heading level={5} className="text-foreground">Recommended for You</Heading>
        </Inline>

        <Card className="bg-card/30 backdrop-blur border-border shadow-md">
          <div className="p-5">
            <Stack gap="default">
              <Inline align="start" justify="between">
                <div className="w-12 h-12 border-2 border-border rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-primary/30 shadow-lg">
                  {recommendedCourse.icon}
                </div>
                <Badge
                  variant="outline"
                  className={getDifficultyColor(recommendedCourse.difficulty)}
                >
                  {recommendedCourse.difficulty}
                </Badge>
              </Inline>

              <Stack gap="tight">
                <Heading level={6} className="text-foreground">{recommendedCourse.title}</Heading>
                <Body variant="small" className="text-foreground">
                  {recommendedCourse.description}
                </Body>
              </Stack>

              <Inline gap="default" align="center" className="text-sm text-muted-foreground">
                <span>{recommendedCourse.lessonsCount} lessons</span>
                <span>•</span>
                <span>{recommendedCourse.estimatedDuration}</span>
              </Inline>

              <Button
                asChild
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-primary/30 shadow-lg"
              >
                <Link href={`/courses/${recommendedCourse.id}`}>
                  Start Course
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Stack>
          </div>
        </Card>
      </div>
    </Card>
  );
}
