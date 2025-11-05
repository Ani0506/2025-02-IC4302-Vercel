"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-2">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-center text-3xl font-bold text-slate-900">¡Bienvenido!</h1>
            <p className="text-center text-slate-600">
              Tu cuenta ha sido creada exitosamente. Confirma tu correo para continuar.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/auth/login">
              <Button className="w-full bg-green-600 hover:bg-green-700">Ir a Iniciar Sesión</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
