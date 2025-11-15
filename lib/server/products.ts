export type { Product, ProductFilters, FacetFilters } from "@/lib/domain/product";

export { mapProduct, normalizeCategory, parseRating } from "@/lib/server/products-mapping";
export { fetchProducts, fetchProductById } from "@/lib/server/products-search";
export {
  listFavorites,
  isProductFavorited,
  addFavorite,
  removeFavorite,
} from "@/lib/server/products-favorites";

