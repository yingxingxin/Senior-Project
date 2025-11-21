'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/ui/spacing';
import { Body } from '@/components/ui/typography';
import { Sparkles, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface GenerationProgressDialogProps {
  jobId: string;
  topic: string;
  onComplete: (lessonSlug: string) => void;
  onCancel: () => void;
}

interface JobStatus {
  jobId: string;
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress?: {
    percentage: number;
    step: string;
    message: string;
  };
  result?: {
    lessonId: number;
    lessonSlug: string;
    lessonTitle: string;
    sectionCount: number;
    generationTimeMs: number;
    lessonUrl: string;
  };
  error?: string;
}

const stepMessages: Record<string, string> = {
  waiting: 'Waiting to start...',
  loading_context: 'Loading your learning profile...',
  building_prompt: 'Crafting personalized prompt...',
  generating_content: 'AI is creating your lesson...',
  validating_content: 'Validating content quality...',
  storing_content: 'Saving your lesson...',
};

export function GenerationProgressDialog({
  jobId,
  topic,
  onComplete,
  onCancel,
}: GenerationProgressDialogProps) {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function pollStatus() {
      try {
        const response = await fetch(`/api/ai-lessons/jobs/${jobId}/status`);
        if (!response.ok) {
          throw new Error('Failed to fetch job status');
        }

        const data: JobStatus = await response.json();
        setStatus(data);

        // Handle completion
        if (data.state === 'completed' && data.result) {
          clearInterval(intervalId);
          setTimeout(() => {
            onComplete(data.result!.lessonSlug);
          }, 1500); // Short delay to show success state
        }

        // Handle failure
        if (data.state === 'failed') {
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        // Continue polling even on error
      }
    }

    // Initial poll
    pollStatus();

    // Poll every 2 seconds
    intervalId = setInterval(pollStatus, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [jobId, onComplete]);

  const handleClose = () => {
    if (status?.state === 'completed' || status?.state === 'failed') {
      setIsOpen(false);
      onCancel();
    }
  };

  const progressPercentage = status?.progress?.percentage || 0;
  const currentStep = status?.progress?.step || 'waiting';
  const currentMessage = status?.progress?.message || stepMessages[currentStep] || 'Processing...';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {status?.state === 'completed' ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Lesson Generated!
              </>
            ) : status?.state === 'failed' ? (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                Generation Failed
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-primary" />
                Generating Lesson
              </>
            )}
          </DialogTitle>
          <DialogDescription>{topic}</DialogDescription>
        </DialogHeader>

        <Stack gap="default" className="py-4">
          {status?.state === 'completed' && status.result ? (
            // Success state
            <Stack gap="default" className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <Body className="font-semibold">{status.result.lessonTitle}</Body>
                <Body className="text-sm text-muted-foreground">
                  {status.result.sectionCount} sections •{' '}
                  {Math.round(status.result.generationTimeMs / 1000)}s generation time
                </Body>
              </div>
              <Body className="text-sm text-muted-foreground">
                Redirecting to your lesson...
              </Body>
            </Stack>
          ) : status?.state === 'failed' ? (
            // Error state
            <Stack gap="default" className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <Body className="text-destructive">
                {status.error || 'An error occurred during generation'}
              </Body>
              <Button onClick={handleClose} variant="outline">
                Close
              </Button>
            </Stack>
          ) : (
            // Loading state
            <>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <Body className="text-sm font-medium">{currentMessage}</Body>
              </div>

              <Progress value={progressPercentage} className="w-full" />

              <Body className="text-xs text-muted-foreground text-center">
                {progressPercentage}% complete
              </Body>

              <Body className="text-xs text-muted-foreground text-center">
                This usually takes 30-60 seconds. Please don't close this window.
              </Body>
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
