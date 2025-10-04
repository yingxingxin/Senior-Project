'use client';

import { useOnboarding } from '@/app/onboarding/_context/onboarding-context';
import { ASSISTANT_FIXTURES } from '@/src/lib/constants';
import { PERSONA_OPTIONS } from '@/src/lib/constants';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Inline, Stack, Grid } from '@/components/ui/spacing';
import { Heading, Body, Muted } from '@/components/ui/typography';
import { Sparkles, User, Target } from 'lucide-react';

export function GuidedIntroCompletion() {
  const { complete, pending, error, assistantId, persona, skillLevel } = useOnboarding();

  const selectedAssistant = ASSISTANT_FIXTURES.find((a, index) => index + 1 === assistantId);
  const selectedPersona = PERSONA_OPTIONS.find(p => p.id === persona);

  const skillLevelLabel = skillLevel
    ? skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)
    : 'Not assessed';

  return (
    <Stack gap="default">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <Stack gap="default">
            <Heading level={4}>Your Setup</Heading>

            <Grid gap="tight" cols={1}>
              {selectedAssistant && (
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <Inline gap="tight" align="center">
                    <Sparkles className="size-5 text-primary flex-shrink-0" />
                    <Stack gap="tight">
                      <Muted variant="small" className="font-medium">Assistant</Muted>
                      <Body>
                        {selectedAssistant.name} — {selectedAssistant.tagline}
                      </Body>
                    </Stack>
                  </Inline>
                </div>
              )}

              {selectedPersona && (
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <Inline gap="tight" align="center">
                    <User className="size-5 text-primary flex-shrink-0" />
                    <Stack gap="tight">
                      <Muted variant="small" className="font-medium">Personality</Muted>
                      <Body>
                        {selectedPersona.title} — {selectedPersona.subtitle}
                      </Body>
                    </Stack>
                  </Inline>
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <Inline gap="tight" align="center">
                  <Target className="size-5 text-primary flex-shrink-0" />
                  <Stack gap="tight">
                    <Muted variant="small" className="font-medium">Skill Level</Muted>
                    <Body>{skillLevelLabel}</Body>
                  </Stack>
                </Inline>
              </div>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      <Inline gap="default" align="center" className="justify-center">
        <Button
          type="button"
          onClick={() => void complete()}
          disabled={pending}
          size="lg"
          className="min-w-48"
        >
          {pending ? 'Finishing…' : 'Launch Dashboard Tour'}
        </Button>
      </Inline>
    </Stack>
  );
}
