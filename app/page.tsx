export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { MainLayout } from "@/components/main-layout"
import { requireUser } from "@/lib/server/auth"

export default async function Page() {
  const user = await requireUser()
  return <MainLayout user={user} />
}
