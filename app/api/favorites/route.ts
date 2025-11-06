import { NextResponse, type NextRequest } from "next/server"

import { verifySessionCookie } from "@/lib/firebase/admin"
import { addFavorite, listFavorites, removeFavorite } from "@/lib/server/products"

async function getUserId(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value
  if (!sessionCookie) {
    return null
  }

  try {
    const decoded = await verifySessionCookie(sessionCookie)
    return decoded.uid
  } catch (error) {
    console.error("[favorites] Invalid session cookie", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) {
    return NextResponse.json({ favorites: [] })
  }

  const favorites = await listFavorites(userId)
  return NextResponse.json({ favorites })
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { productId } = (await request.json()) as { productId?: string }

  if (!productId) {
    return NextResponse.json({ error: "productId es requerido" }, { status: 400 })
  }

  await addFavorite(userId, productId)
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const productId = searchParams.get("productId")

  if (!productId) {
    return NextResponse.json({ error: "productId es requerido" }, { status: 400 })
  }

  await removeFavorite(userId, productId)
  return NextResponse.json({ success: true })
}
