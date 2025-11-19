import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, BookOpen, CheckCircle } from "lucide-react";
import { Heading, Body, Muted } from "@/components/ui/typography";
import { Stack, Grid } from "@/components/ui/spacing";
import { getCourseData } from "../_lib/actions";
import { formatDuration } from "../_lib/utils";
import { LessonButton } from "../_components/lesson-button";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params;

  // Get course data with progress (id is the slug)
  const courseData = await getCourseData(id);

  if (!courseData) {
    notFound();
  }

  const { lessons, completedLessons, totalLessons, progressPercentage, courseTitle, courseIcon, courseDifficulty, courseDescription, courseEstimatedDurationSec } = courseData;
  const startedLesson = lessons.find((lesson) => lesson.startedAt && !lesson.isCompleted);
  const nextLesson = lessons.find((lesson) => !lesson.isCompleted);
  const lessonToOpen = startedLesson ?? nextLesson ?? null;
  const hasProgress = lessons.some((lesson) => lesson.startedAt !== null || lesson.isCompleted);
  const primaryCtaLabel = hasProgress ? 'Continue Learning' : 'Start Course';
  const disabledCtaMessage = lessons.length === 0 ? 'Course Content Coming Soon' : 'Course Completed';

  return (
    <div 
      className="min-h-dvh"
      style={{
        color: '#e8e8e8',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        minHeight: '100vh',
        position: 'relative',
        background: 'linear-gradient(-45deg, #1a1a2e, #16213e, #0f3460, #1a1a2e)',
        backgroundSize: '400% 400%'
      }}
    >
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-16 relative z-10">
        <Stack gap="loose">
          {/* Back Button */}
          <Link 
            href="/courses"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#e8e8e8',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textDecoration: 'none',
              fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>

          {/* Course Header */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            padding: '24px',
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
            color: '#e8e8e8'
          }}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div 
                  style={{
                    width: '64px',
                    height: '64px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#ffffff',
                    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                  }}>
                  {courseIcon}
                </div>
                <div
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#a78bfa',
                    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
                  }}>
                  {courseDifficulty}
                </div>
              </div>
              
              <Stack gap="default">
                <Heading level={1} style={{color: '#ffffff', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontWeight: '600', fontSize: '32px'}}>{courseTitle}</Heading>
                <Body style={{color: '#e8e8e8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontSize: '18px', lineHeight: '1.6'}}>
                  {courseDescription}
                </Body>

                    {/* Course Stats */}
                    <div className="flex items-center gap-6 text-sm" style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{totalLessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(courseEstimatedDurationSec)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>{completedLessons} completed</span>
                      </div>
                    </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>Progress</span>
                    <span style={{fontWeight: '600', color: '#ffffff', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>{progressPercentage}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    height: '8px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div 
                      style={{ 
                        width: `${progressPercentage}%`,
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        height: '100%',
                        transition: 'width 0.3s ease',
                        borderRadius: '8px',
                        boxShadow: '0 0 12px rgba(102, 126, 234, 0.5)'
                      }}
                    />
                  </div>
                </div>

                {/* Start/Continue Button */}
                {lessonToOpen ? (
                  <LessonButton
                    variant="hero"
                    label={primaryCtaLabel}
                    lessonId={lessonToOpen.id}
                    lessonSlug={lessonToOpen.slug}
                    courseId={id}
                    isCompleted={lessonToOpen.isCompleted}
                    hasStarted={lessonToOpen.startedAt !== null}
                  />
                ) : (
                  <button
                    disabled
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '16px 32px',
                      fontSize: '16px',
                      fontWeight: '600',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#e2e8f0',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                      opacity: 0.7,
                      cursor: 'not-allowed'
                    }}
                  >
                    {disabledCtaMessage}
                  </button>
                )}
              </Stack>
            </div>
          </div>

          {/* Lessons List */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            padding: '24px',
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
            color: '#e8e8e8'
          }}>
            <Stack gap="default">
              <Heading level={3} style={{color: '#ffffff', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontWeight: '600'}}>Course Content</Heading>
                  <Grid cols={1} gap="tight">
                    {lessons.map((lesson) => (
                      <div
                        key={lesson.id} 
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          padding: '16px',
                          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                          color: '#e8e8e8',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: lesson.isCompleted ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: lesson.isCompleted ? '#ffffff' : '#e8e8e8',
                                fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
                              }}>
                              {lesson.isCompleted ? (
                                <CheckCircle className="h-4 w-4" style={{color: '#ffffff'}} />
                              ) : (
                                lesson.orderIndex
                              )}
                            </div>
                            {lesson.icon && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  fontSize: '18px',
                                  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                                  flexShrink: 0
                                }}>
                                {lesson.icon}
                              </div>
                            )}
                            <div>
                              <Heading level={6} style={{color: '#ffffff', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontWeight: '600', marginBottom: '4px'}}>{lesson.title}</Heading>
                              <Muted variant="small" style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>{lesson.description}</Muted>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Muted variant="small" style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>{formatDuration(lesson.estimatedDurationSec)}</Muted>
                            <LessonButton 
                              lessonId={lesson.id}
                              lessonSlug={lesson.slug}
                              courseId={id}
                              isCompleted={lesson.isCompleted}
                              hasStarted={lesson.startedAt !== null}
                            />
                            {lesson.isCompleted ? (
                              <Link 
                                href={`/courses/${id}/${lesson.slug}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  padding: '8px 12px',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  background: 'rgba(16, 185, 129, 0.1)',
                                  color: '#10b981',
                                  borderRadius: '8px',
                                  border: '1px solid rgba(16, 185, 129, 0.2)',
                                  textDecoration: 'none',
                                  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                Revisit Lesson
                              </Link>
                            ) : (
                              <Link 
                                href={`/courses/${id}/${lesson.slug}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  padding: '8px 12px',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  color: '#e8e8e8',
                                  borderRadius: '8px',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  textDecoration: 'none',
                                  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                Open Lesson
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </Grid>
            </Stack>
          </div>
        </Stack>
      </main>
    </div>
  );
}
