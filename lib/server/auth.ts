import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { getFirebaseAdminAuth, verifySessionCookie } from "@/lib/firebase/admin"

export interface AuthenticatedUser {
  uid: string
  email: string | null
  displayName: string | null
}

const SESSION_COOKIE_NAME = "session"

type CookieStore = {
  get?: (name: string) => { value: string } | undefined
  getAll?: () => Array<{ name: string; value: string }>
  delete?: (name: string) => void
}

function extractSessionFromStore(store: CookieStore): string | undefined {
  if (typeof store.get === "function") {
    return store.get(SESSION_COOKIE_NAME)?.value
  }

  if (typeof store.getAll === "function") {
    const cookie = store.getAll().find((item) => item.name === SESSION_COOKIE_NAME)
    return cookie?.value
  }

  return undefined
}

async function getSessionToken(): Promise<string | undefined> {
  const store = (await cookies()) as CookieStore
  return extractSessionFromStore(store)
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const token = await getSessionToken()
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
    const store = (await cookies()) as CookieStore

    if (typeof store.delete === "function") {
      try {
        store.delete(SESSION_COOKIE_NAME)
      } catch (deleteError) {
        console.error("[auth] Failed to delete invalid session cookie", deleteError)
      }
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
