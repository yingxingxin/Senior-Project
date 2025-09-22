/**
 * AuthLayout
 *
 * Creates a consistent layout for the auth pages
 */
import Image from "next/image"
import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { AUTH_COOKIE, verifyAuthToken } from "@/src/lib/auth"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is already logged in
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE)?.value

  if (token) {
    try {
      await verifyAuthToken(token)
      // User is logged in, redirect to explore
      redirect('/explore')
    } catch {
      // Token is invalid, continue to auth pages
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Theme toggle in top-right corner */}
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <div className="flex h-screen">
        {/* Left side - Artwork/Branding */}
        <div className="relative hidden flex-1 overflow-hidden bg-card lg:block">
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

        {/* Right side - Auth content */}
        <div className="flex-1 bg-background dark:bg-card/50 flex flex-col items-center justify-center px-8 lg:px-12">
          {children}
        </div>
      </div>
    </div>
  )
}
