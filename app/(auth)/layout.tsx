/**
 * AuthLayout
 *
 * Creates a consistent layout for the auth pages
 */
import Image from "next/image"
import type React from "react"
import { ModeToggle } from "@/components/ui/mode-toggle"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
