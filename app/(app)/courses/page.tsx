import Link from "next/link";
import { ArrowRight, Clock, BookOpen, Users, Plus, Sparkles } from "lucide-react";
import { Heading, Body, Muted } from "@/components/ui/typography";
import { Stack, Grid } from "@/components/ui/spacing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCuratedCourses, getUserAICourses } from "./_lib/actions";
import { formatDuration } from "./_lib/utils";

export default async function CoursesPage() {
  const [curatedCourses, userAICourses] = await Promise.all([
    getCuratedCourses(),
    getUserAICourses(),
  ]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-16">
        <Stack gap="loose">
          {/* Header */}
          <Card className="bg-card/50 backdrop-blur border-border shadow-lg p-6">
            <Stack gap="default">
              <Heading level={2} className="text-foreground">Courses</Heading>
              <Body variant="large" className="text-muted-foreground">
                Choose from our curated courses or create your own personalized learning path.
              </Body>
            </Stack>
          </Card>

          {/* Curated Courses Section */}
          <Stack gap="default">
            <Heading level={3} className="text-foreground">Curated Courses</Heading>
            <Grid cols={3} gap="default">
              {curatedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </Grid>
          </Stack>

          {/* Your AI Courses Section */}
          <Stack gap="default">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <Heading level={3} className="text-foreground">Your AI Courses</Heading>
            </div>
            <Grid cols={3} gap="default">
              {/* Create Your Own CTA Card */}
              <Link href="/courses/new">
                <Card className="bg-card/50 backdrop-blur border-dashed border-2 border-border hover:border-primary/50 shadow-lg transition-all hover:shadow-xl h-full min-h-[280px] cursor-pointer group">
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-2">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted group-hover:bg-primary/10 transition-colors">
                      <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <Heading level={4} className="text-muted-foreground group-hover:text-foreground transition-colors">
                      Create Your Own
                    </Heading>
                    <Muted variant="small">
                      Generate a personalized course with AI
                    </Muted>
                  </div>
                </Card>
              </Link>

              {/* User's AI Courses */}
              {userAICourses.map((course) => (
                <CourseCard key={course.id} course={course} isAI />
              ))}
            </Grid>
          </Stack>

          {/* Additional Info */}
          <Card className="bg-card/50 backdrop-blur border-border shadow-lg p-6">
            <Stack gap="default" className="text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5" />
                <Muted variant="small">Concept-First, Language-Second Learning</Muted>
              </div>
              <Body variant="small" className="text-muted-foreground max-w-2xl mx-auto">
                Our courses follow a proven learning methodology that focuses on understanding
                core concepts before diving into specific programming languages. This approach
                helps you build a solid foundation and transfer knowledge across different technologies.
              </Body>
            </Stack>
          </Card>
        </Stack>
      </main>
    </div>
  );
}

interface CourseCardProps {
  course: {
    id: number;
    slug: string;
    title: string;
    description: string | null;
    difficulty: string | null;
    icon: string | null;
    lessonsCount: number;
    estimatedDurationSec: number;
  };
  isAI?: boolean;
}

function CourseCard({ course, isAI }: CourseCardProps) {
  return (
    <Card className="bg-card/50 backdrop-blur border-border shadow-lg transition-all hover:shadow-xl">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 border-2 border-border rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-primary/30 shadow-lg">
            {course.icon || (isAI ? "✨" : "📚")}
          </div>
          <div className="flex gap-2">
            {isAI && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
            )}
            <Badge variant="outline" className="bg-muted/50 text-primary border-border">
              {course.difficulty || "standard"}
            </Badge>
          </div>
        </div>

        <Stack gap="default">
          <Heading level={4} className="text-foreground">{course.title}</Heading>
          <Body className="text-foreground line-clamp-2">
            {course.description}
          </Body>

          {/* Course Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.lessonsCount} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(course.estimatedDurationSec)}</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button asChild className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-primary/30 shadow-lg">
            <Link href={`/courses/${course.slug}`}>
              Start Course
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Stack>
      </div>
    </Card>
  );
}
