export const runtime = "nodejs"

import { NextResponse } from "next/server"

import { getFirebaseAdminAuth } from "@/lib/firebase/admin"

const SESSION_COOKIE_NAME = "session"
const SESSION_EXPIRES_IN = 1000 * 60 * 60 * 24 * 5 // 5 days

function extractToken(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length)
  }
  return null
}

export async function POST(request: Request) {
  const token = extractToken(request)

  if (!token) {
    return NextResponse.json({ error: "Missing ID token" }, { status: 400 })
  }

  try {
    const auth = getFirebaseAdminAuth()
    await auth.verifyIdToken(token)
    const sessionCookie = await auth.createSessionCookie(token, {
      expiresIn: SESSION_EXPIRES_IN,
    })

    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      maxAge: SESSION_EXPIRES_IN / 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[session] Unable to create session cookie", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  })
  return response
}
