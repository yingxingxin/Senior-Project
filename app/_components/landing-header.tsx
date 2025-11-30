'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Inline } from '@/components/ui/spacing'
import { Heading } from '@/components/ui/typography'

interface LandingHeaderProps {
  isAuthenticated: boolean
}

/**
 * Landing page header with navigation
 *
 * Shows different CTAs based on auth state:
 * - Unauthenticated: Sign In + Get Started
 * - Authenticated: Go to Dashboard
 */
export function LandingHeader({ isAuthenticated }: LandingHeaderProps) {
  return (
    <header className="py-4 md:py-6 px-4 mx-auto max-w-7xl">
      <Inline align="center" justify="between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/favicon.ico" alt="Sprite.exe" width={24} height={24} />
          <Heading level={4} as="span">Sprite.exe</Heading>
        </Link>

        {/* Navigation - hidden on mobile for cleaner look */}
        <nav className="hidden md:block">
          <Inline align="center" gap="default">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="https://github.com/yingxingxin/Senior-Project"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </Inline>
        </nav>

        {/* Auth CTAs */}
        {isAuthenticated ? (
          <Link href="/home">
            <Button>Dashboard</Button>
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
  )
}
