"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Heart } from "lucide-react"

import { Button } from "./ui/button"

interface Product {
  id: string
  title: string
  description: string
  price: number
  original_price: number | null
  image_url: string
  category: string
  rating: number
  review_count: number
  in_stock: boolean
}

interface ProductDetailViewProps {
  product: Product
  userId: string
  isFavorited: boolean
}

export function ProductDetailView({ product, userId, isFavorited: initialFavorited }: ProductDetailViewProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isLoading, setIsLoading] = useState(false)

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  const handleToggleFavorite = async () => {
    setIsLoading(true)
    try {
      if (isFavorited) {
        await fetch(`/api/favorites?productId=${product.id}`, { method: "DELETE" })
        setIsFavorited(false)
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        })
        setIsFavorited(true)
      }
    } catch (error) {
      console.error("[favorites] Error toggling favorite:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">
            <ArrowLeft className="h-4 w-4" />
            Volver a productos
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Product Image */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                {discount > 0 && (
                  <div className="absolute right-4 top-4 rounded-full bg-red-500 px-4 py-2 text-lg font-bold text-white">
                    -{discount}%
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-6">
              {/* Category */}
              <div className="inline-block w-fit rounded-full bg-green-50 px-4 py-1 text-sm font-medium text-green-700">
                {product.category}
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl font-bold text-slate-900">{product.title}</h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-2xl ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-slate-300"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-slate-600">
                  {product.rating} ({product.review_count} opiniones)
                </span>
              </div>

              {/* Price */}
              <div className="border-t border-b border-slate-200 py-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-bold text-slate-900">${product.price.toFixed(2)}</span>
                  {product.original_price && (
                    <span className="text-2xl text-slate-500 line-through">${product.original_price.toFixed(2)}</span>
                  )}
                </div>
                {discount > 0 && (
                  <p className="mt-2 text-sm text-green-600 font-semibold">
                    Ahorras ${(product.original_price! - product.price).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${product.in_stock ? "bg-green-500" : "bg-red-500"}`} />
                <span className={`text-lg font-semibold ${product.in_stock ? "text-green-600" : "text-red-600"}`}>
                  {product.in_stock ? "En Stock" : "Sin Stock"}
                </span>
              </div>

              {/* Description */}
              <div className="rounded-lg bg-white p-6 border border-slate-200">
                <h3 className="mb-3 text-lg font-semibold text-slate-900">Descripción del Producto</h3>
                <p className="leading-relaxed text-slate-700">{product.description}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleToggleFavorite}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1 border-slate-200 bg-transparent"
                >
                  <Heart className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : "text-slate-600"}`} />
                  {isFavorited ? "Guardado" : "Guardar"}
                </Button>
                <Link href="/" className="flex-1">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Continuar Comprando</Button>
                </Link>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-100 p-4">
                <div>
                  <p className="text-sm text-slate-600">Envío Gratis</p>
                  <p className="font-semibold text-slate-900">A todo el país</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Garantía</p>
                  <p className="font-semibold text-slate-900">12 meses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
