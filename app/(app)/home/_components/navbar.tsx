"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
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
  Bot,
  Search,
  Users,
  Music,
  GraduationCap,
  ClipboardList,
  Swords,
  UserPlus,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { NavbarData } from "@/app/(app)/actions";
import { Heading, Muted } from "@/components/ui/typography";
import { useMusic } from "@/components/music";
import { NotificationDropdown } from "./notifications";

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

  // Check active states
  const isHomeActive = pathname === "/home";
  const isLearnActive = pathname.startsWith("/courses") || pathname.startsWith("/quizzes");
  const isCommunityActive = pathname.startsWith("/friends") || pathname.startsWith("/explore");
  const isLeaderboardActive = pathname.startsWith("/leaderboard");
  const isActivitiesActive = pathname.startsWith("/study") || pathname.startsWith("/editor");

  // Use real data from props, with fallback
  const userStats = data?.stats || {
    level: 1,
    levelLabel: null,
    streak: 0,
    points: 0,
  };

  const userData = data?.user || {
    name: "User",
    email: "user@example.com",
    avatarUrl: null,
    initials: "U",
  };

  const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a"> & {
      title: string;
      description: string;
      icon?: React.ReactNode;
    }
  >(({ className, title, description, icon, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="flex items-center gap-2 text-sm font-medium leading-none">
              {icon}
              {title}
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {description}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  });
  ListItem.displayName = "ListItem";

  return (
    <TooltipProvider>
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo and Navigation */}
            <div className="flex items-center gap-8">
              <Link
                href="/home"
                className="flex items-center gap-2.5"
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 grid place-items-center shadow-lg shadow-primary/30">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <Heading level={4} as="span" className="text-foreground font-semibold">
                  Sprite.exe
                </Heading>
              </Link>

              {/* Desktop Navigation with NavigationMenu */}
              <div className="hidden md:flex items-center">
                <NavigationMenu className="justify-start">
                  <NavigationMenuList className="gap-3 justify-start">
                    {/* Home */}
                    <NavigationMenuItem>
                      <Link
                        href="/home"
                        className={cn(
                          "group inline-flex h-10 w-max items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/50 hover:text-foreground focus:bg-accent/50 focus:text-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                          isHomeActive && "bg-accent/30 text-foreground"
                        )}
                      >
                        <Home className="h-4 w-4 mr-2" />
                        Home
                      </Link>
                    </NavigationMenuItem>

                    {/* Learn Dropdown */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className={cn(
                        "rounded-lg bg-transparent hover:bg-accent/50 data-[active]:bg-accent/30 data-[state=open]:bg-accent/30",
                        isLearnActive && "bg-accent/30"
                      )}>
                        Learn
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          <ListItem
                            title="Courses"
                            description="Browse structured learning paths and modules."
                            href="/courses"
                            icon={<BookOpen className="h-4 w-4" />}
                          />
                          <ListItem
                            title="Quiz"
                            description="Check your understanding with quick quizzes."
                            href="/quizzes"
                            icon={<Bot className="h-4 w-4" />}
                          />
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* Community Dropdown */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className={cn(
                        "rounded-lg bg-transparent hover:bg-accent/50 data-[active]:bg-accent/30 data-[state=open]:bg-accent/30",
                        isCommunityActive && "bg-accent/30"
                      )}>
                        Community
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-1 lg:w-[400px]">
                          <ListItem
                            title="Search Friends"
                            description="Find learners by name or handle."
                            href="/explore"
                            icon={<Search className="h-4 w-4" />}
                          />
                          <ListItem
                            title="My Friends"
                            description="View your friends list and profiles."
                            href="/friends"
                            icon={<Users className="h-4 w-4" />}
                          />
                          <ListItem
                            title="Friend Requests"
                            description="Accept or decline incoming friend requests."
                            href="/friends"
                            icon={<UserCheck className="h-4 w-4" />}
                          />
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* Leaderboard */}
                    <NavigationMenuItem>
                      <Link
                        href="/leaderboard"
                        className={cn(
                          "group inline-flex h-10 w-max items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/50 hover:text-foreground focus:bg-accent/50 focus:text-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                          isLeaderboardActive && "bg-accent/30 text-foreground"
                        )}
                      >
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Leaderboard
                      </Link>
                    </NavigationMenuItem>

                    {/* Activities Dropdown */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className={cn(
                        "rounded-lg bg-transparent hover:bg-accent/50 data-[active]:bg-accent/30 data-[state=open]:bg-accent/30",
                        isActivitiesActive && "bg-accent/30"
                      )}>
                        Activities
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[400px]">
                          <ListItem
                            title="Practice"
                            description="Hands-on coding exercises and drills."
                            href="/editor"
                            icon={<Swords className="h-4 w-4" />}
                          />
                          <ListItem
                            title="Study Mode"
                            description="Enhance your study sessions."
                            href="/study"
                            icon={<GraduationCap className="h-4 w-4" />}
                          />
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>

              {/* Mobile Navigation */}
              <div className="md:hidden flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                      aria-label="Navigation menu"
                    >
                      <Search className="h-4 w-4" />
                      <span>Menu</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 rounded-lg border border-border/50 bg-card/95 backdrop-blur-xl shadow-lg">
                    {/* Home */}
                    <DropdownMenuItem asChild>
                      <Link
                        href="/home"
                        className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer ${
                          isHomeActive
                            ? 'bg-primary/10 text-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                      >
                        <Home className="h-4 w-4" />
                        <span>Home</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Learn section */}
                    <div className="px-3 py-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Learn</span>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/courses"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>Courses</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/quizzes"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <Bot className="h-4 w-4" />
                        <span>Quiz</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Community section */}
                    <div className="px-3 py-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Community</span>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/explore"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <Search className="h-4 w-4" />
                        <span>Search Friends</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/friends"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <Users className="h-4 w-4" />
                        <span>My Friends</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/friends"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Friend Requests</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Leaderboard */}
                    <DropdownMenuItem asChild>
                      <Link
                        href="/leaderboard"
                        className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer ${
                          isLeaderboardActive
                            ? 'bg-primary/10 text-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                      >
                        <ClipboardList className="h-4 w-4" />
                        <span>Leaderboard</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Activities section */}
                    <div className="px-3 py-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Activities</span>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/editor"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <Swords className="h-4 w-4" />
                        <span>Practice</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/study"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <GraduationCap className="h-4 w-4" />
                        <span>Study Mode</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Center: Spacer */}
            <div className="flex-1" />

            {/* Right: Icons and Profile */}
            <div className="flex items-center gap-2">
              {/* Notifications Dropdown */}
              <NotificationDropdown />

              {/* Profile Dropdown */}
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
                <DropdownMenuContent align="end" className="w-64 rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-border/50">
                    <Heading level={6} as="div" className="text-foreground font-semibold">{userData.name}</Heading>
                    <Muted variant="tiny" className="text-muted-foreground">{userData.email}</Muted>
                  </div>

                  {/* Gamification Stats */}
                  <div className="px-4 py-3 border-b border-border/50 space-y-2.5">
                    {userStats.levelLabel && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Level</span>
                        <span className="text-sm font-semibold text-foreground">{userStats.levelLabel}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Level</span>
                      <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-purple-400" />
                        {userStats.level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Streak</span>
                      <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Flame className="h-3.5 w-3.5 text-amber-500" />
                        {userStats.streak} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total XP</span>
                      <span className="text-sm font-semibold text-foreground">{userStats.points.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <DropdownMenuItem asChild>
                      <Link href="/settings/profile" className="flex items-center gap-2.5 px-4 py-2 text-foreground hover:bg-accent cursor-pointer">
                        <User className="h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/friends" className="flex items-center gap-2.5 px-4 py-2 text-foreground hover:bg-accent cursor-pointer">
                        <Users className="h-4 w-4" />
                        <span>Friends</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings/assistant" className="flex items-center gap-2.5 px-4 py-2 text-foreground hover:bg-accent cursor-pointer">
                        <Bot className="h-4 w-4" />
                        <span>Assistant Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={togglePlayerVisibility}
                      className="flex items-center gap-2.5 px-4 py-2 text-foreground hover:bg-accent cursor-pointer"
                    >
                      <Music className="h-4 w-4" />
                      <span>Music Settings</span>
                      {state.isPlaying && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2.5 px-4 py-2 text-foreground hover:bg-accent cursor-pointer">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator />

                  <div className="py-1">
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 px-4 py-2 text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
}
