import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, BookOpen, Sparkles, MessageSquare, Bot, Swords } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AudioPlayer } from "@/components/ui/audio-player";

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
    { label: "Study", href: "/study", icon: BookOpen },
    { label: "Quiz", href: "/quiz", icon: Sparkles },
    { label: "Ask", href: "/ask", icon: MessageSquare },
    { label: "Practice", href: "/practice", icon: Swords },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-20 w-20 rounded-[24px] bg-primary grid place-items-center ring-4 ring-border overflow-hidden">
              {assistant.avatarUrl ? (
                <Image
                  src={assistant.avatarUrl}
                  alt={`${assistant.name} avatar`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Bot className="h-10 w-10 text-white" />
              )}
            </div>
            <div className="absolute -right-2 -bottom-2 rounded-full bg-background border border-border px-2 py-0.5 text-[10px] font-semibold text-primary shadow">
              {persona}
            </div>
          </div>

          {/* Speech + CTA + Actions */}
          <div className="flex-1">
            {/* Assistant Info */}
            <div className="mb-3">
              <h3 className="text-lg font-bold">{assistant.name}</h3>
              {assistant.tagline && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">{assistant.tagline}</p>
              )}
            </div>

            <div className="relative inline-block max-w-full mb-4">
              <div className="rounded-[18px] border border-border bg-accent px-5 py-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <p className="text-base leading-relaxed flex-1">{speech}</p>
                  <AudioPlayer 
                    text={speech}
                    persona={persona}
                    gender={assistant.gender}
                    size="sm"
                    className="shrink-0 mt-1"
                  />
                </div>
              </div>
              {/* tail */}
              <div className="absolute -left-2 top-6 h-3 w-3 rotate-45 border-l border-t bg-accent border-border" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={primaryAction.href}
                className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
              >
                <Play className="h-4 w-4" />
                {primaryAction.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="flex gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="rounded-[14px] border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}