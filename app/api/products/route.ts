export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { fetchProducts, type ProductFilters } from "@/lib/server/products";

function parseNumber(value: string | null) {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Collect facet-based filters only
  const publishers = searchParams.getAll("publisher").map((v) => v.trim());
  const languages = searchParams.getAll("language").map((v) => v.trim());
  const editions = searchParams.getAll("edition").map((v) => v.trim());
  const pubYears = searchParams.getAll("pubYear").map((v) => v.trim());

  const rawSearch = searchParams.get("search");
  const search =
    rawSearch && rawSearch.trim().length > 0 ? rawSearch : undefined;
  const filters: ProductFilters = {
    search,
    facets: {
      publisher: publishers.length ? publishers : undefined,
      language: languages.length ? languages : undefined,
      edition: editions.length ? editions : undefined,
      pubYears: pubYears.length ? pubYears : undefined,
    },
  };

  console.log("API GET /products with filters:", filters);

  const products = await fetchProducts(filters);
  return NextResponse.json({ products });
}
