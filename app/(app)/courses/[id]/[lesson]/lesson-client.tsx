"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Heading, Body } from "@/components/ui/typography";
import { Stack } from "@/components/ui/spacing";
import { SectionRenderer, type Section } from "../../_components/section-renderer";
import { SectionNavigator } from "../../_components/section-navigator";
import { completeSectionAction, checkSectionCompletion } from "../../_lib/actions";

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
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Heading level={2}>Loading...</Heading>
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh"
      style={{
        color: "#e8e8e8",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        minHeight: "100vh",
        position: "relative",
        background: "linear-gradient(-45deg, #1a1a2e, #16213e, #0f3460, #1a1a2e)",
        backgroundSize: "400% 400%",
      }}
    >
      <main className="mx-auto max-w-5xl px-4 pt-6 pb-16 relative z-10">
        <Stack gap="loose">
          {/* Back button */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link
              href={`/courses/${courseId}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "500",
                background: "rgba(255, 255, 255, 0.1)",
                color: "#e8e8e8",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                textDecoration: "none",
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </Link>
          </div>

          {/* Lesson header */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              padding: "24px",
            }}
          >
            <Stack gap="default">
              <Heading level={2} style={{ color: "#ffffff", fontWeight: 600 }}>
                {lessonMeta.title}
              </Heading>
              {lessonMeta.description && (
                <Body style={{ color: "#94a3b8" }}>
                  {lessonMeta.description}
                </Body>
              )}
            </Stack>
          </div>

          {/* Current section */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
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
          </div>

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
