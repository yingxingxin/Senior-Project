import Link from "next/link";
import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-2xl font-bold">{value.toLocaleString("en-US")}</div>
          <Badge
            variant={up ? "default" : "destructive"}
            className="rounded-full px-2 py-0 text-[10px] uppercase tracking-wide"
          >
            {deltaLabel}
          </Badge>
        </div>
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
