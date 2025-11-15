import type { FacetFilters, ProductFilters } from "@/lib/domain/product";

export function parseProductFiltersFromSearchParams(
  searchParams: URLSearchParams
): ProductFilters {
  const rawSearch = searchParams.get("search");
  const search =
    rawSearch && rawSearch.trim().length > 0 ? rawSearch : undefined;

  const publishers = searchParams.getAll("publisher").map((v) => v.trim());
  const languages = searchParams.getAll("language").map((v) => v.trim());
  const editions = searchParams.getAll("edition").map((v) => v.trim());
  const pubYears = searchParams.getAll("pubYear").map((v) => v.trim());

  return {
    search,
    facets: {
      publisher: publishers.length ? publishers : undefined,
      language: languages.length ? languages : undefined,
      edition: editions.length ? editions : undefined,
      pubYears: pubYears.length ? pubYears : undefined,
    },
  };
}

export function buildQueryStringFromFilters(
  searchQuery: string,
  facets: FacetFilters
): string {
  const params = new URLSearchParams();

  if (searchQuery) {
    params.set("search", searchQuery);
  }

  facets.publisher.forEach((v) => params.append("publisher", v));
  facets.language.forEach((v) => params.append("language", v));
  facets.edition.forEach((v) => params.append("edition", v));
  facets.pubYears.forEach((v) => params.append("pubYear", v));

  return params.toString();
}

