import Link from "next/link";
import { ArrowRight, Clock, BookOpen, Users } from "lucide-react";
import { Heading, Body, Muted } from "@/components/ui/typography";
import { Stack, Grid } from "@/components/ui/spacing";
import { getCoursesWithStats, formatDuration } from "./_lib/actions";

export default async function CoursesPage() {
  const allCourses = await getCoursesWithStats();

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
          {/* Header */}
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
              <Heading level={2} style={{color: '#ffffff', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontWeight: '600'}}>Courses</Heading>
              <Body style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontSize: '18px'}}>
                Choose from our carefully curated courses designed to take you from beginner to advanced.
              </Body>
            </Stack>
          </div>

          {/* Courses Grid */}
          <Grid cols={3} gap="default">
            {allCourses.map((course) => (
              <div 
                key={course.id} 
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  padding: '24px',
                  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                  color: '#e8e8e8',
                  transition: 'all 0.2s ease'
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      style={{
                        width: '48px',
                        height: '48px',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#ffffff',
                        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                      }}>
                      {course.icon}
                    </div>
                    <div 
                      style={{
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#a78bfa',
                        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
                      }}>
                      {course.difficulty}
                    </div>
                  </div>
                  
                  <Stack gap="default">
                    <Heading level={4} style={{color: '#ffffff', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontWeight: '600'}}>{course.title}</Heading>
                    <Body style={{color: '#e8e8e8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", lineHeight: '1.6'}}>
                      {course.description}
                    </Body>
                    
                    {/* Course Stats */}
                    <div className="flex items-center gap-4 text-sm" style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>
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
                    <Link
                      href={`/courses/${course.slug}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#ffffff',
                        borderRadius: '12px',
                        border: 'none',
                        textDecoration: 'none',
                        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Start Course
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Stack>
                </div>
              </div>
            ))}
          </Grid>

          {/* Additional Info */}
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
            <Stack gap="default" className="text-center">
              <div className="flex items-center justify-center gap-2" style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>
                <Users className="h-5 w-5" />
                <Muted variant="small" style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>Concept-First, Language-Second Learning</Muted>
              </div>
              <Body variant="small" style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", maxWidth: '32rem', margin: '0 auto'}}>
                Our courses follow a proven learning methodology that focuses on understanding 
                core concepts before diving into specific programming languages. This approach 
                helps you build a solid foundation and transfer knowledge across different technologies.
              </Body>
            </Stack>
          </div>
        </Stack>
      </main>
    </div>
  );
}
