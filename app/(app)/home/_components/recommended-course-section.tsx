import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heading, Body, Muted } from "@/components/ui/typography";
import { Stack, Inline } from "@/components/ui/spacing";
import { COURSES, SKILL_LEVEL_RECOMMENDATIONS } from "@/src/lib/constants";
import { getCoursesWithStats } from "@/app/(app)/courses/_lib/actions";
import { formatDuration } from "@/app/(app)/courses/_lib/utils";

interface RecommendedCourseSectionProps {
  skillLevel: string | null;
}

export async function RecommendedCourseSection({ skillLevel }: RecommendedCourseSectionProps) {
  // Fetch actual courses from database with stats
  const allCoursesWithStats = await getCoursesWithStats();
  
  // Get recommended course slug based on skill level
  const recommendedCourseSlug = skillLevel ? SKILL_LEVEL_RECOMMENDATIONS[skillLevel] : 'programming-foundations';
  
  // Find the actual course in the database
  let actualCourse = allCoursesWithStats.find(course => course.slug === recommendedCourseSlug);
  
  // If recommended course doesn't exist, fall back to first available curated course (non-AI)
  if (!actualCourse && allCoursesWithStats.length > 0) {
    actualCourse = allCoursesWithStats.find(course => !course.isAiGenerated) || allCoursesWithStats[0];
  }
  
  // If still no course found, use the constant as fallback
  const recommendedCourseConstant = COURSES.find(course => course.id === (actualCourse?.slug || recommendedCourseSlug)) || COURSES[0];
  
  // Use the actual course slug from database, or fall back to constant id
  const courseSlug = actualCourse?.slug || recommendedCourseSlug;
  
  // Use actual course data if available, otherwise use constant
  const displayCourse = actualCourse ? {
    title: actualCourse.title,
    description: actualCourse.description || recommendedCourseConstant.description,
    difficulty: actualCourse.difficulty || recommendedCourseConstant.difficulty || 'standard',
    icon: actualCourse.icon || recommendedCourseConstant.icon,
    lessonsCount: actualCourse.lessonsCount || 0,
    estimatedDuration: actualCourse.estimatedDurationSec ? formatDuration(actualCourse.estimatedDurationSec) : recommendedCourseConstant.estimatedDuration,
  } : recommendedCourseConstant;

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
                  {displayCourse.icon}
                </div>
                <Badge
                  variant="outline"
                  className={getDifficultyColor(displayCourse.difficulty)}
                >
                  {displayCourse.difficulty}
                </Badge>
              </Inline>

              <Stack gap="tight">
                <Heading level={6} className="text-foreground">{displayCourse.title}</Heading>
                <Body variant="small" className="text-foreground">
                  {displayCourse.description}
                </Body>
              </Stack>

              <Inline gap="default" align="center" className="text-sm text-muted-foreground">
                {displayCourse.lessonsCount > 0 && (
                  <>
                    <span>{displayCourse.lessonsCount} {displayCourse.lessonsCount === 1 ? 'lesson' : 'lessons'}</span>
                    <span>•</span>
                  </>
                )}
                <span>{displayCourse.estimatedDuration}</span>
              </Inline>

              <Button
                asChild
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-primary/30 shadow-lg"
              >
                <Link href={`/courses/${courseSlug}`}>
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
