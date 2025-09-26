"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type Question = {
  id: number;
  text: string;
  orderIndex: number;
  options: { id: number; text: string; orderIndex: number }[];
};

export function SkillQuizForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number | undefined>>({});
  const [result, setResult] = useState<null | { level: string; suggestedCourse: string; score: number; total: number; next: string }>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/skill-quiz/questions', { cache: 'no-store' });
        const data = await res.json();
        if (mounted) {
          setQuestions(data.questions ?? []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id] !== undefined);

  async function onSubmit() {
    setSubmitting(true);
    try {
      const payload = {
        answers: questions.map(q => ({ questionId: q.id, optionId: answers[q.id]! })),
      };
      const res = await fetch('/api/skill-quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || 'Submission failed');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading questions…</div>;
  }

  if (result) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your starting level: {result.level.toUpperCase()}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">Score: {result.score} / {result.total}</p>
          <p>Suggested course: <strong>{result.suggestedCourse}</strong></p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push(result.next)}>Continue</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((q, idx) => (
        <Card key={q.id}>
          <CardHeader>
            <CardTitle className="text-base">Q{idx + 1}. {q.text}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[q.id]?.toString() ?? ''}
              onValueChange={(val) => setAnswers(prev => ({ ...prev, [q.id]: Number(val) }))}
            >
              <div className="grid gap-3">
                {q.options.map(opt => (
                  <Label key={opt.id} className="flex items-center gap-3 cursor-pointer">
                    <RadioGroupItem id={`q${q.id}-o${opt.id}`} value={opt.id.toString()} />
                    <span>{opt.text}</span>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button disabled={!allAnswered || submitting} onClick={onSubmit}>
          {submitting ? 'Submitting…' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}


