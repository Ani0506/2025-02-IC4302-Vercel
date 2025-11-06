import { NextResponse } from "next/server"

import { fetchProducts, type ProductFilters } from "@/lib/server/products"

function parseNumber(value: string | null) {
  if (!value) {
    return undefined
  }
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const filters: ProductFilters = {
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category"),
    minPrice: parseNumber(searchParams.get("minPrice")),
    maxPrice: parseNumber(searchParams.get("maxPrice")),
    sort: (searchParams.get("sort") as ProductFilters["sort"]) ?? "relevance",
  }

  const products = await fetchProducts(filters)
  return NextResponse.json({ products })
}
