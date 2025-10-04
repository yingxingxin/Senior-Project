import Link from "next/link";
import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inline } from "@/components/ui/spacing";

type StatCardProps = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  value: number;
  delta: number;
  href?: string;
};

export function StatCard({ title, icon: Icon, value, delta, href }: StatCardProps) {
  const up = delta >= 0;
  const deltaLabel = `${up ? "+" : ""}${delta}%`;

  const content = (
    <Card className="h-full transition-colors hover:border-primary">
      <CardHeader className="pb-2">
        <Inline gap="default" align="center" justify="between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </Inline>
      </CardHeader>
      <CardContent>
        <Inline gap="tight" align="baseline" justify="between">
          <div className="text-2xl font-bold">{value.toLocaleString("en-US")}</div>
          <Badge
            variant={up ? "default" : "destructive"}
            className="rounded-full px-2 py-0 text-[10px] uppercase tracking-wide"
          >
            {deltaLabel}
          </Badge>
        </Inline>
      </CardContent>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {content}
    </Link>
  );
}
