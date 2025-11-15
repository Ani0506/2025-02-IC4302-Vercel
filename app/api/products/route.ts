export const runtime = "nodejs"

import { ok, serverError } from "@/lib/server/api"
import { fetchProducts } from "@/lib/server/products"
import { parseProductFiltersFromSearchParams } from "@/lib/domain/product-filters"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const filters = parseProductFiltersFromSearchParams(searchParams)

  try {
    const products = await fetchProducts(filters)
    return ok({ products })
  } catch (error) {
    console.error("[products] Error fetching products:", error)
    return serverError("Error al obtener productos")
  }
}
