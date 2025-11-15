export const runtime = "nodejs"

import { type NextRequest } from "next/server"

import { verifySessionCookie } from "@/lib/firebase/admin"
import { addFavorite, listFavorites, removeFavorite } from "@/lib/server/products"
import { badRequest, ok, unauthorized, serverError } from "@/lib/server/api"

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
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return ok({ favorites: [] })
    }

    const favorites = await listFavorites(userId)
    return ok({ favorites })
  } catch (error) {
    console.error("[favorites] Error listing favorites:", error)
    return serverError("Error al obtener favoritos")
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return unauthorized("No autenticado")
    }

    const { productId } = (await request.json()) as { productId?: string }

    if (!productId) {
      return badRequest("productId es requerido")
    }

    await addFavorite(userId, productId)
    return ok({ success: true })
  } catch (error) {
    console.error("[favorites] Error adding favorite:", error)
    return serverError("Error al agregar favorito")
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return unauthorized("No autenticado")
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return badRequest("productId es requerido")
    }

    await removeFavorite(userId, productId)
    return ok({ success: true })
  } catch (error) {
    console.error("[favorites] Error removing favorite:", error)
    return serverError("Error al eliminar favorito")
  }
}
