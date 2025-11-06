import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"

let firebaseApp: FirebaseApp | undefined
let firebaseAuth: Auth | undefined

function ensureClientEnv(variable: string | undefined, name: string) {
  if (!variable) {
    throw new Error(`Missing required Firebase client environment variable: ${name}`)
  }
}

function getFirebaseConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID

  ensureClientEnv(apiKey, "NEXT_PUBLIC_FIREBASE_API_KEY")
  ensureClientEnv(authDomain, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN")
  ensureClientEnv(projectId, "NEXT_PUBLIC_FIREBASE_PROJECT_ID")
  ensureClientEnv(storageBucket, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET")
  ensureClientEnv(messagingSenderId, "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID")
  ensureClientEnv(appId, "NEXT_PUBLIC_FIREBASE_APP_ID")

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp
  }

  if (!getApps().length) {
    firebaseApp = initializeApp(getFirebaseConfig())
  } else {
    firebaseApp = getApp()
  }

  return firebaseApp
}

export function getFirebaseAuth(): Auth {
  if (firebaseAuth) {
    return firebaseAuth
  }

  firebaseAuth = getAuth(getFirebaseApp())
  return firebaseAuth
}
