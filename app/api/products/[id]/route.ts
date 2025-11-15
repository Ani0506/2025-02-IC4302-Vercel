export const runtime = "nodejs"

import { fetchProductById } from "@/lib/server/products"
import { notFound, ok, serverError } from "@/lib/server/api"

interface RouteContext {
  params: {
    id: string
  }
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const product = await fetchProductById(context.params.id)

    if (!product) {
      return notFound("Producto no encontrado")
    }

    return ok({ product })
  } catch (error) {
    console.error("[products/:id] Error fetching product:", error)
    return serverError("Error al obtener el producto")
  }
}
