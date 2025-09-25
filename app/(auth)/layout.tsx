/**
 * AuthLayout
 *
 * Creates a consistent layout for the auth pages
 */
import Image from "next/image"
import type React from "react"
import { redirect } from "next/navigation"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { auth } from "@/src/lib/auth"
import { headers } from "next/headers"
import { db, users } from "@/src/db"
import { eq } from "drizzle-orm"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is already logged in
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session && session.user) {
    // User is logged in, check onboarding status
    const userId = Number(session.user.id);
    const [userData] = await db
      .select({
        onboarding_completed_at: users.onboarding_completed_at,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // If user hasn't completed onboarding, redirect to onboarding
    if (!userData?.onboarding_completed_at) {
      redirect('/onboarding')
    }

    // User has completed onboarding, redirect to home
    redirect('/home')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Theme toggle in top-right corner */}
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <div className="flex min-h-screen">
        {/* Left side - Artwork/Branding - Hidden on mobile, visible on md and up */}
        <div className="relative hidden flex-1 overflow-hidden bg-card md:block">
          <div
            className="absolute inset-0"
            style={{ clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)" }}
          >
            <Image
              src="/anime.png"
              alt="Sprite.exe hero artwork"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/60 to-purple-700/40 dark:from-blue-600/40 dark:to-purple-700/30" />
          </div>
        </div>

        {/* Right side - Auth content - Full width on mobile */}
        <div className="flex-1 bg-background dark:bg-card/50 flex flex-col items-center justify-center px-4 py-8 sm:px-6 md:px-8 lg:px-12">
          {children}
        </div>
      </div>
    </div>
  )
}
