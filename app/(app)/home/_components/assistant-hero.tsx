import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, BookOpen, Sparkles, MessageSquare, Bot, Swords } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AudioPlayer } from "@/components/ui/audio-player";
import { Heading, Muted, Body } from "@/components/ui/typography";
import { Inline } from "@/components/ui/spacing";

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
    { label: "Quiz", href: "/quiz", icon: Sparkles },
    { label: "Ask", href: "/ask", icon: MessageSquare },
    { label: "Practice", href: "/practice", icon: Swords },
  ];

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      padding: '24px',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      color: '#e8e8e8'
    }}>
      <div className="p-6">
        <Inline gap="loose" align="start">
          {/* Avatar */}
          <div className="relative shrink-0">
                <div 
                  style={{
                    height: '80px',
                    width: '80px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    display: 'grid',
                    placeItems: 'center',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                  }}>
              {assistant.avatarUrl ? (
                <Image
                  src={assistant.avatarUrl}
                  alt={`${assistant.name} avatar`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Bot className="h-10 w-10" style={{color: '#ffffff'}} />
              )}
            </div>
            <div style={{
              position: 'absolute',
              right: '-8px',
              bottom: '-8px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '10px',
              fontWeight: '600',
              background: 'rgba(26, 26, 46, 0.9)',
              color: '#a78bfa',
              fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
            }}>
              {persona}
            </div>
          </div>

          {/* Speech + CTA + Actions */}
          <div className="flex-1">
            {/* Assistant Info */}
            <div className="mb-3">
              <Heading level={5} style={{color: '#ffffff', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontWeight: '600'}}>{assistant.name}</Heading>
              {assistant.tagline && (
                <Muted variant="small" className="italic" style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>{assistant.tagline}</Muted>
              )}
            </div>

            <div className="relative inline-block max-w-full mb-4">
              <div style={{
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px 20px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                color: '#e8e8e8',
                fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
              }}>
                <Inline gap="default" align="start">
                  <Body className="flex-1" style={{color: '#e8e8e8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>{speech}</Body>
                  <AudioPlayer
                    text={speech}
                    persona={persona}
                    gender={assistant.gender ?? undefined}
                    size="sm"
                    className="shrink-0 mt-1"
                  />
                </Inline>
              </div>
              {/* tail */}
              <div style={{
                position: 'absolute',
                left: '-8px',
                top: '24px',
                height: '12px',
                width: '12px',
                transform: 'rotate(45deg)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)'
              }} />
            </div>

            <Inline gap="default" align="center">
              <Link
                href={primaryAction.href}
                className="primary-button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  borderRadius: '12px',
                  border: 'none',
                  textDecoration: 'none',
                  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Play className="h-4 w-4" />
                {primaryAction.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Inline gap="tight">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="secondary-button"
                      style={{
                        padding: '10px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#e8e8e8',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        textDecoration: 'none',
                        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Inline gap="tight" align="center" as="span">
                        <Icon className="h-4 w-4" />
                        <Body variant="small" as="span" style={{fontWeight: '500', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>{action.label}</Body>
                      </Inline>
                    </Link>
                  );
                })}
              </Inline>
            </Inline>
          </div>
        </Inline>
      </div>
    </div>
  );
}