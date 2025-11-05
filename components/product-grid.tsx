"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ProductCard } from "./product-card"
import { Spinner } from "@/components/ui/spinner"

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

interface ProductGridProps {
  searchQuery: string
  category: string | null
  priceRange: [number, number]
  sortBy: string
  userId: string
}

export function ProductGrid({ searchQuery, category, priceRange, sortBy, userId }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const supabase = createClient()

      let query = supabase.from("products").select("*")

      if (category) {
        query = query.eq("category", category)
      }

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`)
      }

      query = query.gte("price", priceRange[0]).lte("price", priceRange[1])

      if (sortBy === "price-low") {
        query = query.order("price", { ascending: true })
      } else if (sortBy === "price-high") {
        query = query.order("price", { ascending: false })
      } else if (sortBy === "rating") {
        query = query.order("rating", { ascending: false })
      } else {
        query = query.order("created_at", { ascending: false })
      }

      const { data, error } = await query

      if (!error && data) {
        setProducts(data)
      }
      setLoading(false)
    }

    fetchProducts()
  }, [searchQuery, category, priceRange, sortBy])

  useEffect(() => {
    const fetchFavorites = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("favorites").select("product_id").eq("user_id", userId)

      if (!error && data) {
        setFavorites(new Set(data.map((fav) => fav.product_id)))
      }
    }

    fetchFavorites()
  }, [userId])

  const toggleFavorite = async (productId: string) => {
    const supabase = createClient()
    const isFavorited = favorites.has(productId)

    if (isFavorited) {
      await supabase.from("favorites").delete().eq("product_id", productId).eq("user_id", userId)

      setFavorites((prev) => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    } else {
      await supabase.from("favorites").insert([
        {
          product_id: productId,
          user_id: userId,
        },
      ])

      setFavorites((prev) => new Set(prev).add(productId))
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600">No se encontraron productos</p>
          <p className="text-sm text-slate-500">Intenta con otros filtros</p>
        </div>
      </div>
    )
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
  )
}
