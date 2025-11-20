"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
  Music,
} from "lucide-react";

import { NavbarData } from "@/app/(app)/actions";
import { Heading, Muted } from "@/components/ui/typography";
import { useMusic } from "@/components/music";

interface NavbarProps {
  data: NavbarData | null;
}

export default function Navbar({ data }: NavbarProps) {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const { state, togglePlayerVisibility } = useMusic();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const navItems = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/quiz", label: "Quiz", icon: Sparkles },
    { href: "/editor", label: "Practice", icon: Swords },
    { href: "/ask", label: "Ask AI", icon: MessageSquare },
  ];

  // Use real data from props, with fallbacksnpm
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
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl animate-[fade-in-down_400ms_ease-out]">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo and Navigation */}
          <div className="flex items-center gap-6">
            <Link
              href="/home"
              className="flex items-center gap-2.5"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 grid place-items-center shadow-lg shadow-primary/30 animate-[logo-pulse_4s_ease-in-out_infinite]">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <Heading level={4} as="span" className="text-foreground font-semibold">
                Sprite.exe
              </Heading>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary/20 text-foreground border border-primary/30 -translate-y-px shadow-lg shadow-primary/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent'
                    }`}
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
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <Flame className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-semibold text-foreground">
                  {userStats.streak}
                </span>
              </div>

              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                search?.get('xpGained')
                  ? 'bg-emerald-500/15 border-emerald-500/40'
                  : 'bg-muted/50 border-border'
              }`}>
                <Trophy className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  Lvl {userStats.level}
                  {search?.get('xpGained') && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs border border-white/15">
                      +{search.get('xpGained')} XP
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Music Control */}
            <button 
              onClick={togglePlayerVisibility}
              className={`relative p-2 rounded-xl transition-all ${
                state.showPlayer 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Music className="h-5 w-5" />
              {state.isPlaying && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative flex items-center gap-2 p-1 rounded-full hover:opacity-80 transition-all">
                  <Avatar className="h-9 w-9 border-2 border-border/20">
                    <AvatarImage src={userData.avatarUrl || undefined} alt={userData.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                      {userData.initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
                <div className="px-4 py-3 border-b border-border/50">
                  <Heading level={6} as="div" className="text-foreground font-semibold">{userData.name}</Heading>
                  <Muted variant="tiny" className="text-muted-foreground">{userData.email}</Muted>
                </div>

                {/* Mobile Stats */}
                <div className="lg:hidden px-4 py-3 border-b border-border/50 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Level</span>
                    <span className="text-sm font-semibold text-foreground">{userStats.level}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Streak</span>
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                      {userStats.streak} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Points</span>
                    <span className="text-sm font-semibold text-foreground">{userStats.points.toLocaleString()}</span>
                  </div>
                </div>

                <div className="py-1">
                  <DropdownMenuItem asChild>
                    <Link href="/settings/profile" className="flex items-center gap-2.5 px-4 py-2 text-foreground hover:bg-accent cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/achievements" className="flex items-center gap-2.5 px-4 py-2 text-foreground hover:bg-accent cursor-pointer">
                      <Trophy className="h-4 w-4" />
                      <span>Achievements</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2.5 px-4 py-2 text-foreground hover:bg-accent cursor-pointer">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <div className="border-t border-border/50 py-1">
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 px-4 py-2 text-destructive hover:bg-destructive/10 cursor-pointer"
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