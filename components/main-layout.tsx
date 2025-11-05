"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ProductGrid } from "./product-grid"
import { FilterSidebar } from "./filter-sidebar"
import { SearchBar } from "./search-bar"
import { Button } from "./ui/button"

interface MainLayoutProps {
  user: User
}

export function MainLayout({ user }: MainLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [sortBy, setSortBy] = useState("relevance")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white font-bold">
              🛒
            </div>
            <h1 className="text-2xl font-bold text-slate-900">MercadoTech</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              Bienvenido, <span className="font-semibold">{user.email}</span>
            </div>
            <Button
              onClick={handleLogout}
              disabled={isLoading}
              variant="outline"
              className="border-slate-200 bg-transparent"
            >
              {isLoading ? "Cerrando..." : "Cerrar Sesión"}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar productos..." />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex gap-6 px-6 py-6">
        {/* Sidebar Filters */}
        <FilterSidebar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Products Grid */}
        <ProductGrid
          searchQuery={searchQuery}
          category={selectedCategory}
          priceRange={priceRange}
          sortBy={sortBy}
          userId={user.id}
        />
      </div>
    </div>
  )
}
