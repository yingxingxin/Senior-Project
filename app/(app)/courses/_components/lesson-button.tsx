"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <Button
        disabled
        variant="outline"
        size={variant === "hero" ? "default" : "sm"}
        className="opacity-70 cursor-not-allowed"
      >
        <CheckCircle className={variant === "hero" ? "h-5 w-5" : "h-4 w-4"} />
        Completed
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      size={variant === "hero" ? "lg" : "sm"}
      className={`bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-primary/30 shadow-lg ${
        isLoading ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className={`${variant === "hero" ? "h-5 w-5" : "h-4 w-4"} animate-spin`} />
          {loadingLabel}
        </>
      ) : (
        <>
          <Play className={variant === "hero" ? "h-5 w-5" : "h-4 w-4"} />
          {resolvedLabel}
        </>
      )}
    </Button>
  );
}
