"use client"

const CATEGORIES = [
  "Electrónica",
  "Audio",
  "Móviles",
  "Fotografía",
  "Accesorios",
  "Tablets",
  "Almacenamiento",
  "Redes",
  "Wearables",
]

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevancia" },
  { value: "price-low", label: "Precio: Menor a Mayor" },
  { value: "price-high", label: "Precio: Mayor a Menor" },
  { value: "rating", label: "Mejor Valorado" },
]

interface FilterSidebarProps {
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  priceRange: [number, number]
  onPriceChange: (range: [number, number]) => void
  sortBy: string
  onSortChange: (sort: string) => void
}

export function FilterSidebar({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  sortBy,
  onSortChange,
}: FilterSidebarProps) {
  return (
    <div className="w-64 flex-shrink-0">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {/* Clear Filters */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Filtros</h2>
          {selectedCategory || priceRange[0] > 0 || priceRange[1] < 5000 ? (
            <button
              onClick={() => {
                onCategoryChange(null)
                onPriceChange([0, 5000])
                onSortChange("relevance")
              }}
              className="text-xs text-green-600 hover:text-green-700 font-medium"
            >
              Limpiar
            </button>
          ) : null}
        </div>

        {/* Sorting */}
        <div className="mb-6 border-b border-slate-200 pb-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Ordenar por</h3>
          <div className="space-y-2">
            {SORT_OPTIONS.map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={sortBy === option.value}
                  onChange={() => onSortChange(option.value)}
                  className="cursor-pointer"
                />
                <span className="text-sm text-slate-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6 border-b border-slate-200 pb-4">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Precio</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-2 block text-xs text-slate-600">Mínimo: ${priceRange[0]}</label>
              <input
                type="range"
                min="0"
                max="5000"
                value={priceRange[0]}
                onChange={(e) => onPriceChange([Number(e.target.value), priceRange[1]])}
                className="w-full"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs text-slate-600">Máximo: ${priceRange[1]}</label>
              <input
                type="range"
                min="0"
                max="5000"
                value={priceRange[1]}
                onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Categorías</h3>
          <div className="space-y-2">
            <button
              onClick={() => onCategoryChange(null)}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                selectedCategory === null
                  ? "bg-green-100 text-green-700 font-medium"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Todas
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  selectedCategory === category
                    ? "bg-green-100 text-green-700 font-medium"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
