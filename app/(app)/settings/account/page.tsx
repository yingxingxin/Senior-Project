import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AccountSettingsTab } from "../_components/account-settings-tab";

/**
 * Account Settings Page
 *
 * Route: /settings/account
 * Manage profile, email, and account security
 */

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = Number(session.user.id);
  const user = session.user;

  return <AccountSettingsTab user={user} userId={userId} />;
}
