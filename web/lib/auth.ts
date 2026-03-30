import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "irctc_auth_token";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export type AuthTokenPayload = JwtPayload & {
  userId: string;
  email: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export function signAuthToken(payload: Omit<AuthTokenPayload, "iat" | "exp">) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
}

export function getAuthCookieName() {
  return COOKIE_NAME;
}

export async function getAuthTokenFromCookies() {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value || null;
}

