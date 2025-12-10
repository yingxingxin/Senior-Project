import { notFound } from "next/navigation";
import { Heading, Body } from "@/components/ui/typography";
import { Stack } from "@/components/ui/spacing";
import { getLessonWithSections } from "@/src/db/queries/lessons";
import { LessonClient } from "./lesson-client";
import { getCourseData } from "../../_lib/actions";
import type { JSONContent } from '@tiptap/core';

interface LessonPageProps {
  params: Promise<{ id: string; lesson: string }>;
}

/**
 * Server component that fetches lesson data and renders the client component
 */
export default async function LessonPage({ params }: LessonPageProps) {
  const { id, lesson } = await params;

  // Fetch lesson and sections from database
  const rows = await getLessonWithSections.execute({ lessonSlug: lesson });

  if (!rows || rows.length === 0) {
    notFound();
  }

  // Fetch course data for AI context (course hierarchy)
  const courseData = await getCourseData(id);

  // Parse lesson metadata
  const lessonMeta = {
    id: rows[0].id,
    slug: rows[0].slug,
    title: rows[0].title,
    description: rows[0].description || "",
  };

  // Parse and sort sections
  const sections = rows
    .filter((r) => r.sectionId)
    .map((r) => ({
      id: r.sectionId as number,
      slug: r.sectionSlug as string,
      title: r.sectionTitle as string,
      bodyJson: r.sectionBodyJson as JSONContent | undefined,
      body: r.sectionBodyMd as string, // Legacy fallback for sections without body_json
      order: r.sectionOrder as number,
    }))
    .sort((a, b) => a.order - b.order);

  // Validate we have sections
  if (sections.length === 0) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Stack gap="default" className="text-center">
          <Heading level={2}>No sections found</Heading>
          <Body className="text-muted-foreground">
            This lesson doesn&apos;t have any content yet.
          </Body>
        </Stack>
      </div>
    );
  }

  // Build course context for AI (lesson position in course hierarchy)
  const currentLessonIndex = courseData?.lessons.findIndex(l => l.slug === lesson) ?? -1;
  const courseContext = courseData ? {
    id: parseInt(courseData.courseId),
    title: courseData.courseTitle,
    slug: id,
    lessonIndex: currentLessonIndex,
    totalLessons: courseData.totalLessons,
    previousLesson: currentLessonIndex > 0 ? courseData.lessons[currentLessonIndex - 1]?.title : undefined,
    nextLesson: currentLessonIndex < courseData.totalLessons - 1 ? courseData.lessons[currentLessonIndex + 1]?.title : undefined,
  } : undefined;

  return (
    <LessonClient
      courseId={id}
      lessonSlug={lesson}
      lessonMeta={lessonMeta}
      sections={sections}
      courseContext={courseContext}
    />
  );
}
