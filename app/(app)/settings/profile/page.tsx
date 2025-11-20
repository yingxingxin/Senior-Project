import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import {
  getUserProfileByUserId,
  getUserProfileByHandle,
} from "@/src/db/queries/profile";
import { ProfileForm } from "./_components/profile-form";
import { ProjectsForm } from "./_components/projects-form";
import { ExperiencesForm } from "./_components/experiences-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stack } from "@/components/ui/spacing";
import { Body } from "@/components/ui/typography";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

/**
 * Profile Settings Page
 *
 * Allows authenticated users to edit their profile, projects, and experiences
 */
export default async function ProfileSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Load profile data
  const profile = await getUserProfileByUserId(userId);

  // If profile exists, get full data with projects and experiences
  const fullProfileData = profile
    ? await getUserProfileByHandle(profile.handle)
    : null;

  return (
    <Stack gap="default">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Profile Settings</h1>
          <Body className="text-muted-foreground">
            Manage your public portfolio profile
          </Body>
        </div>
        {profile?.handle && (
          <Button variant="outline" asChild>
            <Link href={`/u/${profile.handle}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Public Profile
            </Link>
          </Button>
        )}
      </div>

      {!profile?.handle && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <Body className="text-warning-foreground">
              Set your handle to create your public profile URL.
            </Body>
          </CardContent>
        </Card>
      )}

      {/* Profile Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initialData={fullProfileData || null}
            userId={userId}
          />
        </CardContent>
      </Card>

      {/* Projects Section */}
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectsForm
            initialProjects={fullProfileData?.projects || []}
            userId={userId}
          />
        </CardContent>
      </Card>

      {/* Experience Section */}
      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <ExperiencesForm
            initialExperiences={fullProfileData?.experiences || []}
            userId={userId}
          />
        </CardContent>
      </Card>
    </Stack>
  );
}

