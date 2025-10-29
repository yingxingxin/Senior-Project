import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
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
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5" style={{color: '#a78bfa'}} />
          <Heading level={5} style={{color: '#ffffff', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontWeight: '600'}}>Recommended for You</Heading>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          color: '#e8e8e8',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
        }}>
          <Stack gap="default">
            <div className="flex items-start justify-between">
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
                {recommendedCourse.icon}
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
                {recommendedCourse.difficulty}
              </div>
            </div>

            <Stack gap="tight">
              <Heading level={6} style={{color: '#ffffff', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontWeight: '600'}}>{recommendedCourse.title}</Heading>
              <Body variant="small" style={{color: '#e8e8e8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>
                {recommendedCourse.description}
              </Body>
            </Stack>

            <div className="flex items-center gap-4 text-sm" style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>
              <span>{recommendedCourse.lessonsCount} lessons</span>
              <span>•</span>
              <span>{recommendedCourse.estimatedDuration}</span>
            </div>

            <Link
              href={`/courses/${recommendedCourse.id}`}
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
    </div>
  );
}
