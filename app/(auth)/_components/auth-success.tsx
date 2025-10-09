"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { Heading, Muted } from "@/components/ui/typography"
import { Stack } from "@/components/ui/spacing"

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
  icon = <CheckCircle className="size-16 text-success" aria-hidden />,
  title,
  message,
  primaryAction,
  secondaryAction,
}: AuthSuccessProps) {
  return (
    <Stack gap="default" aria-live="polite">
      <Stack gap="tight" className="flex flex-col items-center">
        {icon}
        <Heading level={2} className="text-center">
          {title}
        </Heading>
      </Stack>

      {message && (
        <Muted variant="small" className="text-center">
          {message}
        </Muted>
      )}

      {(primaryAction || secondaryAction) && (
        <Stack gap="tight">
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
        </Stack>
      )}
    </Stack>
  )
}
