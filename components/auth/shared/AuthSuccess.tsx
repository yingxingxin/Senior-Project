"use client"

import { Button } from "@/components/ui/button"
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
        <h2 className="text-3xl sm:text-2xl font-semibold text-foreground">
          {title}
        </h2>
      </div>

      {message && (
        <p className="text-center text-base sm:text-sm text-muted-foreground">
          {message}
        </p>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="space-y-3">
          {primaryAction && (
            <Button onClick={primaryAction.onClick} className="w-full">
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="secondary" className="w-full">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
