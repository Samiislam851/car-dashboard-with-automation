import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const ACCESS_TOKEN_COOKIE_NAME = "access_token";

const BCRYPT_SALT_ROUNDS = 10;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export function verifyPassword(password: string, stored: string) {
  return bcrypt.compare(password, stored);
}

export type SessionUser = {
  id: string;
  email: string;
  role: string;
};

export function createAccessToken(user: SessionUser) {
  const token = jwt.sign(
    { email: user.email, role: user.role },
    getJwtSecret(),
    {
      subject: user.id,
      algorithm: "HS256",
      expiresIn: ACCESS_TOKEN_MAX_AGE_SECONDS,
    }
  );

  return { token, maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS };
}

export function verifyAccessToken(token: string): SessionUser | null {
  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    }) as jwt.JwtPayload;

    if (typeof payload.sub !== "string") return null;

    return {
      id: payload.sub,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}
