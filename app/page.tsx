// Root page for the app (/)
import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, BookOpen, Brain } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { AUTH_COOKIE, verifyAuthToken } from "@/src/lib/auth";
import { db, users } from "@/src/db";
import { eq } from "drizzle-orm";

async function getAuthState() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return { isAuthenticated: false, user: null, hasCompletedOnboarding: false };
  }

  try {
    const session = await verifyAuthToken(token);

    // Get user details including onboarding status
    const [user] = await db
      .select({
        userId: users.userId,
        username: users.username,
        email: users.email,
        onboardingCompletedAt: users.onboardingCompletedAt,
      })
      .from(users)
      .where(eq(users.userId, session.userId))
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
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Sprite.exe</span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/explore">
                <Button>Go to Dashboard</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
          <ModeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Learn with Your Personal AI Assistant
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sprite.exe pairs you with a customizable AI companion to make learning engaging,
            personalized, and fun. Choose your assistant&apos;s personality and start your journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            {isAuthenticated ? (
              <>
                <Link href="/explore">
                  <Button size="lg" className="gap-2">
                    Continue to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {!hasCompletedOnboarding && (
                  <Link href="/onboarding">
                    <Button size="lg" variant="outline">
                      Setup Assistant
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" className="gap-2">
                    Start Learning Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    I have an account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
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
