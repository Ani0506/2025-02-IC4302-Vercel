import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth"

import { getFirebaseAuth } from "./client"

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  const auth = getFirebaseAuth()
  return onAuthStateChanged(auth, callback)
}

export async function signInWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth()
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

export async function signUpWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth()
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  if (!user.emailVerified) {
    await sendEmailVerification(user)
  }
  return user
}

export async function signOutCurrentUser() {
  const auth = getFirebaseAuth()
  await signOut(auth)
}
