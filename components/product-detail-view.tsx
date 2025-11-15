"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Heart } from "lucide-react";

import { Button } from "./ui/button";
import type { Product } from "@/lib/domain/product";

interface ProductDetailViewProps {
  product: Product;
  userId: string;
  isFavorited: boolean;
}

export function ProductDetailView({
  product,
  userId,
  isFavorited: initialFavorited,
}: ProductDetailViewProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(product.image_url);

  const handleToggleFavorite = async () => {
    setIsLoading(true);
    try {
      if (isFavorited) {
        await fetch(`/api/favorites?productId=${product.id}`, {
          method: "DELETE",
        });
        setIsFavorited(false);
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("[favorites] Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCoverImage = async () => {
      if (!product.entities || product.entities.length === 0) return;

      const truncatedTitle = product.title.split(" (")[0];
      for (const entity of product.entities) {
        const authorName = entity;
        const coverUrl = `https://bookcover.longitood.com/bookcover?book_title=${encodeURIComponent(
          truncatedTitle
        )}&author_name=${encodeURIComponent(authorName)}`;

        try {
          const response = await fetch(coverUrl);
          if (!response.ok) {
            continue;
          }

          const data = (await response.json()) as { url?: string };
          if (data.url && !data.url.toLowerCase().includes("nophoto")) {
            setImageUrl(data.url);
            break;
          }
        } catch (error) {
        }
      }
    };

    fetchCoverImage();
  }, [product.entities, product.title]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-medium text-green-600 hover:text-green-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a resultados
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Image */}
            <div className="flex items-center justify-center">
              <div className="relative h-full w-full max-w-md">
                <div className="overflow-hidden rounded-lg bg-slate-100">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-6">
              {/* Category */}
              {product.category && (
                <div className="inline-block w-fit rounded-full bg-green-50 px-4 py-1 text-sm font-medium text-green-700">
                  {product.category}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl font-bold text-slate-900">
                {product.title}
              </h1>

              {/* Metadata from document */}
              <div className="space-y-1 text-sm text-slate-700">
                {product.publisher && (
                  <div>
                    <span className="font-semibold">Editorial: </span>
                    {product.publisher}
                  </div>
                )}
                {product.publication_date && (
                  <div>
                    <span className="font-semibold">
                      Fecha de publicación:{" "}
                    </span>
                    {product.publication_date}
                  </div>
                )}
                {product.entities && product.entities.length > 0 && (
                  <div>
                    <span className="font-semibold">Entidades: </span>
                    {product.entities.join(", ")}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h3 className="mb-3 text-lg font-semibold text-slate-900">
                  Descripción
                </h3>
                <p className="whitespace-pre-line leading-relaxed text-slate-700">
                  {product.description || "Sin descripción disponible."}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleToggleFavorite}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1 border-slate-200 bg-transparent"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isFavorited
                        ? "fill-red-500 text-red-500"
                        : "text-slate-600"
                    }`}
                  />
                  {isFavorited ? "Guardado" : "Guardar"}
                </Button>
                {product.url && (
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1"
                  >
                    <Button className="flex w-full items-center justify-center gap-2 bg-green-600 hover:bg-green-700">
                      Ver en origen
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

