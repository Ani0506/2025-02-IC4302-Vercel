import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { getFirebaseAdminAuth, verifySessionCookie } from "@/lib/firebase/admin"

export interface AuthenticatedUser {
  uid: string
  email: string | null
  displayName: string | null
}

function getSessionToken(): string | undefined {
  const store = cookies()
  return store.get("session")?.value
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const token = getSessionToken()
  if (!token) {
    return null
  }

  try {
    const decoded = await verifySessionCookie(token)
    const userRecord = await getFirebaseAdminAuth().getUser(decoded.uid)
    return {
      uid: userRecord.uid,
      email: userRecord.email ?? null,
      displayName: userRecord.displayName ?? null,
    }
  } catch (error) {
    console.error("[auth] Failed to verify session", error)
    const store = cookies()
    try {
      // delete may not exist in read-only contexts
      // @ts-expect-error delete is available in request cookies
      store.delete?.("session")
    } catch (deleteError) {
      console.error("[auth] Failed to delete invalid session cookie", deleteError)
    }
    return null
  }
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}
