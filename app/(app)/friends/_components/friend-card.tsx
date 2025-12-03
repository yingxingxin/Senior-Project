import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heading, Muted } from "@/components/ui/typography";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FriendCardProps {
  user_id: number;
  handle: string;
  display_name: string | null;
  tagline: string | null;
  avatar_url: string | null;
}

export function FriendCard({
  handle,
  display_name,
  tagline,
  avatar_url,
}: FriendCardProps) {
  const displayName = display_name || handle;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Link href={`/u/${handle}`}>
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <Link href={`/u/${handle}`}>
              <Heading level={4} className="mb-1 truncate">
                {displayName}
              </Heading>
              <Muted className="text-sm mb-2">@{handle}</Muted>
            </Link>
            {tagline && (
              <Muted className="text-sm line-clamp-2 mb-3">{tagline}</Muted>
            )}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href={`/u/${handle}`}>
                View Profile
                <ExternalLink className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

