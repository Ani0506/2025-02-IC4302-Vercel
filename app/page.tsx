"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MainLayout } from "@/components/main-layout"

export default function Page() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (data?.user) {
          setUser(data.user)
        } else {
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("[v0] Auth check failed:", error)
        router.push("/auth/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-600">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <MainLayout user={user} />
}
