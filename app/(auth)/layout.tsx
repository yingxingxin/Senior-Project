/**
 * AuthLayout
 *
 * Creates a consistent layout for the auth pages
 */
import Image from "next/image"
import type React from "react"
import { redirect } from "next/navigation"
import { auth } from "@/src/lib/auth"
import { headers } from "next/headers"
import { db, users } from "@/src/db"
import { eq } from "drizzle-orm"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is already logged in (skip in development for easier testing)
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (process.env.NODE_ENV !== 'development' && session && session.user) {
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
      <div className="flex min-h-screen">
        {/* Left side - Artwork/Branding - Hidden on mobile, visible on md and up */}
        <div className="relative hidden flex-1 md:block md:p-4 lg:p-6">
          <div className="relative h-full w-full overflow-hidden rounded-3xl">
            <Image
              src="/anime3.png"
              alt="Sprite.exe hero artwork"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>

        {/* Right side - Auth content - Full width on mobile */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 md:px-8 md:py-12 lg:px-16 lg:py-16">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
