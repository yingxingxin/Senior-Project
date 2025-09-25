"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";
import {
  Home,
  BookOpen,
  Trophy,
  Flame,
  Settings,
  User,
  LogOut,
  Bell,
  Bot,
  Sparkles,
  MessageSquare,
  Swords,
} from "lucide-react";

import { NavbarData } from "@/app/(app)/actions";

interface NavbarProps {
  data: NavbarData | null;
}

export default function Navbar({ data }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const navItems = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/study", label: "Study", icon: BookOpen },
    { href: "/quiz", label: "Quiz", icon: Sparkles },
    { href: "/practice", label: "Practice", icon: Swords },
    { href: "/ask", label: "Ask AI", icon: MessageSquare },
  ];

  // Use real data from props, with fallbacks
  const userStats = data?.stats || {
    level: 1,
    streak: 0,
    points: 0,
  };

  const userData = data?.user || {
    name: "User",
    email: "user@example.com",
    avatarUrl: null,
    initials: "U",
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo and Navigation */}
          <div className="flex items-center gap-6">
            <Link
              href="/home"
              className="flex items-center gap-2.5"
            >
              <div className="h-9 w-9 rounded-xl bg-primary grid place-items-center shadow-sm">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">
                LearnQuest
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium
                      transition-all duration-200
                      ${isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Stats and User Menu */}
          <div className="flex items-center gap-3">
            {/* Quick Stats - Simplified */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  {userStats.streak}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent border border-border">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-accent-foreground">
                  Lvl {userStats.level}
                </span>
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
            </button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative flex items-center gap-2 p-1 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                  <Avatar className="h-9 w-9 ring-2 ring-zinc-200 dark:ring-zinc-800">
                    <AvatarImage src={userData.avatarUrl || undefined} alt={userData.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {userData.initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-zinc-200 dark:border-zinc-800">
                <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800">
                  <p className="text-sm font-semibold">{userData.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{userData.email}</p>
                </div>

                {/* Mobile Stats */}
                <div className="lg:hidden px-3 py-3 space-y-2.5 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Level</span>
                    <span className="text-sm font-bold">{userStats.level}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Streak</span>
                    <span className="text-sm font-bold flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-orange-500" />
                      {userStats.streak} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Points</span>
                    <span className="text-sm font-bold">{userStats.points.toLocaleString()}</span>
                  </div>
                </div>

                <div className="py-1">
                  <DropdownMenuItem asChild className="px-3 py-2">
                    <Link href="/profile" className="flex items-center gap-2.5">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="px-3 py-2">
                    <Link href="/achievements" className="flex items-center gap-2.5">
                      <Trophy className="h-4 w-4" />
                      <span>Achievements</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="px-3 py-2">
                    <Link href="/settings" className="flex items-center gap-2.5">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <div className="border-t border-zinc-200 dark:border-zinc-800 py-1">
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="px-3 py-2 flex items-center gap-2.5 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}