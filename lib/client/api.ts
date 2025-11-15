import type { Product, FacetFilters } from "@/lib/domain/product";
import { buildQueryStringFromFilters } from "@/lib/domain/product-filters";

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function getProducts(params: {
  searchQuery: string;
  facets: FacetFilters;
}): Promise<Product[]> {
  const query = buildQueryStringFromFilters(params.searchQuery, params.facets);
  const data = await fetchJson<{ products?: Product[] }>(`/api/products?${query}`);
  return data.products ?? [];
}

export interface FacetBucket {
  value: string;
  count: number;
}

export interface FacetResponse {
  facets: {
    count: number;
    facets: {
      publisher?: { buckets: FacetBucket[] };
      language?: { buckets: FacetBucket[] };
      edition?: { buckets: FacetBucket[] };
      pubDate?: { buckets: FacetBucket[] };
    };
  };
}

export async function getFacets(searchQuery: string): Promise<FacetResponse["facets"]> {
  const qs = new URLSearchParams();
  if (searchQuery) qs.set("search", searchQuery);
  const data = await fetchJson<{ facets: FacetResponse["facets"] }>(
    `/api/products/facets?${qs.toString()}`
  );
  return data.facets;
}

export async function getFavorites(): Promise<string[]> {
  const data = await fetchJson<{ favorites?: string[] }>("/api/favorites");
  return data.favorites ?? [];
}

export async function toggleFavorite(
  productId: string,
  isFavorited: boolean
): Promise<boolean> {
  if (isFavorited) {
    await fetchJson<{ success: boolean }>(`/api/favorites?productId=${productId}`, {
      method: "DELETE",
    });
    return false;
  }

  await fetchJson<{ success: boolean }>("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  return true;
}

