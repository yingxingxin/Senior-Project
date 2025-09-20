// JWT sign/verify
import { SignJWT, jwtVerify } from "jose";
import { TOKEN } from "./constants";
import { tokenPayloadSchema } from "./schemas";
import type { TokenPayload } from "./schemas";

let cachedSecret: Uint8Array | null = null;

// Lazily encode and cache the secret to avoid repeated work.
function getSecret(): Uint8Array {
  // Return the cached secret if it exists
  if (cachedSecret) return cachedSecret;

  // Get the JWT_SECRET from the environment variables
  const v = process.env.JWT_SECRET;

  // Throw an error if the JWT_SECRET is not defined
  if (!v) throw new Error("JWT_SECRET is not defined");

  // Encode the secret and cache it
  cachedSecret = new TextEncoder().encode(v);
  return cachedSecret;
}

// Create a signed JWT for our TokenPayload.
export async function createAuthToken(payload: TokenPayload): Promise<string> {
  const claims = tokenPayloadSchema.parse(payload);

  return await new SignJWT(claims)
    .setProtectedHeader({ alg: TOKEN.alg })
    .setIssuedAt()
    .setIssuer(TOKEN.issuer)
    .setAudience(TOKEN.audience)
    .setExpirationTime(TOKEN.ttl)
    .sign(getSecret());
}

// Verify a JWT and return the decoded TokenPayload if valid.
export async function verifyAuthToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: [TOKEN.alg],
    issuer: TOKEN.issuer,
    audience: TOKEN.audience,
  });

  return tokenPayloadSchema.parse(payload);
}
