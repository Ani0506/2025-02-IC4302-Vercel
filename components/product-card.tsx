"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect } from "react";

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
  url?: string;
  publisher?: string;
  publication_date?: string;
  entities?: string[];
}

interface ProductCardProps {
  product: Product;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}

export function ProductCard({
  product,
  isFavorited,
  onToggleFavorite,
}: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <div className="group h-full cursor-pointer rounded-lg border border-slate-200 bg-white p-4 transition-all hover:shadow-lg">
        {/* Image */}
        <div className="relative mb-4 overflow-hidden rounded-lg bg-slate-100">
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.title}
            className="h-48 w-full object-cover transition-transform group-hover:scale-105"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite();
            }}
            className="absolute right-2 bottom-2 rounded-full bg-white p-2 shadow-sm transition-all hover:bg-slate-50"
            aria-label="Toggle favorite"
          >
            <Heart
              className={`h-5 w-5 transition-all ${
                isFavorited
                  ? "fill-red-500 text-red-500"
                  : "text-slate-400 hover:text-red-500"
              }`}
            />
          </button>
        </div>

        {/* Category */}
        {product.category && (
          <div className="mb-2 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            {product.category}
          </div>
        )}

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 font-semibold text-slate-900">
          {product.title}
        </h3>

        {/* Description */}
        <p className="mb-3 line-clamp-2 text-xs text-slate-600">
          {product.description || "Sin descripción disponible."}
        </p>

        {/* Document metadata straight from structure */}
        <div className="mt-auto space-y-1 text-xs text-slate-600">
          {product.publisher && <div>Editorial: {product.publisher}</div>}
          {product.publication_date && (
            <div>Fecha de publicación: {product.publication_date}</div>
          )}
          {product.url && (
            <div className="truncate text-[11px] text-slate-500">
              {product.url}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

