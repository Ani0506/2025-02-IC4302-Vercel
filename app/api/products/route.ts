export const runtime = "nodejs"

import { ok, serverError } from "@/lib/server/api"
import { fetchProducts, type ProductFilters } from "@/lib/server/products"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const publishers = searchParams.getAll("publisher").map((v) => v.trim())
  const languages = searchParams.getAll("language").map((v) => v.trim())
  const editions = searchParams.getAll("edition").map((v) => v.trim())
  const pubYears = searchParams.getAll("pubYear").map((v) => v.trim())

  const rawSearch = searchParams.get("search")
  const search = rawSearch && rawSearch.trim().length > 0 ? rawSearch : undefined

  const filters: ProductFilters = {
    search,
    facets: {
      publisher: publishers.length ? publishers : undefined,
      language: languages.length ? languages : undefined,
      edition: editions.length ? editions : undefined,
      pubYears: pubYears.length ? pubYears : undefined,
    },
  }

  try {
    const products = await fetchProducts(filters)
    return ok({ products })
  } catch (error) {
    console.error("[products] Error fetching products:", error)
    return serverError("Error al obtener productos")
  }
}
