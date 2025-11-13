"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

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
  const discount = product.original_price
    ? Math.round(
        ((product.original_price - product.price) / product.original_price) *
          100
      )
    : 0;

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group rounded-lg border border-slate-200 bg-white p-4 transition-all hover:shadow-lg cursor-pointer h-full">
        {/* Image Container */}
        <div className="relative mb-4 overflow-hidden rounded-lg bg-slate-100">
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.title}
            className="h-48 w-full object-cover transition-transform group-hover:scale-105"
          />
          {discount > 0 && (
            <div className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
              -{discount}%
            </div>
          )}
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

        {/* Category Badge */}
        <div className="mb-2 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          {product.category}
        </div>

        {/* Title */}
        <h3 className="mb-2 font-semibold text-slate-900 line-clamp-2">
          {product.title}
        </h3>

        {/* Description */}
        <p className="mb-3 text-xs text-slate-600 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-sm ${
                  i < Math.floor(product.rating)
                    ? "text-yellow-400"
                    : "text-slate-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-xs text-slate-600">
            ({product.review_count})
          </span>
        </div>

        {/* Price */}
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-slate-900">
            ${product.price.toFixed(2)}
          </span>
          {product.original_price && (
            <span className="text-sm text-slate-500 line-through">
              ${product.original_price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div>
          <span
            className={`text-xs font-semibold ${
              product.in_stock ? "text-green-600" : "text-red-600"
            }`}
          >
            {product.in_stock ? "En Stock" : "Sin Stock"}
          </span>
        </div>
      </div>
    </Link>
  );
}
