import type { ReactNode } from "react";

import { Stack } from "@/components/ui/spacing";
import { Muted } from "@/components/ui/typography";

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
    <Stack gap="loose" className={className}>
      <Stack gap="default" as="header">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <Stack gap="tight">
            {heading}
            {subheading ? <Muted variant="small" as="div">{subheading}</Muted> : null}
          </Stack>
          {metadata ? <div className="flex shrink-0 items-center gap-3">{metadata}</div> : null}
        </div>
      </Stack>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Stack gap="default">
          {children}
        </Stack>
        {sidebar ? <Stack gap="default" as="aside">{sidebar}</Stack> : null}
      </div>
    </Stack>
  );
}
