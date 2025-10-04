import { db, users } from "@/src/db";
import { desc } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stack } from "@/components/ui/spacing";
import { Heading, Muted } from "@/components/ui/typography";

async function getUsers() {
  return await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.created_at,
      isEmailVerified: users.is_email_verified,
      onboardingCompleted: users.onboarding_completed_at,
      onboardingStep: users.onboarding_step,
      skillLevel: users.skill_level,
    })
    .from(users)
    .orderBy(desc(users.created_at));
}

export default async function UsersPage() {
  const allUsers = await getUsers();

  return (
    <Stack gap="loose">
      <Stack gap="tight">
        <Heading level={1}>User Management</Heading>
        <Muted variant="small">
          Manage users, view their progress, and update their settings
        </Muted>
      </Stack>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {allUsers.length} total users • Click on a user to view details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Skill Level</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.email}
                      {user.isEmailVerified && (
                        <Badge variant="outline" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.onboardingCompleted ? (
                      <Badge variant="outline" className="bg-green-50">
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50">
                        {user.onboardingStep || "Not Started"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.skillLevel ? (
                      <Badge variant="outline">{user.skillLevel}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/users/${user.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {allUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
}