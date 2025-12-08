"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Heading, Body } from "@/components/ui/typography";
import { Stack } from "@/components/ui/spacing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionRenderer, type Section } from "../../_components/section-renderer";
import { SectionNavigator } from "../../_components/section-navigator";
import { LessonSkeleton } from "../../_components/lesson-skeleton";
import { completeSectionAction, checkSectionCompletion } from "../../_lib/actions";
import { useAIContext } from "@/components/ai-context-provider";
import { TextSelectionProvider } from "@/components/text-selection-popup";
import { prepareSectionContent } from "@/src/lib/ai/utils";

interface LessonClientProps {
  courseId: string;
  lessonSlug: string;
  lessonMeta: {
    id: number;
    slug: string;
    title: string;
    description: string;
  };
  sections: Section[];
}

/**
 * Client component for the lesson page
 * Handles section navigation and completion tracking
 */
export function LessonClient({
  courseId,
  lessonSlug,
  lessonMeta,
  sections,
}: LessonClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setLesson } = useAIContext();

  // Get current section index from URL (default: 0)
  const currentIndexFromUrl = parseInt(searchParams.get("section") ?? "0", 10);
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(currentIndexFromUrl, sections.length - 1)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  // Load completion status for all sections on mount
  useEffect(() => {
    const loadCompletionStatus = async () => {
      try {
        const completed: string[] = [];
        for (const section of sections) {
          const result = await checkSectionCompletion({
            lessonSlug,
            sectionSlug: section.slug,
          });
          if (result.isCompleted) {
            completed.push(section.slug);
          }
        }
        setCompletedSections(completed);
      } catch (error) {
        console.error("Error loading section completion status:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadCompletionStatus();
  }, [lessonSlug, sections]);

  const currentSection = sections[currentIndex];

  // Set lesson context for AI assistant when section changes
  // Includes section content so AI can reference specific material being studied
  useEffect(() => {
    const sectionContent = currentSection
      ? prepareSectionContent(currentSection.bodyJson, currentSection.body, 2500)
      : undefined;

    setLesson({
      id: lessonMeta.id,
      title: lessonMeta.title,
      topic: lessonMeta.slug,
      currentSection: currentSection?.title,
      sectionContent,
    });
    return () => setLesson(null); // Clear on unmount
  }, [lessonMeta, currentSection, setLesson]);

  const handleNext = async () => {
    setIsLoading(true);
    try {
      // Auto-complete current section when moving forward
      await completeSectionAction({
        lessonSlug: lessonSlug,
        sectionSlug: currentSection.slug,
      });

      setCompletedSections((prev) => [...new Set([...prev, currentSection.slug])]);

      // Move to next section
      const nextIndex = currentIndex + 1;
      if (nextIndex < sections.length) {
        setCurrentIndex(nextIndex);
        // Update URL to reflect new section
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("section", nextIndex.toString());
        router.push(`?${newSearchParams.toString()}`, { scroll: false });
      } else {
        // Lesson complete - redirect to course overview
        router.push(`/courses/${courseId}`);
      }
    } catch (error) {
      console.error("Error completing section:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("section", prevIndex.toString());
      router.push(`?${newSearchParams.toString()}`, { scroll: false });
    }
  };

  const handleReadyStateChange = (ready: boolean) => {
    setCanProceed(ready);
  };

  // Reset canProceed when section changes
  useEffect(() => {
    setCanProceed(false);
  }, [currentIndex]);

  // Show loading state while completing section status load
  if (!isInitialized) {
    return <LessonSkeleton />;
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="mx-auto max-w-5xl px-4 pt-6 pb-16">
        <Stack gap="loose">
          {/* Back button */}
          <Button variant="outline" asChild className="self-start">
            <Link href={`/courses/${courseId}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </Link>
          </Button>

          {/* Lesson header */}
          <Card className="bg-card/50 backdrop-blur border-border shadow-lg p-6">
            <Stack gap="default">
              <Heading level={2} className="text-foreground">
                {lessonMeta.title}
              </Heading>
              {lessonMeta.description && (
                <Body className="text-muted-foreground">
                  {lessonMeta.description}
                </Body>
              )}
            </Stack>
          </Card>

          {/* Current section - wrapped with TextSelectionProvider for AI context */}
          <TextSelectionProvider source={`${lessonMeta.title} lesson`}>
            <Card className="bg-card/50 backdrop-blur border-border p-6">
              <Stack gap="default">
                <SectionRenderer
                  section={{
                    ...currentSection,
                    isCompleted: completedSections.includes(
                      currentSection.slug
                    ),
                  }}
                  onReadyStateChange={handleReadyStateChange}
                />
              </Stack>
            </Card>
          </TextSelectionProvider>

          {/* Section navigator */}
          <SectionNavigator
            currentIndex={currentIndex}
            totalSections={sections.length}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLoading={isLoading}
            sectionTitle={currentSection.title}
            canProceed={canProceed}
          />
        </Stack>
      </main>
    </div>
  );
}
