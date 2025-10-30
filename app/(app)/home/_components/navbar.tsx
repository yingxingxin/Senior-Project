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
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(26, 26, 46, 0.8)',
      backdropFilter: 'blur(20px)',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      animation: 'fade-in-down 400ms ease-out'
    }}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo and Navigation */}
          <div className="flex items-center gap-6">
            <Link
              href="/home"
              className="flex items-center gap-2.5"
            >
                  <div 
                    style={{
                      height: '36px',
                      width: '36px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                      animation: 'logo-pulse 4s ease-in-out infinite'
                    }}>
                <Bot className="h-5 w-5 text-white" />
              </div>
              <Heading level={4} as="span" style={{color: '#ffffff', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontWeight: '600'}}>
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
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      background: isActive ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      border: isActive ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid transparent',
                      transform: isActive ? 'translateY(-1px)' : 'translateY(0)',
                      boxShadow: isActive ? '0 6px 20px rgba(102,126,234,0.25)' : 'none'
                    }}
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
              }}>
                <Flame className="h-4 w-4" style={{color: '#f59e0b'}} />
                <span style={{fontSize: '14px', fontWeight: '600', color: '#ffffff'}}>
                  {userStats.streak}
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '12px',
                background: (search?.get('xpGained') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)'),
                border: (search?.get('xpGained') ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)'),
                fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
              }}>
                <Trophy className="h-4 w-4" style={{color: '#a78bfa'}} />
                <span style={{fontSize: '14px', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', gap: 6}}>
                  Lvl {userStats.level}
                  {search?.get('xpGained') && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 6px', borderRadius: 6,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', fontSize: 12,
                      border: '1px solid rgba(255,255,255,0.15)'
                    }}>+{search.get('xpGained')} XP</span>
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
            <button 
              style={{
                position: 'relative',
                padding: '8px',
                borderRadius: '12px',
                color: '#94a3b8',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
              }}
>
              <Bell className="h-5 w-5" />
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                height: '8px',
                width: '8px',
                borderRadius: '50%',
                background: '#667eea'
              }} />
            </button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px',
                    borderRadius: '50%',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
>
                  <Avatar style={{
                    height: '36px',
                    width: '36px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%'
                  }}>
                    <AvatarImage src={userData.avatarUrl || undefined} alt={userData.name} />
                    <AvatarFallback style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      fontWeight: '600',
                      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
                    }}>
                      {userData.initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{
                width: '224px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(26, 26, 46, 0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <Heading level={6} as="div" style={{color: '#ffffff', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontWeight: '600'}}>{userData.name}</Heading>
                  <Muted variant="tiny" style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>{userData.email}</Muted>
                </div>

                {/* Mobile Stats */}
                <div style={{
                  display: 'none',
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
                }} className="lg:hidden">
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <span style={{fontSize: '14px', color: '#94a3b8'}}>Level</span>
                    <span style={{fontSize: '14px', fontWeight: '600', color: '#ffffff'}}>{userStats.level}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <span style={{fontSize: '14px', color: '#94a3b8'}}>Streak</span>
                    <span style={{fontSize: '14px', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px'}}>
                      <Flame className="h-3.5 w-3.5" style={{color: '#f59e0b'}} />
                      {userStats.streak} days
                    </span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{fontSize: '14px', color: '#94a3b8'}}>Points</span>
                    <span style={{fontSize: '14px', fontWeight: '600', color: '#ffffff'}}>{userStats.points.toLocaleString()}</span>
                  </div>
                </div>

                <div style={{padding: '4px 0'}}>
                  <DropdownMenuItem asChild style={{
                    padding: '8px 16px',
                    color: '#e8e8e8',
                    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
                  }}>
                    <Link href="/profile" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      textDecoration: 'none',
                      color: '#e8e8e8'
                    }}>
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild style={{
                    padding: '8px 16px',
                    color: '#e8e8e8',
                    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
                  }}>
                    <Link href="/achievements" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      textDecoration: 'none',
                      color: '#e8e8e8'
                    }}>
                      <Trophy className="h-4 w-4" />
                      <span>Achievements</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild style={{
                    padding: '8px 16px',
                    color: '#e8e8e8',
                    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
                  }}>
                    <Link href="/settings" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      textDecoration: 'none',
                      color: '#e8e8e8'
                    }}>
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <div style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '4px 0'
                }}>
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    style={{
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: '#ef4444',
                      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                      cursor: 'pointer'
                    }}
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