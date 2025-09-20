import { PasswordResetForm } from "@/components/auth/PasswordResetForm"
import type { Metadata } from "next"

type ResetPasswordPageProps = {
  params: Promise<{
    token: string
  }>
}

export const metadata: Metadata = {
  title: "Reset Password - Sprite.exe",
  description: "Reset your password",
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  // hide warning "await' has no effect on the type of this expression"
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { token } = await params;

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--auth-background)]">
      <div className="w-full max-w-md space-y-6 p-8 bg-[var(--auth-card)] rounded-lg shadow-lg">
        <PasswordResetForm token={token} />
      </div>
    </div>
  )
}
