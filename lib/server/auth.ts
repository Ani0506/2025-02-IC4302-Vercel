import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { firebaseAdminAuth, verifySessionCookie } from "@/lib/firebase/admin"

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
    const userRecord = await firebaseAdminAuth.getUser(decoded.uid)
    return {
      uid: userRecord.uid,
      email: userRecord.email ?? null,
      displayName: userRecord.displayName ?? null,
    }
  } catch {
    const store = cookies()
    store.delete("session")
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
