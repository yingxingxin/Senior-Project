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
  const router = useRouter();
  const { state, togglePlayerVisibility } = useMusic();

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
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
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
              <Heading level={4} as="span" className="text-primary">
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
                    className={`
                      flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium
                      transition-all duration-200
                      ${isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
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
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warning/10 border border-warning/30">
                <Flame className="h-4 w-4 text-warning" />
                <span className="text-sm font-bold text-primary">
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
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
            </button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative flex items-center gap-2 p-1 rounded-full hover:bg-accent transition-all">
                  <Avatar className="h-9 w-9 ring-2 ring-border">
                    <AvatarImage src={userData.avatarUrl || undefined} alt={userData.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {userData.initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-border">
                <div className="px-3 py-2 border-b border-border">
                  <Heading level={6} as="div">{userData.name}</Heading>
                  <Muted variant="tiny">{userData.email}</Muted>
                </div>

                {/* Mobile Stats */}
                <div className="lg:hidden px-3 py-3 space-y-2.5 border-b border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Level</span>
                    <span className="text-sm font-bold">{userStats.level}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Streak</span>
                    <span className="text-sm font-bold flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-warning" />
                      {userStats.streak} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Points</span>
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

                <div className="border-t border-border py-1">
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="px-3 py-2 flex items-center gap-2.5 text-destructive focus:text-destructive"
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