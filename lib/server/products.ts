import type { Filter, Sort } from "mongodb"

import { ObjectId, getCollection, type FavoriteDocument, type ProductDocument } from "@/lib/mongo/client"

const PRODUCTS_COLLECTION = process.env.MONGODB_PRODUCTS_COLLECTION ?? "documents"
const FAVORITES_COLLECTION = process.env.MONGODB_FAVORITES_COLLECTION ?? "favorites"

export interface Product {
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
  url?: string
  publisher?: string
  publication_date?: string
  entities?: string[]
}

function parseRating(raw?: string): { rating: number; reviewCount: number } {
  if (!raw) {
    return { rating: 0, reviewCount: 0 }
  }

  const ratingMatch = raw.match(/(\d+(\.\d+)?)/)
  const rating = ratingMatch ? Number.parseFloat(ratingMatch[1]) : 0

  const reviewsMatch = raw.match(/(\d{1,3}(?:,\d{3})*|\d+)/g)
  let reviewCount = 0
  if (reviewsMatch && reviewsMatch.length > 1) {
    const numeric = reviewsMatch
      .map((value) => Number.parseInt(value.replace(/,/g, ""), 10))
      .filter((value) => Number.isFinite(value))
    if (numeric.length > 1) {
      reviewCount = numeric[1]
    }
  }

  return { rating, reviewCount }
}

function normalizeCategory(doc: ProductDocument): string {
  if (doc.category) {
    return doc.category
  }

  if (doc.entities && doc.entities.length > 0) {
    return doc.entities[0]
  }

  return doc.Publisher ?? "General"
}

function mapProduct(doc: ProductDocument): Product {
  const { rating, reviewCount } = parseRating(doc["Customer Reviews"])

  return {
    id: doc._id.toString(),
    title: doc.Title,
    description: doc.Description ?? "Descripción no disponible.",
    price: doc.price ?? 0,
    original_price: doc.original_price ?? null,
    image_url: doc.image_url ?? "/placeholder.svg",
    category: normalizeCategory(doc),
    rating,
    review_count: reviewCount,
    in_stock: doc.in_stock ?? true,
    url: doc.url,
    publisher: doc.Publisher,
    publication_date: doc["Publication date"],
    entities: doc.entities ?? [],
  }
}

export interface ProductFilters {
  search?: string
  category?: string | null
  minPrice?: number
  maxPrice?: number
  sort?: "relevance" | "price-low" | "price-high" | "rating"
}

function buildQuery(filters: ProductFilters): Filter<ProductDocument> {
  const query: Filter<ProductDocument> = {}

  if (filters.search) {
    const regex = new RegExp(filters.search, "i")
    query.$or = [
      { Title: regex },
      { Description: regex },
      { entities: regex },
      { Publisher: regex },
    ]
  }

  if (filters.category) {
    const regex = new RegExp(filters.category, "i")
    query.$or = query.$or
      ? [...(query.$or as Filter<ProductDocument>[]), { category: regex }, { entities: regex }]
      : [{ category: regex }, { entities: regex }]
  }

  if (typeof filters.minPrice === "number" || typeof filters.maxPrice === "number") {
    query.price = {}
    if (typeof filters.minPrice === "number") {
      query.price.$gte = filters.minPrice
    }
    if (typeof filters.maxPrice === "number") {
      query.price.$lte = filters.maxPrice
    }
  }

  return query
}

function buildSort(sort: ProductFilters["sort"]): Sort {
  switch (sort) {
    case "price-low":
      return { price: 1 }
    case "price-high":
      return { price: -1 }
    case "rating":
      return { rating: -1 }
    default:
      return { Title: 1 }
  }
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const productCollection = await getCollection<ProductDocument>(PRODUCTS_COLLECTION)
  const query = buildQuery(filters)
  const sort = buildSort(filters.sort)

  const docs = await productCollection.find(query).sort(sort).toArray()
  return docs.map(mapProduct)
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const productCollection = await getCollection<ProductDocument>(PRODUCTS_COLLECTION)

  let doc: ProductDocument | null = null

  if (ObjectId.isValid(id)) {
    doc = await productCollection.findOne({ _id: new ObjectId(id) })
  }

  if (!doc) {
    doc = await productCollection.findOne({ ASIN: id })
  }

  return doc ? mapProduct(doc) : null
}

export async function listFavorites(userId: string): Promise<string[]> {
  const favoritesCollection = await getCollection<FavoriteDocument>(FAVORITES_COLLECTION)
  const docs = await favoritesCollection.find({ userId }).toArray()
  return docs.map((doc) => doc.productId)
}

export async function isProductFavorited(userId: string, productId: string): Promise<boolean> {
  const favoritesCollection = await getCollection<FavoriteDocument>(FAVORITES_COLLECTION)
  const favorite = await favoritesCollection.findOne({ userId, productId })
  return Boolean(favorite)
}

export async function addFavorite(userId: string, productId: string) {
  const favoritesCollection = await getCollection<FavoriteDocument>(FAVORITES_COLLECTION)
  await favoritesCollection.updateOne(
    { userId, productId },
    { $setOnInsert: { userId, productId, createdAt: new Date() } },
    { upsert: true },
  )
}

export async function removeFavorite(userId: string, productId: string) {
  const favoritesCollection = await getCollection<FavoriteDocument>(FAVORITES_COLLECTION)
  await favoritesCollection.deleteOne({ userId, productId })
}
