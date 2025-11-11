"use client";

import { Stack } from "@/components/ui/spacing";
import { Body, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Target, Bell, Accessibility } from "lucide-react";

/**
 * Preferences Tab
 *
 * User learning preferences and accessibility settings:
 * - Daily goals (minutes, points)
 * - Difficulty preference
 * - Reminder settings
 * - Timezone
 * - Accessibility (low motion, etc.)
 *
 * Maps to user_preferences table in database.
 */

interface PreferencesTabProps {
  userId: number;
}

export function PreferencesTab({ userId: _userId }: PreferencesTabProps) {
  return (
    <Stack gap="default">
      <Body>Configure your learning preferences and goals</Body>

      {/* Daily Goals Card */}
      <Card className="p-6">
        <Stack gap="default">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <Body className="font-semibold">Daily Goals</Body>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="daily-minutes">Daily Study Minutes</Label>
              <Input
                id="daily-minutes"
                type="number"
                placeholder="30"
                min="0"
                disabled
              />
              <Muted variant="small">
                Set your daily study time goal in minutes
              </Muted>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily-points">Daily Points Goal</Label>
              <Input
                id="daily-points"
                type="number"
                placeholder="100"
                min="0"
                disabled
              />
              <Muted variant="small">
                Set your daily points target to earn
              </Muted>
            </div>
          </div>

          <Muted variant="small">
            Goal tracking coming soon. Set targets to stay motivated!
          </Muted>
        </Stack>
      </Card>

      {/* Learning Preferences Card */}
      <Card className="p-6">
        <Stack gap="default">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <Body className="font-semibold">Learning Preferences</Body>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Preferred Difficulty</Label>
            <Select disabled>
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Muted variant="small">
              Choose the default difficulty level for lessons
            </Muted>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select disabled>
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">
                  Eastern Time (ET)
                </SelectItem>
                <SelectItem value="America/Chicago">
                  Central Time (CT)
                </SelectItem>
                <SelectItem value="America/Denver">
                  Mountain Time (MT)
                </SelectItem>
                <SelectItem value="America/Los_Angeles">
                  Pacific Time (PT)
                </SelectItem>
              </SelectContent>
            </Select>
            <Muted variant="small">
              Used for accurate streak calculations and reminders
            </Muted>
          </div>
        </Stack>
      </Card>

      {/* Notifications Card */}
      <Card className="p-6">
        <Stack gap="default">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <Body className="font-semibold">Notifications</Body>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="reminders">Daily Reminders</Label>
              <Muted variant="small">
                Receive daily study reminders via email
              </Muted>
            </div>
            <Switch id="reminders" disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-time">Reminder Time</Label>
            <Input id="reminder-time" type="time" disabled />
            <Muted variant="small">
              Choose when you want to receive daily reminders
            </Muted>
          </div>

          <Muted variant="small">
            Notification settings coming soon. Stay tuned!
          </Muted>
        </Stack>
      </Card>

      {/* Accessibility Card */}
      <Card className="p-6">
        <Stack gap="default">
          <div className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            <Body className="font-semibold">Accessibility</Body>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="low-motion">Reduce Motion</Label>
              <Muted variant="small">
                Minimize animations and transitions
              </Muted>
            </div>
            <Switch id="low-motion" disabled />
          </div>

          <Muted variant="small">
            Accessibility settings coming soon. Maps to user_theme_settings.low_motion
          </Muted>
        </Stack>
      </Card>
    </Stack>
  );
}
