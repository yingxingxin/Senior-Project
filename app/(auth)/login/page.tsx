import { LoginForm } from "../_components/login-form"
import { Heading, Muted } from "@/components/ui/typography"
import { Stack } from "@/components/ui/spacing"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - Sprite.exe",
  description: "Sign in to your Sprite.exe account",
}

export default function LoginPage() {
  return (
    <Stack gap="loose">
      <Stack gap="tight">
        <Heading level={1}>Welcome back</Heading>
        <Muted variant="small" as="p">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-foreground underline hover:no-underline">
            Sign up
          </Link>
        </Muted>
      </Stack>
      <LoginForm />
    </Stack>
  )
}
