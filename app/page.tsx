// Root page for the app (/)
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, BookOpen, Brain } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { db, users } from "@/src/db";
import { eq } from "drizzle-orm";

async function getAuthState() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { isAuthenticated: false, user: null, hasCompletedOnboarding: false };
  }

  try {
    // Get user details including onboarding status
    const [user] = await db
      .select({
        userId: users.id,
        username: users.name,
        email: users.email,
        onboardingCompletedAt: users.onboarding_completed_at,
      })
      .from(users)
      .where(eq(users.id, Number(session.user.id)))
      .limit(1);

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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Simple Header */}
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-lg sm:text-xl font-bold">Sprite.exe</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/home" className="hidden sm:block">
                <Button>Go to Dashboard</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup" className="hidden md:block">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
          <ModeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Learn with Your Personal AI Assistant
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Sprite.exe pairs you with a customizable AI companion to make learning engaging,
            personalized, and fun. Choose your assistant&apos;s personality and start your journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 w-full max-w-sm sm:max-w-none mx-auto">
            {isAuthenticated ? (
              <>
                <Link href="/home" className="w-full sm:w-auto">
                  <Button size="lg" className="gap-2 w-full sm:w-auto sm:min-w-[180px]">
                    Continue to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {!hasCompletedOnboarding && (
                  <Link href="/onboarding" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto sm:min-w-[180px]">
                      Setup Assistant
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="gap-2 w-full sm:w-auto sm:min-w-[180px]">
                    Start Learning Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-16 sm:mt-20 max-w-5xl mx-auto">
          <div className="rounded-lg border bg-card p-6 space-y-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Personalized Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Choose your assistant&apos;s appearance and personality to match your learning style.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 space-y-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Interactive Lessons</h3>
            <p className="text-sm text-muted-foreground">
              Engage with dynamic content, quizzes, and real-time feedback from your assistant.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 space-y-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Track Progress</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your learning journey with detailed analytics and achievement tracking.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
