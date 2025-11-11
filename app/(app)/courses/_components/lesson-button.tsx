"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Play, Loader2 } from "lucide-react";
import { startLesson } from "../_lib/actions";

interface LessonButtonProps {
  lessonId: number;
  lessonSlug: string;
  courseId: string;
  isCompleted: boolean;
  hasStarted: boolean;
  variant?: "default" | "hero";
  label?: string;
}

export function LessonButton({
  lessonId,
  lessonSlug,
  courseId,
  isCompleted,
  hasStarted,
  variant = "default",
  label,
}: LessonButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const resolvedLabel = label ?? (hasStarted ? 'Continue' : 'Start');
  const loadingLabel = hasStarted ? 'Continuing...' : 'Starting...';
  const iconSize = variant === "hero" ? 20 : 16;

  const handleClick = async () => {
    if (isCompleted) return; // Don't allow clicking if already completed
    
    setIsLoading(true);
    
    try {
      if (!hasStarted) {
        // Start the lesson and navigate to it
        const result = await startLesson(lessonId);
        if (result.success) {
          // Navigate to the lesson
          router.push(`/courses/${courseId}/${lessonSlug}`);
        } else {
          console.error('Failed to start lesson:', result.error);
        }
      } else {
        // Continue the lesson - just navigate to it
        router.push(`/courses/${courseId}/${lessonSlug}`);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <button
        disabled
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: variant === "hero" ? '8px' : '6px',
          padding: variant === "hero" ? '12px 28px' : '8px 16px',
          fontSize: variant === "hero" ? '16px' : '14px',
          fontWeight: '500',
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#e8e8e8',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          cursor: 'not-allowed',
          opacity: 0.7
        }}
      >
        <CheckCircle style={{ width: iconSize, height: iconSize }} />
        Completed
      </button>
    );
  }

  const buttonStyles =
    variant === "hero"
      ? {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '16px 32px',
          fontSize: '16px',
          fontWeight: '600',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          border: 'none',
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
          transition: 'all 0.2s ease',
        }
      : {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '500',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff',
          borderRadius: '8px',
          border: 'none',
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          transition: 'all 0.2s ease',
        };

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading}
      style={{
        ...buttonStyles,
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.7 : 1
      }}
    >
      {isLoading ? (
        <>
          <Loader2 style={{ width: iconSize, height: iconSize }} className="animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          <Play style={{ width: iconSize, height: iconSize }} />
          {resolvedLabel}
        </>
      )}
    </button>
  );
}
