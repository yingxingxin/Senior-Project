'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Stack } from '@/components/ui/spacing';
import { Body } from '@/components/ui/typography';
import { Sparkles, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type QuizType = 'comprehensive' | 'quick-review' | 'specific-lesson';
type QuizLength = 5 | 10 | 15 | 20;

interface Course {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  lessonsCount: number;
}

interface FormData {
  courseId: number | null;
  quizType: QuizType;
  quizLength: QuizLength;
  lessonId?: number | null;
}

interface GenerateQuizFormProps {
  courses: Course[];
}

export function GenerateQuizForm({ courses }: GenerateQuizFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    courseId: courses.length > 0 ? courses[0].id : null,
    quizType: 'comprehensive',
    quizLength: 10,
    lessonId: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCourse = courses.find(c => c.id === formData.courseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: formData.courseId,
          quizType: formData.quizType,
          quizLength: formData.quizLength,
          lessonId: formData.lessonId || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate quiz');
      }

      const result = await response.json();
      // Redirect to the generated quiz
      router.push(`/quizzes/${result.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="loose">
        {/* Course Selection */}
        <div>
          <Label htmlFor="course">
            Select Course <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.courseId?.toString() || ''}
            onValueChange={(value) =>
              setFormData({ ...formData, courseId: Number(value), lessonId: null })
            }
            disabled={isSubmitting}
          >
            <SelectTrigger id="course">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.title} ({course.lessonsCount} {course.lessonsCount === 1 ? 'lesson' : 'lessons'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCourse?.description && (
            <Body className="text-xs text-muted-foreground mt-1">
              {selectedCourse.description}
            </Body>
          )}
        </div>

        {/* Quiz Type */}
        <div>
          <Label htmlFor="quizType">Quiz Type</Label>
          <Select
            value={formData.quizType}
            onValueChange={(value) =>
              setFormData({ ...formData, quizType: value as QuizType, lessonId: null })
            }
            disabled={isSubmitting}
          >
            <SelectTrigger id="quizType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comprehensive">
                Comprehensive - Questions from entire course
              </SelectItem>
              <SelectItem value="quick-review">
                Quick Review - Key concepts and fundamentals
              </SelectItem>
              <SelectItem value="specific-lesson" disabled={!selectedCourse || selectedCourse.lessonsCount === 0}>
                Specific Lesson - Focus on one lesson (requires lesson selection)
              </SelectItem>
            </SelectContent>
          </Select>
          <Body className="text-xs text-muted-foreground mt-1">
            {formData.quizType === 'comprehensive' && 'Covers all lessons in the course'}
            {formData.quizType === 'quick-review' && 'Focuses on essential concepts and key takeaways'}
            {formData.quizType === 'specific-lesson' && 'Tests understanding of a single lesson'}
          </Body>
        </div>

        {/* Quiz Length */}
        <div>
          <Label htmlFor="quizLength">Number of Questions</Label>
          <Select
            value={formData.quizLength.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, quizLength: Number(value) as QuizLength })
            }
            disabled={isSubmitting}
          >
            <SelectTrigger id="quizLength">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 questions - Quick check</SelectItem>
              <SelectItem value="10">10 questions - Standard quiz</SelectItem>
              <SelectItem value="15">15 questions - Comprehensive test</SelectItem>
              <SelectItem value="20">20 questions - Full assessment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isSubmitting || !formData.courseId}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating Quiz...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Quiz
            </>
          )}
        </Button>
      </Stack>
    </form>
  );
}

