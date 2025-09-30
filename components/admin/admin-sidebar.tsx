"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Brain,
  MessageSquare,
  Palette,
  Music,
  Trophy,
  BarChart3,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const ADMIN_NAV: NavItem[] = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Content",
    href: "/admin/content",
    icon: BookOpen,
    children: [
      { title: "Lessons", href: "/admin/content/lessons", icon: BookOpen },
      { title: "Quizzes", href: "/admin/content/quizzes", icon: Brain },
      { title: "Assistants", href: "/admin/content/assistants", icon: MessageSquare },
      { title: "Dialogues", href: "/admin/content/dialogues", icon: MessageSquare },
      { title: "Themes", href: "/admin/content/themes", icon: Palette },
      { title: "Music", href: "/admin/content/music", icon: Music },
      { title: "Achievements", href: "/admin/content/achievements", icon: Trophy },
    ],
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "System",
    href: "/admin/system",
    icon: Settings,
  },
];

const DEFAULT_EXPANDED_TITLES = ["Content"] as const;
const DEPTH_PADDING = ["", "pl-6", "pl-9", "pl-12"];

interface AdminSidebarProps {
  userEmail: string;
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(DEFAULT_EXPANDED_TITLES)
  );
  const navId = useId();

  const getDepthPadding = useCallback(
    (depth: number) => DEPTH_PADDING[Math.min(depth, DEPTH_PADDING.length - 1)],
    []
  );

  const isActive = useCallback(
    (href: string) => {
      if (!pathname) return false;
      if (href === "/admin") {
        return pathname === href;
      }
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname]
  );

  const ensureActiveParentExpanded = useCallback(
    (currentPath: string | null) => {
      if (!currentPath) return;
      for (const item of ADMIN_NAV) {
        if (!item.children?.length) continue;
        const shouldExpand = item.children.some((child) => isActive(child.href));
        if (shouldExpand) {
          setExpandedSections((prev) => {
            if (prev.has(item.title)) return prev;
            const next = new Set(prev);
            next.add(item.title);
            return next;
          });
        }
      }
    },
    [isActive]
  );

  useEffect(() => {
    ensureActiveParentExpanded(pathname);
  }, [ensureActiveParentExpanded, pathname]);

  const toggleSection = useCallback((title: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  }, []);

  const renderNavItem = useCallback(
    (item: NavItem, depth = 0): ReactNode => {
      const hasChildren = !!item.children?.length;
      const Icon = item.icon;
      const depthPadding = collapsed ? "" : getDepthPadding(depth);

      if (hasChildren) {
        const expanded = expandedSections.has(item.title);
        const groupId = `${navId}-${item.title.replace(/\s+/g, "-").toLowerCase()}`;
        const active = item.children.some((child) => isActive(child.href));

        return (
          <li key={item.title}>
            <button
              type="button"
              aria-controls={groupId}
              aria-expanded={!collapsed && expanded}
              onClick={() => toggleSection(item.title)}
              className={cn(
                "group flex h-10 w-full select-none items-center justify-between rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                depthPadding,
                active
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "pr-2"
              )}
            >
              <span
                className={cn(
                  "flex min-w-0 items-center gap-3 transition-opacity",
                  collapsed && "gap-2"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span
                  className={cn(
                    "truncate text-left transition-[opacity,transform] duration-200",
                    collapsed
                      ? "pointer-events-none opacity-0 -translate-x-2"
                      : "opacity-100 translate-x-0"
                  )}
                >
                  {item.title}
                </span>
              </span>
              {!collapsed && (
                <ChevronDown
                  className={cn(
                    "h-3 w-3 shrink-0 transition-transform duration-200",
                    expanded ? "rotate-180" : "rotate-0"
                  )}
                  aria-hidden="true"
                />
              )}
            </button>
            {!collapsed && expanded && (
              <ul
                id={groupId}
                role="group"
                className="mt-1 space-y-1 border-l border-border/40 pl-4"
              >
                {item.children.map((child) => renderNavItem(child, depth + 1))}
              </ul>
            )}
          </li>
        );
      }

      const active = isActive(item.href);

      return (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-label={collapsed ? item.title : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              depthPadding,
              collapsed ? "gap-0" : "gap-3",
              active
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span
              className={cn(
                "flex-1 truncate text-left transition-[opacity,transform] duration-200",
                collapsed
                  ? "pointer-events-none opacity-0 -translate-x-2"
                  : "opacity-100 translate-x-0"
              )}
            >
              {item.title}
            </span>
          </Link>
        </li>
      );
    },
    [collapsed, expandedSections, getDepthPadding, isActive, navId, toggleSection]
  );

  return (
    <aside
      aria-label="Admin navigation"
      className={cn(
        "relative flex h-full flex-col border-r bg-background transition-[width] duration-300 ease-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <header
        className={cn(
          "flex h-16 items-center border-b transition-all",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        <h2
          className={cn(
            "overflow-hidden text-lg font-semibold tracking-tight transition-[opacity,transform,width] duration-200 select-none whitespace-nowrap",
            collapsed
              ? "pointer-events-none opacity-0 -translate-x-1 w-0"
              : "opacity-100 translate-x-0 w-auto"
          )}
        >
          Admin
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-expanded={!collapsed}
          aria-controls={navId}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="h-8 w-8 shrink-0 select-none"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </Button>
      </header>

      <ScrollArea className="flex-1 px-3 py-4" type="auto">
        <nav id={navId} className="space-y-1" data-collapsed={collapsed}>
          <ul className="space-y-1">
            {ADMIN_NAV.map((item) => renderNavItem(item))}
          </ul>
        </nav>
      </ScrollArea>

      <footer className="border-t px-4 py-4">
        <div
          className={cn(
            "overflow-hidden text-xs text-muted-foreground transition-[height,opacity] duration-200",
            collapsed ? "h-0 opacity-0" : "h-4 opacity-100"
          )}
        >
          <span className="block truncate">{userEmail}</span>
        </div>
        <Link
          href="/home"
          title="Exit Admin"
          className={cn(
            "mt-3 flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
            collapsed && "gap-1 px-2"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span
            className={cn(
              "truncate transition-[opacity,transform] duration-200",
              collapsed
                ? "pointer-events-none opacity-0 -translate-x-2"
                : "opacity-100 translate-x-0"
            )}
          >
            Exit Admin
          </span>
        </Link>
      </footer>
    </aside>
  );
}
