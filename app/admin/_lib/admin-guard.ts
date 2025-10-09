import "server-only";

import { auth } from "@/src/lib/auth";
import { db, users } from "@/src/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

/**
 * Server-side utility to check if a user has admin role
 * Returns user data with role or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const userId = Number(session.user.id);

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user || null;
}

/**
 * Check if the current user is an admin
 * Returns true if user has admin role, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

/**
 * Require admin role or redirect to home
 * Use this in admin pages/layouts to protect routes
 * Throws redirect() if not admin
 */
export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/home");
  }

  return user;
}

/**
 * Require any of the specified roles
 * Useful for future RBAC expansion
 * @param allowedRoles Array of allowed roles
 */
export async function requireAnyRole(allowedRoles: string[]) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(user.role)) {
    redirect("/home");
  }

  return user;
}

// TODO: Future enhancement - add audit logging for admin actions
// export async function logAdminAction(action: string, targetTable: string, targetId: string, payload?: any) {
//   const user = await requireAdmin();
//   await db.insert(adminAuditLogs).values({
//     actor_user_id: user.id,
//     action,
//     target_table: targetTable,
//     target_id: targetId,
//     payload,
//     occurred_at: new Date(),
//   });
// }