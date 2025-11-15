"use client";

import type React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ensureServerSession,
  signInWithEmail,
  subscribeToAuthChanges,
} from "@/lib/firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const sessionInitializedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (!isMounted) {
        return;
      }

      if (!firebaseUser) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        if (!sessionInitializedRef.current) {
          await ensureServerSession(firebaseUser);
          sessionInitializedRef.current = true;
        }

        router.replace("/");
      } catch (authError) {
        console.error("[login] Error ensuring session cookie:", authError);
        setError("Ocurrió un problema al validar la sesión.");
      } finally {
        setIsCheckingAuth(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const user = await signInWithEmail(email, password);
      await ensureServerSession(user);
      sessionInitializedRef.current = true;
      router.replace("/");
    } catch (authError) {
      console.error("[login] Error signing in:", authError);
      setError(
        authError instanceof Error
          ? authError.message
          : "OcurriA3 un error al iniciar sesiA3n."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="text-slate-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900">Bienvenido</h1>
            <p className="text-slate-600">Inicia sesión en tu cuenta</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="border-slate-200"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Iniciando..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <p className="text-center text-sm text-slate-600">
              ¿No tienes cuenta?{" "}
              <Link
                href="/auth/sign-up"
                className="font-semibold text-green-600 hover:text-green-700"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
