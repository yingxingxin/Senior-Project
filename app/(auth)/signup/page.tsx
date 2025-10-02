import SignupForm from "@/components/auth/SignupForm"
import { Heading, Muted } from "@/components/ui/typography"
import { Stack } from "@/components/ui/spacing"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up - Sprite.exe",
  description: "Create your Sprite.exe account",
}

export default function SignupPage() {
  return (
    <Stack gap="loose">
      <Stack gap="tight">
        <Heading level={1}>Create an account</Heading>
        <Muted variant="small" as="p">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline hover:no-underline">
            Log in
          </Link>
        </Muted>
      </Stack>
      <SignupForm />
    </Stack>
  )
}
