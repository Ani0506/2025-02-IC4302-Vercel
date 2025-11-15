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

export interface FacetFilters {
  publisher: string[]
  language: string[]
  edition: string[]
  pubYears: string[]
}

export interface ProductFilters {
  search?: string
  facets?: {
    pubDateTo: string
    pubDateFrom: string
    publisher?: string[]
    language?: string[]
    edition?: string[]
    pubYears?: string[]
  }
}

