// Root page for the app (/)
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  MessageCircle,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { getUserWithOnboarding } from "@/src/db/queries";
import { Display, Heading, Body } from "@/components/ui/typography";
import { Stack, Inline } from "@/components/ui/spacing";

async function getAuthState() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { isAuthenticated: false, user: null, hasCompletedOnboarding: false };
  }

  try {
    // Get user details including onboarding status
    const [user] = await getUserWithOnboarding.execute({
      userId: Number(session.user.id)
    });

    return {
      isAuthenticated: true,
      user,
      hasCompletedOnboarding: !!user?.onboardingCompletedAt
    };
  } catch {
    return { isAuthenticated: false, user: null, hasCompletedOnboarding: false };
  }
}

export default async function LandingPage() {
  const { isAuthenticated, hasCompletedOnboarding } = await getAuthState();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-6 px-4 mx-auto max-w-7xl">
        <Inline align="center" justify="between">
          <Inline align="center" gap="default">
            <Inline align="center" gap="tight">
              <Image src="/favicon.ico" alt="Sprite.exe" width={24} height={24} />
              <Heading level={4} as="span">Sprite.exe</Heading>
            </Inline>
            <nav className="hidden md:block">
              <Inline align="center" gap="default">
                <a href="#assistants" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Assistants
                </a>
                <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
              </Inline>
            </nav>
          </Inline>
          {isAuthenticated ? (
            <Link href="/home">
              <Button>Go to Dashboard</Button>
            </Link>
          ) : (
            <Inline align="center" gap="tight">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </Inline>
          )}
        </Inline>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center py-20 px-4 mx-auto max-w-7xl">
        <Stack gap="loose" className="items-start w-full">
          <Stack gap="default" className="max-w-4xl">
            <Display level={1} className="text-5xl md:text-6xl lg:text-7xl">
              Learn faster with an assistant that adapts to you
            </Display>
            <Body variant="large" className="text-muted-foreground text-xl">
              Sprite.exe pairs you with a personal AI partner to keep lessons engaging, make concepts
              stick, and help you stay accountable throughout your learning journey.
            </Body>
          </Stack>

          <Stack gap="tight">
            <Inline gap="tight" align="center" wrap={false}>
              {isAuthenticated ? (
                <Link href={hasCompletedOnboarding ? "/home" : "/onboarding"}>
                  <Button size="lg" className="gap-2">
                    {hasCompletedOnboarding ? "Go to Dashboard" : "Complete Setup"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="gap-2">
                      Start learning for free
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="ghost">
                      I already have an account
                    </Button>
                  </Link>
                </>
              )}
            </Inline>
          </Stack>
        </Stack>
      </section>

      {/* Assistants Section */}
      <section id="assistants" className="py-20 md:py-28 px-4 mx-auto max-w-7xl">
            <Stack gap="loose">
              <Stack gap="tight" className="max-w-3xl mx-auto text-center">
                <Heading level={2} className="text-4xl md:text-5xl font-bold">Meet Your AI Assistants</Heading>
                <Body className="text-muted-foreground text-lg">
                  Choose from three unique AI personalities, each designed to support different learning styles and preferences.
                </Body>
              </Stack>

            <Stack gap="section">
              {/* Nova - Enthusiastic & Encouraging */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <Stack gap="default">
                  <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <Stack gap="tight">
                    <Heading level={3} className="text-3xl font-bold">Nova</Heading>
                    <Body className="text-muted-foreground text-lg">
                      Enthusiastic and encouraging, Nova brings energy and positivity to every session. Perfect for learners who thrive with cheerful support and collaborative study sessions.
                    </Body>
                  </Stack>
                </Stack>
                <div className="relative aspect-[4/3] rounded-2xl bg-muted border border-border overflow-hidden">
                  <Image
                    src="https://pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev/nova-feminine-full-body.png"
                    alt="Nova assistant character"
                    fill
                    className="object-contain p-6"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>

              {/* Atlas - Structured & Strategic */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="relative aspect-[4/3] rounded-2xl bg-muted border border-border overflow-hidden">
                  <Image
                    src="https://pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev/atlas-masculine-full-body.png"
                    alt="Atlas assistant character"
                    fill
                    className="object-contain p-6"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <Stack gap="default">
                  <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <Stack gap="tight">
                    <Heading level={3} className="text-3xl font-bold">Atlas</Heading>
                    <Body className="text-muted-foreground text-lg">
                      Organized and methodical, Atlas excels at breaking down complex topics into clear, structured learning paths. Ideal for learners who prefer systematic, goal-oriented study approaches.
                    </Body>
                  </Stack>
                </Stack>
              </div>

              {/* Sage - Calm & Thoughtful */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <Stack gap="default">
                  <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
                    <MessageCircle className="h-7 w-7" />
                  </div>
                  <Stack gap="tight">
                    <Heading level={3} className="text-3xl font-bold">Sage</Heading>
                    <Body className="text-muted-foreground text-lg">
                      Calm and reflective, Sage encourages deep thinking through thoughtful dialogue and open-ended questions. Best for learners who value contemplative discussions and conceptual understanding.
                    </Body>
                  </Stack>
                </Stack>
                <div className="relative aspect-[4/3] rounded-2xl bg-muted border border-border overflow-hidden">
                  <Image
                    src="https://pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev/sage-androgynous-full-body.png"
                    alt="Sage assistant character"
                    fill
                    className="object-contain p-6"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </Stack>
        </Stack>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 px-4 mx-auto max-w-7xl">
            <Stack gap="loose">
              <Stack gap="tight" className="max-w-3xl mx-auto text-center">
                <Heading level={2} className="text-4xl md:text-5xl font-bold">Powerful Features for Effective Learning</Heading>
                <Body className="text-muted-foreground text-lg">
                  Sprite.exe combines proven learning techniques with AI to help you master any subject.
                </Body>
              </Stack>

              <div className="grid md:grid-cols-3 gap-6">
                <Stack gap="default" className="p-6 rounded-xl border border-border bg-card">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <Stack gap="tight">
                    <Heading level={3} className="text-xl font-semibold">Adaptive Learning</Heading>
                    <Body variant="small" className="text-muted-foreground">
                      Sessions adjust in real-time based on your responses and confidence level.
                    </Body>
                  </Stack>
                </Stack>

                <Stack gap="default" className="p-6 rounded-xl border border-border bg-card">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <Stack gap="tight">
                    <Heading level={3} className="text-xl font-semibold">Natural Conversations</Heading>
                    <Body variant="small" className="text-muted-foreground">
                      Learn through dialogue, just like talking with a study partner.
                    </Body>
                  </Stack>
                </Stack>

                <Stack gap="default" className="p-6 rounded-xl border border-border bg-card">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <Stack gap="tight">
                    <Heading level={3} className="text-xl font-semibold">Progress Tracking</Heading>
                    <Body variant="small" className="text-muted-foreground">
                      Stay motivated with clear goals and milestone tracking.
                    </Body>
                  </Stack>
                </Stack>
              </div>
        </Stack>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 px-4 mx-auto max-w-7xl">
            <div className="rounded-3xl bg-primary text-primary-foreground p-12 md:p-16">
              <Stack gap="loose" className="max-w-3xl mx-auto text-center items-center">
                <Stack gap="default">
                  <Heading level={2} className="text-4xl md:text-5xl font-bold">Ready to design your ideal study partner?</Heading>
                  <Body className="text-primary-foreground/90 text-lg">
                    Launch your assistant, set a goal for this week, and start building a learning habit you
                    can sustain.
                  </Body>
                </Stack>
                {isAuthenticated ? (
                  <Link href={hasCompletedOnboarding ? "/home" : "/onboarding"}>
                    <Button size="lg" variant="secondary" className="gap-2">
                      {hasCompletedOnboarding ? "Return to dashboard" : "Finish onboarding"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Inline gap="default" align="center" wrap={false}>
                    <Link href="/signup">
                      <Button size="lg" variant="secondary" className="gap-2">
                        Create your assistant
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/login" className="text-sm font-medium text-primary-foreground underline underline-offset-4 hover:no-underline">
                      Already using Sprite.exe?
                    </Link>
                  </Inline>
                )}
              </Stack>
            </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="py-12 px-4 mx-auto max-w-7xl">
          <Stack gap="loose">
            <Inline align="center" justify="between" className="flex-col md:flex-row gap-6">
              <Inline align="center" gap="tight">
                <Image src="/favicon.ico" alt="Sprite.exe" width={24} height={24} />
                <Heading level={4} as="span">Sprite.exe</Heading>
              </Inline>
              <Inline align="center" gap="default">
                <a
                  href="https://github.com/yingxingxin/Senior-Project"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-lg bg-muted hover:bg-accent transition-colors flex items-center justify-center"
                  aria-label="GitHub"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <a
                  href="https://discord.gg/HQQKjBK3Jk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-lg bg-muted hover:bg-accent transition-colors flex items-center justify-center"
                  aria-label="Discord"
                >
                  <MessageSquare className="h-5 w-5" />
                </a>
              </Inline>
            </Inline>
            <Body variant="small" className="text-muted-foreground text-center">
              © 2025 Sprite.exe. Your personal AI learning companion.
            </Body>
          </Stack>
        </div>
      </footer>
    </div>
  );
}
