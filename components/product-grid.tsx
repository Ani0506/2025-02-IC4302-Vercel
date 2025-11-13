"use client";

import { useEffect, useState } from "react";

import { Spinner } from "@/components/ui/spinner";

import { ProductCard } from "./product-card";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  image_url: string;
  category: string;
  rating: number;
  review_count: number;
  in_stock: boolean;
}

interface FacetFilters {
  publisher: string[];
  language: string[];
  edition: string[];
  pubYears: string[];
}

interface ProductGridProps {
  searchQuery: string;
  facets: FacetFilters;
  userId: string;
}

function buildQueryParams({
  searchQuery,
  facets,
}: {
  searchQuery: string;
  facets: FacetFilters;
}) {
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

export function ProductGrid({ searchQuery, facets, userId }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isSubscribed = true;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = buildQueryParams({ searchQuery, facets });
        const response = await fetch(`/api/products?${query}`);
        if (!response.ok) {
          throw new Error("No se pudo cargar los productos");
        }
        const data = (await response.json()) as { products?: Product[] };
        if (isSubscribed) {
          setProducts(data.products ?? []);
        }
      } catch (error) {
        console.error("[products] Error fetching products:", error);
        if (isSubscribed) {
          setProducts([]);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    return () => {
      isSubscribed = false;
    };
  }, [searchQuery, facets]);

  useEffect(() => {
    let isSubscribed = true;

    const fetchFavorites = async () => {
      try {
        const response = await fetch("/api/favorites");
        if (!response.ok) {
          throw new Error("No se pudieron cargar los favoritos");
        }
        const data = (await response.json()) as { favorites?: string[] };
        if (isSubscribed) {
          setFavorites(new Set(data.favorites ?? []));
        }
      } catch (error) {
        console.error("[favorites] Error fetching favorites:", error);
        if (isSubscribed) {
          setFavorites(new Set());
        }
      }
    };

    if (userId) {
      fetchFavorites();
    }

    return () => {
      isSubscribed = false;
    };
  }, [userId]);

  const toggleFavorite = async (productId: string) => {
    const isFavorited = favorites.has(productId);

    try {
      if (isFavorited) {
        await fetch(`/api/favorites?productId=${productId}`, {
          method: "DELETE",
        });
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        setFavorites((prev) => {
          const next = new Set(prev);
          next.add(productId);
          return next;
        });
      }
    } catch (error) {
      console.error("[favorites] Error toggling favorite:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600">No se encontraron productos</p>
          <p className="text-sm text-slate-500">Intenta con otros filtros</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="mb-4 text-sm text-slate-600">
        {products.length} producto{products.length !== 1 ? "s" : ""} encontrado
        {products.length !== 1 ? "s" : ""}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorited={favorites.has(product.id)}
            onToggleFavorite={() => toggleFavorite(product.id)}
          />
        ))}
      </div>
    </div>
  );
}
