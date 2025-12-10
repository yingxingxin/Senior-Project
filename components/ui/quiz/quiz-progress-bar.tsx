import { Progress } from '@/components/ui/progress';
import { Stack } from '@/components/ui/spacing';
import { Body, Muted } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

export interface QuizProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showLabel?: boolean;
}

export function QuizProgressBar({
  current,
  total,
  className,
  showLabel = true,
}: QuizProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <Stack gap="tight" className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <Muted variant="small" className="font-medium">
            Progress
          </Muted>
          <Body variant="small" className="text-muted-foreground" aria-live="polite">
            {current} of {total}
          </Body>
        </div>
      )}
      <Progress 
        value={percentage} 
        className="h-2"
        aria-label={`Quiz progress: ${current} of ${total} questions answered (${percentage}%)`}
      />
    </Stack>
  );
}

