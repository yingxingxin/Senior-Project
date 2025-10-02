import { ForgotPasswordForm } from "./forgot-password-form"
import { Stack } from "@/components/ui/spacing"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password - Sprite.exe",
  description: "Reset your Sprite.exe account password",
}

export default function ForgotPasswordPage() {
  return (
    <Stack gap="loose">
      <ForgotPasswordForm />
    </Stack>
  )
}
