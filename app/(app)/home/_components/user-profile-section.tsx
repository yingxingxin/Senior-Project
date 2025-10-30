import { Trophy, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Heading, Muted } from "@/components/ui/typography";
import { Inline } from "@/components/ui/spacing";

interface UserProfileSectionProps {
  userName: string;
  email?: string;
  skillLevel?: string | null;
  level: number;
  points: number;
  streakDays: number;
  earnedBadgesCount: number;
  assistantName?: string;
  levelProgress: {
    level: number;
    percent: number;
    pointsToNext: number;
  };
}

export function UserProfileSection({
  userName,
  email,
  skillLevel,
  level,
  points,
  streakDays,
  earnedBadgesCount,
  assistantName,
  levelProgress
}: UserProfileSectionProps) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      padding: '24px',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      color: '#e8e8e8'
    }}>
      <div className="p-6">
        <Inline gap="default" align="center" justify="between" className="flex-wrap">
          {/* User Info */}
          <Inline gap="default" align="center">
                <div 
                  style={{
                    height: '64px',
                    width: '64px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#ffffff',
                    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                  }}>
              <span style={{fontSize: '24px', fontWeight: '600'}}>
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div style={{fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", color: '#e8e8e8'}}>
              <Heading level={2} as="h1" style={{color: '#ffffff', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontWeight: '600'}}>{userName}</Heading>
              {skillLevel && (
                <Muted variant="small" style={{color: '#a78bfa', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>
                  {skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)} Level
                </Muted>
              )}
              {assistantName && (
                <Muted variant="small" style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>
                  Learning with {assistantName}
                </Muted>
              )}
              {email && (
                <Muted variant="tiny" style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>{email}</Muted>
              )}
            </div>
          </Inline>

          {/* Level Progress */}
          <div className="flex-1 max-w-md min-w-[250px]">
            <Inline gap="default" align="center" justify="between" className="mb-2">
              <Inline gap="tight" align="center">
                <Trophy className="h-4 w-4" style={{color: '#a78bfa'}} />
                <Heading level={6} as="span" style={{color: '#ffffff', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontWeight: '600'}}>Level {level}</Heading>
              </Inline>
              <Muted variant="small" as="span" style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>
                {points.toLocaleString()} points
              </Muted>
            </Inline>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              height: '8px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div
                style={{ 
                  width: `${levelProgress.percent}%`,
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  height: '100%',
                  transition: 'width 0.3s ease',
                  borderRadius: '8px',
                  boxShadow: '0 0 12px rgba(102, 126, 234, 0.5)'
                }}
              />
            </div>
            <Inline gap="default" align="center" justify="between" className="mt-1">
              <Muted variant="tiny" as="span" style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>{levelProgress.percent}% to Level {level + 1}</Muted>
              <Muted variant="tiny" as="span" style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>{levelProgress.pointsToNext.toLocaleString()} pts needed</Muted>
            </Inline>
          </div>

          {/* Quick Stats */}
          <Inline gap="loose" align="center">
            <div 
              style={{
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                color: '#e8e8e8',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
              }}>
              <Inline gap="tight" align="center" className="mb-1">
                <Flame className="h-4 w-4" style={{color: '#f59e0b'}} />
                <Heading level={2} as="span" style={{color: '#ffffff', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontWeight: '600'}}>{streakDays}</Heading>
              </Inline>
              <Muted variant="tiny" as="span" style={{color: '#94a3b8', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"}}>Day Streak</Muted>
            </div>
          </Inline>
        </Inline>
      </div>
    </div>
  );
}