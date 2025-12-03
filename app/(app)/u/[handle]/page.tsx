import { notFound } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { getUserProfileByHandle } from "@/src/db/queries/profile";
import { getDailyActivityStats } from "@/src/db/queries/activities";
import { getHeatmapDateRangeByDays, buildHeatmapCells } from "@/src/lib/date/activityHeatmap";
import { LearningHeatmap } from "./_components/learning-heatmap";
import { ProfileAssistantCard } from "./_components/profile-assistant-card";
import { FriendButton } from "./_components/friend-button";
import { getRandomPublicProfiles } from "@/src/db/queries/profile";
import { getFriendshipStatus, areFriends } from "@/src/db/queries/friends";
import { getTestimonialsForProfile } from "@/src/db/queries/testimonials";
import { TestimonialsSection } from "./_components/testimonials-section";
import { UserCard } from "@/app/(app)/explore/_components/user-card";
import { db } from "@/src/db";
import { users, assistants } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heading, Body, Muted } from "@/components/ui/typography";
import { Github, Linkedin, Globe, Twitter } from "lucide-react";
import Link from "next/link";

interface PublicProfilePageProps {
  params: Promise<{ handle: string }>;
}

/**
 * Public Profile Page
 *
 * Displays a user's public portfolio profile at /u/[handle]
 * Supports theme customization from user_profile_themes
 */
