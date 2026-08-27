import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, createAccessToken, ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, password } = body as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "password is required and must be at least 8 characters" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const { token, maxAge } = createAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(user, { status: 201 });
    response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    console.error(error);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}
