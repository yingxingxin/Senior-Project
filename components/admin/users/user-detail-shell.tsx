import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";

interface UserDetailShellProps {
  heading: ReactNode;
  subheading?: ReactNode;
  metadata?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function UserDetailShell({
  heading,
  subheading,
  metadata,
  sidebar,
  children,
  className,
}: UserDetailShellProps) {
  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <header className="space-y-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            {heading}
            {subheading ? <div className="text-sm text-muted-foreground">{subheading}</div> : null}
          </div>
          {metadata ? <div className="flex shrink-0 items-center gap-3">{metadata}</div> : null}
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          {children}
        </div>
        {sidebar ? <aside className="flex flex-col gap-4">{sidebar}</aside> : null}
      </div>
    </div>
  );
}
