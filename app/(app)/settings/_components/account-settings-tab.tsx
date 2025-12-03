"use client";

import { Stack } from "@/components/ui/spacing";
import { Body, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar } from "lucide-react";

/**
 * Account Settings Tab
 *
 * Displays and allows editing of user account information:
 * - Name
 * - Email
 * - Account created date
 * - Email verification status
 *
 * Future enhancements:
 * - Change password
 * - Delete account
 * - Two-factor authentication
 */

interface AccountSettingsTabProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    emailVerified?: boolean;
    createdAt?: Date | null;
  };
  userId: number;
}

export function AccountSettingsTab({ user }: AccountSettingsTabProps) {
  return (
    <Stack gap="default">
      <Body>Manage your account information and security settings</Body>

      {/* Account Information Card */}
      <Card className="p-6">
        <Stack gap="default">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Name
            </Label>
            <Input
              id="name"
              defaultValue={user.name ?? ""}
              placeholder="Enter your name"
              disabled
            />
            <Muted variant="small">
              Name editing coming soon. Contact support to update.
            </Muted>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              defaultValue={user.email ?? ""}
              placeholder="Enter your email"
              disabled
            />
            <div className="flex items-center gap-2">
              {user.emailVerified ? (
                <Muted variant="small" className="text-success">
                  Email verified
                </Muted>
              ) : (
                <Muted variant="small" className="text-warning">
                  Email not verified
                </Muted>
              )}
            </div>
          </div>

          {user.createdAt && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Member Since
              </Label>
              <Input
                value={new Date(user.createdAt).toLocaleDateString()}
                disabled
              />
            </div>
          )}
        </Stack>
      </Card>

      {/* Security Section */}
      <Card className="p-6">
        <Stack gap="default">
          <div>
            <Body className="font-semibold">Security</Body>
            <Muted variant="small">
              Manage your password and security preferences
            </Muted>
          </div>

          <Button variant="outline" disabled>
            Change Password
          </Button>

          <Muted variant="small">
            Password management coming soon. Use forgot password on the login
            page to reset.
          </Muted>
        </Stack>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive p-6">
        <Stack gap="default">
          <div>
            <Body className="font-semibold text-destructive">Danger Zone</Body>
            <Muted variant="small">
              Irreversible and destructive actions
            </Muted>
          </div>

          <Button variant="destructive" disabled>
            Delete Account
          </Button>

          <Muted variant="small">
            Account deletion coming soon. Contact support for assistance.
          </Muted>
        </Stack>
      </Card>
    </Stack>
  );
}
