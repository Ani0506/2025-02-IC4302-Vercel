export const runtime = "nodejs"

import { MainLayout } from "@/components/main-layout"
import { requireUser } from "@/lib/server/auth"

export default async function Page() {
  const user = await requireUser()
  return <MainLayout user={user} />
}
