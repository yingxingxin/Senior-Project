import Link from "next/link";
import Image from "next/image";
import { BookOpen, Sparkles, Bot, Swords } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/ui/audio-player";
import { Heading, Muted, Body } from "@/components/ui/typography";
import { Inline, Stack } from "@/components/ui/spacing";

type Persona = "kind" | "direct" | "calm";
type Gender = "feminine" | "masculine" | "androgynous";

type AssistantInfo = {
  id: number;
  name: string;
  slug: string;
  gender: Gender | null;
  avatarUrl: string | null;
  tagline: string | null;
  description: string | null;
};

interface AssistantHeroProps {
  persona: Persona;
  assistant: AssistantInfo;
  primaryAction: {
    title: string;
    cta: string;
    href: string;
  };
  speech: string;
}

export function AssistantHero({ persona, assistant, primaryAction, speech }: AssistantHeroProps) {
  const quickActions = [
    { label: "Courses", href: "/courses", icon: BookOpen },
    { label: "Quiz", href: "/quizzes", icon: Sparkles },
    { label: "Practice", href: "/editor", icon: Swords },
  ];

  return (
    <Card className="bg-card/50 backdrop-blur border-border shadow-lg">
      <div className="p-6">
        <Inline gap="loose" align="start">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-20 w-20 border-2 border-border rounded-2xl grid place-items-center overflow-hidden bg-gradient-to-br from-primary to-accent shadow-primary/30 shadow-lg">
              {assistant.avatarUrl ? (
                <Image
                  src={assistant.avatarUrl}
                  alt={`${assistant.name} avatar`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Bot className="h-10 w-10 text-primary-foreground" />
              )}
            </div>
            <div className="absolute -right-2 -bottom-2 border-2 border-border rounded-lg px-2 py-1 text-[10px] font-semibold bg-background/90 text-primary">
              {persona}
            </div>
          </div>

          {/* Speech + CTA + Actions */}
          <div className="flex-1">
            {/* Assistant Info */}
            <Stack gap="tight" className="mb-3">
              <Heading level={5} className="text-foreground">{assistant.name}</Heading>
              {assistant.tagline && (
                <Muted variant="small" className="italic text-muted-foreground">{assistant.tagline}</Muted>
              )}
            </Stack>

            {/* Speech Bubble */}
            <div className="relative inline-block max-w-full mb-4">
              <Card className="border-border bg-card/30 backdrop-blur">
                <div className="p-4">
                  <Inline gap="default" align="start">
                    <Body className="flex-1 text-foreground">{speech}</Body>
                    <AudioPlayer
                      text={speech}
                      persona={persona}
                      gender={assistant.gender ?? undefined}
                      size="sm"
                      className="shrink-0 mt-1"
                    />
                  </Inline>
                </div>
              </Card>
              {/* Speech bubble tail */}
              <div className="absolute -left-2 top-6 h-3 w-3 rotate-45 border border-border bg-card/30 backdrop-blur" />
            </div>

            {/* Actions */}
            <Inline gap="default" align="center">
              <Inline gap="tight">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.label}
                      asChild
                      variant="secondary"
                      size="sm"
                      className="bg-muted/50 text-foreground border-border"
                    >
                      <Link href={action.href}>
                        <Icon className="h-4 w-4" />
                        {action.label}
                      </Link>
                    </Button>
                  );
                })}
              </Inline>
            </Inline>
          </div>
        </Inline>
      </div>
    </Card>
  );
}
