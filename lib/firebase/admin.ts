import { getApp, getApps, initializeApp, cert, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

let adminApp: App | undefined

function getServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase admin credentials. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.")
  }

  privateKey = privateKey.replace(/\\n/g, "\n")

  return {
    projectId,
    clientEmail,
    privateKey,
  }
}

export function getFirebaseAdminApp() {
  if (adminApp) {
    return adminApp
  }

  if (!getApps().length) {
    adminApp = initializeApp({
      credential: cert(getServiceAccount()),
    })
  } else {
    adminApp = getApp()
  }

  return adminApp
}

export const firebaseAdminAuth = getAuth(getFirebaseAdminApp())
export const firebaseAdminDb = getFirestore(getFirebaseAdminApp())

export async function verifyIdToken(token: string) {
  return firebaseAdminAuth.verifyIdToken(token)
}

export async function verifySessionCookie(cookie: string) {
  return firebaseAdminAuth.verifySessionCookie(cookie, true)
}
