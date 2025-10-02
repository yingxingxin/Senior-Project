import Link, { type LinkProps } from "next/link"
import * as React from "react"

import { cn } from "@/lib/utils"

type AuthCardFooterConfig = {
  text?: React.ReactNode
  linkText: React.ReactNode
  linkHref: LinkProps["href"]
}

type AuthCardProps = React.ComponentPropsWithoutRef<"div"> & {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  footer?: AuthCardFooterConfig
}

const AuthCardHeader = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-4 sm:space-y-3", className)} {...props}>
    {children}
  </div>
)

const AuthCardTitle = ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1 className={cn("text-4xl font-semibold tracking-tight", className)} {...props}>
    {children}
  </h1>
)

const AuthCardDescription = ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-base sm:text-sm text-muted-foreground", className)} {...props}>
    {children}
  </p>
)

const AuthCardBody = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-6", className)} {...props}>
    {children}
  </div>
)

const AuthCardFooter = ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-center text-sm text-foreground", className)} {...props}>
    {children}
  </p>
)

const AuthCardFooterLink = ({ className, ...props }: LinkProps & { className?: string; children: React.ReactNode }) => (
  <Link className={cn("font-medium underline hover:no-underline", className)} {...props} />
)

const AuthCardRoot = React.forwardRef<HTMLDivElement, AuthCardProps>(
  ({ title, subtitle, footer, children, className, ...props }, ref) => {
    const hasHeaderContent = title || subtitle

    return (
      <div ref={ref} className={cn(
        "w-full max-w-md space-y-8",
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
