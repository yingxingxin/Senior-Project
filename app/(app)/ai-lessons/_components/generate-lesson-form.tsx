'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Stack } from '@/components/ui/spacing';
import { Body } from '@/components/ui/typography';
import { Sparkles, Loader2 } from 'lucide-react';
import { GenerationProgressDialog } from './generation-progress-dialog';

type Difficulty = 'easy' | 'standard' | 'hard';

interface FormData {
  topic: string;
  difficulty: Difficulty;
  context: string;
  estimatedDurationMinutes: number;
}

export function GenerateLessonForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    difficulty: 'standard',
    context: '',
    estimatedDurationMinutes: 30,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ai-lessons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: formData.topic,
          difficulty: formData.difficulty,
          context: formData.context || undefined,
          estimatedDurationMinutes: formData.estimatedDurationMinutes,
          triggerSource: 'manual',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate lesson');
      }

      const result = await response.json();
      setJobId(result.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  const handleGenerationComplete = (lessonSlug: string, firstSectionSlug: string) => {
    // Redirect to course overview page to show all child lessons
    router.push(`/courses/${lessonSlug}`);
  };

  const handleGenerationCancel = () => {
    setJobId(null);
    setIsSubmitting(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Stack gap="loose">
          {/* Topic */}
          <div>
            <Label htmlFor="topic">
              Topic <span className="text-destructive">*</span>
            </Label>
            <Input
              id="topic"
              type="text"
              placeholder="e.g., React Hooks, Binary Search Trees, Machine Learning Basics"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              required
              maxLength={200}
              disabled={isSubmitting}
            />
            <Body className="text-xs text-muted-foreground mt-1">
              Be specific for better results
            </Body>
          </div>

          {/* Difficulty */}
          <div>
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) =>
                setFormData({ ...formData, difficulty: value as Difficulty })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy - Thorough explanations</SelectItem>
                <SelectItem value="standard">Standard - Moderate detail</SelectItem>
                <SelectItem value="hard">Hard - Concise and technical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estimated Duration */}
          <div>
            <Label htmlFor="duration">Estimated Duration (minutes)</Label>
            <Select
              value={String(formData.estimatedDurationMinutes)}
              onValueChange={(value) =>
                setFormData({ ...formData, estimatedDurationMinutes: Number(value) })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger id="duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes - Quick overview</SelectItem>
                <SelectItem value="30">30 minutes - Standard lesson</SelectItem>
                <SelectItem value="45">45 minutes - In-depth coverage</SelectItem>
                <SelectItem value="60">60 minutes - Comprehensive study</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Context (optional) */}
          <div>
            <Label htmlFor="context">Additional Context (optional)</Label>
            <Textarea
              id="context"
              placeholder="e.g., I'm building a web app and need to understand state management..."
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              maxLength={2000}
              rows={4}
              disabled={isSubmitting}
            />
            <Body className="text-xs text-muted-foreground mt-1">
              Provide background or specific use cases for more tailored content
            </Body>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <Body className="text-sm text-destructive">{error}</Body>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isSubmitting || !formData.topic.trim()}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Lesson
              </>
            )}
          </Button>
        </Stack>
      </form>

      {/* Progress dialog */}
      {jobId && (
        <GenerationProgressDialog
          jobId={jobId}
          topic={formData.topic}
          onComplete={handleGenerationComplete}
          onCancel={handleGenerationCancel}
        />
      )}
    </>
  );
}
