import { getApp, getApps, initializeApp, cert, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

interface ServiceAccountConfig {
  projectId: string
  clientEmail: string
  privateKey: string
}

let adminApp: App | null = null
let adminAuth: Auth | null = null
let adminDb: Firestore | null = null

const serviceAccount = resolveServiceAccount()

function resolveServiceAccount(): ServiceAccountConfig | null {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    return null
  }

  privateKey = privateKey.replace(/\\n/g, "\n")

  return {
    projectId,
    clientEmail,
    privateKey,
  }
}

export const isFirebaseAdminConfigured = Boolean(serviceAccount)

function assertConfigured(): asserts serviceAccount is ServiceAccountConfig {
  if (!serviceAccount) {
    throw new Error("Firebase Admin SDK is not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.")
  }
}

export function getFirebaseAdminApp(): App {
  assertConfigured()

  if (adminApp) {
    return adminApp
  }

  if (!getApps().length) {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    })
  } else {
    adminApp = getApp()
  }

  return adminApp
}

export function getFirebaseAdminAuth(): Auth {
  assertConfigured()

  if (adminAuth) {
    return adminAuth
  }

  adminAuth = getAuth(getFirebaseAdminApp())
  return adminAuth
}

export function getFirebaseAdminDb(): Firestore {
  assertConfigured()

  if (adminDb) {
    return adminDb
  }

  adminDb = getFirestore(getFirebaseAdminApp())
  return adminDb
}

export async function verifyIdToken(token: string) {
  const auth = getFirebaseAdminAuth()
  return auth.verifyIdToken(token)
}

export async function verifySessionCookie(cookie: string) {
  const auth = getFirebaseAdminAuth()
  return auth.verifySessionCookie(cookie, true)
}
