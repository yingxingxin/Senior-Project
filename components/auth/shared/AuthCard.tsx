import Link, { type LinkProps } from "next/link"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Heading, Muted } from "@/components/ui/typography"

type AuthCardFooterConfig = {
  text?: React.ReactNode
  linkText: React.ReactNode
  linkHref: LinkProps["href"]
}

type CardWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full"

type AuthCardProps = React.ComponentPropsWithoutRef<"div"> & {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  footer?: AuthCardFooterConfig
  width?: CardWidth
}

const AuthCardHeader = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-4 sm:space-y-3", className)} {...props}>
    {children}
  </div>
)

const AuthCardTitle = ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <Heading level={1} className={className} {...props}>
    {children}
  </Heading>
)

const AuthCardDescription = ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <Muted variant="small" as="p" className={className} {...props}>
    {children}
  </Muted>
)

const AuthCardBody = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-6", className)} {...props}>
    {children}
  </div>
)

const AuthCardFooter = ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <Muted variant="small" as="p" className={cn("text-center text-foreground", className)} {...props}>
    {children}
  </Muted>
)

const AuthCardFooterLink = ({ className, ...props }: LinkProps & { className?: string; children: React.ReactNode }) => (
  <Link className={cn("font-medium underline hover:no-underline", className)} {...props} />
)

const AuthCardRoot = React.forwardRef<HTMLDivElement, AuthCardProps>(
  ({ title, subtitle, footer, width = "md", children, className, ...props }, ref) => {
    const hasHeaderContent = title || subtitle

    const widthClasses: Record<CardWidth, string> = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      full: "max-w-full",
    }

    return (
      <div ref={ref} className={cn(
        "w-full space-y-8",
        widthClasses[width],
        className
      )} {...props}>
        {hasHeaderContent ? (
          <AuthCardHeader>
            {title
              ? React.isValidElement(title)
                ? title
                : <AuthCardTitle>{title}</AuthCardTitle>
              : null}
            {subtitle
              ? React.isValidElement(subtitle)
                ? subtitle
                : <AuthCardDescription>{subtitle}</AuthCardDescription>
              : null}
          </AuthCardHeader>
        ) : null}

        {children}

        {footer ? (
          <AuthCardFooter>
            {footer.text ? <span>{footer.text} </span> : null}
            <AuthCardFooterLink href={footer.linkHref}>{footer.linkText}</AuthCardFooterLink>
          </AuthCardFooter>
        ) : null}
      </div>
    )
  }
)
AuthCardRoot.displayName = "AuthCard"

const AuthCard = Object.assign(AuthCardRoot, {
  Header: AuthCardHeader,
  Title: AuthCardTitle,
  Description: AuthCardDescription,
  Body: AuthCardBody,
  Footer: AuthCardFooter,
  FooterLink: AuthCardFooterLink,
})

export { AuthCard }
