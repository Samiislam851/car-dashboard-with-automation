import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE_NAME, verifyAccessToken, type SessionUser } from "@/lib/auth";

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}