export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { handle } = await params;

  // Get profile data
  const profileData = await getUserProfileByHandle(handle);

  if (!profileData) {
    notFound();
  }

  // Check if profile is public
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isOwner = session?.user
    ? Number(session.user.id) === profileData.user_id
    : false;

  if (!profileData.is_public && !isOwner) {
    notFound();
  }

  // Get friendship status if logged in and not viewing own profile
  let friendshipStatus: "none" | "pending_incoming" | "pending_outgoing" | "friends" = "none";
  if (session?.user && !isOwner) {
    const currentUserId = Number(session.user.id);
    friendshipStatus = await getFriendshipStatus(
      currentUserId,
      profileData.user_id,
      currentUserId
    );
  }

  const { theme, projects, experiences } = profileData;

  // Extract theme values
  const accentColor = theme?.accent_color || undefined;
  const backgroundImageUrl = theme?.background_image_url || undefined;
  const fontStyle = theme?.font_style || "default";
  const showAssistant = theme?.show_assistant ?? true;

  // Get assistant info if configured and should be shown
  let assistantInfo: {
    name: string | null;
    avatarUrl: string | null;
    tagline: string | null;
  } | null = null;

  if (showAssistant) {
    const [user] = await db
      .select({
        assistant_id: users.assistant_id,
      })
      .from(users)
      .where(eq(users.id, profileData.user_id))
      .limit(1);

    if (user?.assistant_id) {
      const [assistant] = await db
        .select({
          name: assistants.name,
          avatar_url: assistants.avatar_url,
          tagline: assistants.tagline,
        })
        .from(assistants)
        .where(eq(assistants.id, user.assistant_id))
        .limit(1);

      if (assistant) {
        assistantInfo = {
          name: assistant.name,
          avatarUrl: assistant.avatar_url,
          tagline: assistant.tagline,
        };
      }
    }
  }

  // Fetch activity heatmap data
  // Heatmap visibility: Show if profile is public OR user is the owner
  // TODO: Add show_learning_stats privacy flag in the future
  const isViewable = profileData.is_public || isOwner;
  let heatmapCells: ReturnType<typeof buildHeatmapCells> = [];

  // Get recommended profiles (exclude current user)
  const recommendedProfiles = await getRandomPublicProfiles(4, profileData.user_id);

  // Get testimonials for this profile
  const testimonials = await getTestimonialsForProfile(profileData.user_id);

  // Check if current user can write testimonials (must be friends)
  let canWriteTestimonial = false;
  if (session?.user && !isOwner) {
    const currentUserId = Number(session.user.id);
    canWriteTestimonial = await areFriends(currentUserId, profileData.user_id);
  }

  if (isViewable) {
    const { from, to } = getHeatmapDateRangeByDays(30);
    try {
      // Format dates as YYYY-MM-DD strings for the SQL query
      const fromDateStr = from.toISOString().split('T')[0];
      const toDateStr = to.toISOString().split('T')[0];
      
      const dailyStats = await getDailyActivityStats.execute({
        userId: profileData.user_id,
        fromDate: fromDateStr,
        toDate: toDateStr,
      });
      heatmapCells = buildHeatmapCells(from, to, dailyStats);
    } catch (error) {
      // Silently fail if query errors (e.g., no activity table yet)
      console.error('Failed to fetch activity stats:', error);
    }
  }

  // Generate initials from display name or handle
  const displayName = profileData.display_name || profileData.handle;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Font style mapping
  const fontClass =
    fontStyle === "mono"
      ? "font-mono"
      : fontStyle === "rounded"
        ? "font-sans"
        : "font-sans";

  return (
    <div className={`min-h-screen ${fontClass}`}>
      {/* Background Image Overlay */}
      {backgroundImageUrl && (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
      )}

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Hero Section */}
        <Card className="mb-6 overflow-hidden">
          <div
            className="relative p-8"
            style={
              accentColor
                ? {
                    borderTop: `4px solid ${accentColor}`,
                  }
                : undefined
            }
          >
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage
                  src={profileData.avatar_url || undefined}
                  alt={displayName}
                />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-2xl text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Heading level={1} className="mb-1">
                      {displayName}
                    </Heading>
                    <Muted className="mb-2 text-lg">@{profileData.handle}</Muted>
                    {profileData.tagline && (
                      <Body className="text-muted-foreground">
                        {profileData.tagline}
                      </Body>
                    )}
                  </div>
                  {/* Friend Button */}
                  {session?.user && !isOwner && (
                    <FriendButton
                      profileUserId={profileData.user_id}
                      handle={profileData.handle}
                      friendshipStatus={friendshipStatus}
                      accentColor={accentColor}
                    />
                  )}
                </div>

                {/* Social Links */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                  {profileData.github_url && (
                    <Link
                      href={profileData.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Github className="h-5 w-5" />
                      <span className="text-sm">GitHub</span>
                    </Link>
                  )}
                  {profileData.linkedin_url && (
                    <Link
                      href={profileData.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span className="text-sm">LinkedIn</span>
                    </Link>
                  )}
                  {profileData.website_url && (
                    <Link
                      href={profileData.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Globe className="h-5 w-5" />
                      <span className="text-sm">Website</span>
                    </Link>
                  )}
                  {profileData.x_url && (
                    <Link
                      href={profileData.x_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Twitter className="h-5 w-5" />
                      <span className="text-sm">X</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* About Section */}
        {profileData.bio && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle
                style={
                  accentColor
                    ? {
                        color: accentColor,
                      }
                    : undefined
                }
              >
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Body className="whitespace-pre-wrap">{profileData.bio}</Body>
            </CardContent>
          </Card>
        )}

        {/* Assistant Card */}
        {showAssistant && assistantInfo && (
          <ProfileAssistantCard
            handle={handle}
            assistantName={assistantInfo.name}
            assistantAvatarUrl={assistantInfo.avatarUrl}
            assistantTagline={assistantInfo.tagline}
            accentColor={accentColor}
          />
        )}

        {/* Learning Activity Heatmap */}
        {isViewable && heatmapCells.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <LearningHeatmap cells={heatmapCells} accentColor={accentColor} />
            </CardContent>
          </Card>
        )}

        {/* Projects Section */}
        {projects && projects.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle
                style={
                  accentColor
                    ? {
                        color: accentColor,
                      }
                    : undefined
                }
              >
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projects.map((project) => (
                  <div key={project.id}>
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Heading level={4} className="mb-1">
                          {project.title}
                        </Heading>
                        {project.description && (
                          <Body className="mb-2 text-muted-foreground">
                            {project.description}
                          </Body>
                        )}
                        {project.tech_stack && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {project.tech_stack.split(",").map((tech, idx) => (
                              <Badge key={idx} variant="outline">
                                {tech.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {project.link_url && (
                          <Link
                            href={project.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Globe className="h-4 w-4" />
                            View Project
                          </Link>
                        )}
                      </div>
                    </div>
                    {project.id !== projects[projects.length - 1]?.id && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience Section */}
        {experiences && experiences.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle
                style={
                  accentColor
                    ? {
                        color: accentColor,
                      }
                    : undefined
                }
              >
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="mb-2">
                      <Heading level={4} className="mb-1">
                        {exp.role}
                      </Heading>
                      <Body className="mb-1 font-semibold">
                        {exp.organization}
                      </Body>
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        {exp.start_date && (
                          <span>
                            {new Date(exp.start_date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        )}
                        {exp.start_date && (exp.end_date || exp.is_current) && (
                          <span>—</span>
                        )}
                        {exp.is_current ? (
                          <Badge variant="secondary">Current</Badge>
                        ) : (
                          exp.end_date && (
                            <span>
                              {new Date(exp.end_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          )
                        )}
                        {exp.location && (
                          <>
                            <span>•</span>
                            <span>{exp.location}</span>
                          </>
                        )}
                      </div>
                      {exp.description && (
                        <Body className="text-muted-foreground">
                          {exp.description}
                        </Body>
                      )}
                    </div>
                    {exp.id !== experiences[experiences.length - 1]?.id && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Testimonials Section */}
        <TestimonialsSection
          recipientUserId={profileData.user_id}
          testimonials={testimonials.map((t) => ({
            id: t.id,
            body: t.body,
            created_at: t.created_at,
            author_user_id: t.author_user_id,
            author_handle: t.author_handle,
            author_display_name: t.author_display_name,
            author_avatar_url: t.author_avatar_url,
          }))}
          isOwner={isOwner}
          canWrite={canWriteTestimonial}
          accentColor={accentColor}
        />

        {/* Recommended Profiles */}
        {recommendedProfiles.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle
                style={
                  accentColor
                    ? {
                        color: accentColor,
                      }
                    : undefined
                }
              >
                More learners to explore
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedProfiles.map((user) => (
                  <UserCard key={user.user_id} {...user} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* TODO: Music player integration (if showMusicPlayer is true) */}
        {/* TODO: Assistant integration (if showAssistant is true) */}
      </div>
    </div>
  );
}

