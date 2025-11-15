"use client";

import { useEffect, useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import { ProductCard } from "./product-card";
import type { Product, FacetFilters } from "@/lib/domain/product";
import { getFavorites, getProducts, toggleFavorite } from "@/lib/client/api";

interface ProductGridProps {
  searchQuery: string;
  facets: FacetFilters;
  userId: string;
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
        const data = await getProducts({ searchQuery, facets });
        if (isSubscribed) {
          setProducts(data);
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
        const data = await getFavorites();
        if (isSubscribed) {
          setFavorites(new Set(data));
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

  const handleToggleFavorite = async (productId: string) => {
    try {
      const isFavorited = favorites.has(productId);
      const nextState = await toggleFavorite(productId, isFavorited);
      setFavorites((prev) => {
        const next = new Set(prev);
        if (nextState) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
        return next;
      });
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
            onToggleFavorite={() => handleToggleFavorite(product.id)}
          />
        ))}
      </div>
    </div>
  );
}
