import { NextResponse, type NextRequest } from "next/server"

import { firebaseAdminAuth } from "@/lib/firebase/admin"

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value

  if (!sessionCookie) {
    return NextResponse.next()
  }

  try {
    await firebaseAdminAuth.verifySessionCookie(sessionCookie, true)
    return NextResponse.next()
  } catch (error) {
    console.error("[middleware] Invalid session cookie", error)
    const response = NextResponse.next()
    response.cookies.delete("session")
    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
