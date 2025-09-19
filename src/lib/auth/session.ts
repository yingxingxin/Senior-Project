// Cookie helpers plus session lookup utilities for API/routes.
import type { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, COOKIE_OPTIONS } from "./constants";
import { verifyAuthToken } from "./jwt";
import type { TokenPayload } from "./types";

// Read the auth cookie straight from the Next.js request.
export function readAuthCookie(request: NextRequest): string | undefined {
  return request.cookies.get(AUTH_COOKIE)?.value;
}

// Attach the JWT to the outgoing response.
export function applyAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE, token, COOKIE_OPTIONS);
}

// Remove the cookie (e.g., during logout) by expiring it immediately.
export function removeAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}

// Convenience helper for route handlers to fetch the session payload.
export async function getSessionFromRequest(request: NextRequest): Promise<TokenPayload | null> {
  const token = readAuthCookie(request);
  if (!token) return null;

  try {
    return await verifyAuthToken(token);
  } catch {
    return null;
  }
}
