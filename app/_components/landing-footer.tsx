import Link from 'next/link'
import Image from 'next/image'
import { MessageSquare } from 'lucide-react'
import { Stack, Inline } from '@/components/ui/spacing'
import { Heading, Body } from '@/components/ui/typography'

/**
 * Landing page footer
 *
 * Contains logo, social links, and copyright.
 * GitHub icon is inline SVG for consistency with original design.
 */
export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="py-12 px-4 mx-auto max-w-7xl">
        <Stack gap="loose">
          <Inline
            align="center"
            justify="between"
            className="flex-col md:flex-row gap-6"
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image src="/favicon.ico" alt="Sprite.exe" width={24} height={24} />
              <Heading level={4} as="span">Sprite.exe</Heading>
            </Link>

            {/* Social links */}
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
            © {new Date().getFullYear()} Sprite.exe. Your personal AI learning companion.
          </Body>
        </Stack>
      </div>
    </footer>
  )
}
