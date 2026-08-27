import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createAccessToken, ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, password } = body as Record<string, unknown>;

  if (typeof email !== "string" || !email.trim() || typeof password !== "string") {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const { token, maxAge } = createAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const response = NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
  response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return response;
}
