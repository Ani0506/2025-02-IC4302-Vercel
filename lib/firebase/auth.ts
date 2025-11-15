import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";

import { getFirebaseAuth } from "./client";

async function createServerSession(user: User) {
  const token = await user.getIdToken();
  const response = await fetch("/api/session", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("No se pudo crear la sesión en el servidor");
  }
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}

export async function signInWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function signUpWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  if (!user.emailVerified) {
    await sendEmailVerification(user);
  }
  return user;
}

export async function signOutCurrentUser() {
  const auth = getFirebaseAuth();
  await signOut(auth);
}

export async function ensureServerSession(user: User | null) {
  if (!user) return;
  await createServerSession(user);
}

export async function signOutFromApp() {
  await fetch("/api/session", { method: "DELETE", credentials: "include" });
  await signOutCurrentUser();
}

