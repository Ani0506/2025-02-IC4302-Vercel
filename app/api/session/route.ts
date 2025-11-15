export const runtime = "nodejs"

import { NextResponse } from "next/server"

import { getFirebaseAdminAuth } from "@/lib/firebase/admin"
import { badRequest, ok, unauthorized, serverError } from "@/lib/server/api"

const SESSION_COOKIE_NAME = "session"
const SESSION_EXPIRES_IN = 1000 * 60 * 60 * 24 * 5

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
    return badRequest("Falta el ID token en Authorization")
  }

  try {
    const auth = getFirebaseAdminAuth()
    await auth.verifyIdToken(token)
    const sessionCookie = await auth.createSessionCookie(token, {
      expiresIn: SESSION_EXPIRES_IN,
    })

    const response = ok({ success: true })
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
    if (error instanceof Error) {
      return unauthorized("ID token inválido")
    }
    return serverError("Error al crear la sesión")
  }
}

export async function DELETE() {
  const response = ok({ success: true })
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  })
  return response
}
