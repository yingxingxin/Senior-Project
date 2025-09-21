"use client"

import { AuthButton } from "@/components/auth/shared/AuthButton"
import { CheckCircle } from "lucide-react"

type AuthSuccessProps = {
  icon?: React.ReactNode
  title: string
  message?: string
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export function AuthSuccess({
  icon = <CheckCircle className="size-16 text-green-500" aria-hidden />,
  title,
  message,
  primaryAction,
  secondaryAction,
}: AuthSuccessProps) {
  return (
    <div className="space-y-6" aria-live="polite">
      <div className="flex flex-col items-center space-y-4">
        {icon}
        <h2 className="text-2xl font-semibold text-foreground">
          {title}
        </h2>
      </div>

      {message && (
        <p className="text-center text-sm text-muted-foreground">
          {message}
        </p>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="space-y-3">
          {primaryAction && (
            <AuthButton onClick={primaryAction.onClick} fullWidth>
              {primaryAction.label}
            </AuthButton>
          )}
          {secondaryAction && (
            <AuthButton onClick={secondaryAction.onClick} variant="secondary" fullWidth>
              {secondaryAction.label}
            </AuthButton>
          )}
        </div>
      )}
    </div>
  )
}
