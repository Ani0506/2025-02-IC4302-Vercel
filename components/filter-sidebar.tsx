"use client";

import { useEffect, useState } from "react";

type FacetBucket = { value: string; count: number };
interface FacetResponse {
  facets: {
    count: number;
    facets: {
      publisher?: { buckets: FacetBucket[] };
      language?: { buckets: FacetBucket[] };
      edition?: { buckets: FacetBucket[] };
      pubDate?: { buckets: { value: string; count: number }[] };
    };
  };
}

interface SelectedFacets {
  publisher: string[];
  language: string[];
  edition: string[];
  pubYears: string[];
}

interface FilterSidebarProps {
  searchQuery: string;
  selected: SelectedFacets;
  onChange: (next: SelectedFacets) => void;
}

export function FilterSidebar({
  searchQuery,
  selected,
  onChange,
}: FilterSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [facets, setFacets] = useState<FacetResponse["facets"] | null>(null);

  useEffect(() => {
    let active = true;
    const fetchFacets = async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams();
        if (searchQuery) qs.set("search", searchQuery);
        const res = await fetch(`/api/products/facets?${qs.toString()}`);
        if (!res.ok) throw new Error("No se pudieron cargar los filtros");
        const data = (await res.json()) as FacetResponse;
        if (active) {
          setFacets(data.facets);
        }
      } catch (e) {
        if (active) setFacets({ count: 0, facets: {} } as any);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchFacets();
    return () => {
      active = false;
    };
  }, [searchQuery]);

  const toggle = (
    key: keyof SelectedFacets,
    value: string,
    nextChecked: boolean,
    allValues: string[]
  ) => {
    const current = (selected[key] as string[]) ?? [];
    // "all selected" mode: empty array means no filter (visually all checked)
    if (current.length === 0) {
      if (!nextChecked) {
        // Transition from ALL -> specific selection (all minus the unchecked one)
        const nextArr = allValues.filter((v) => v !== value);
        onChange({ ...selected, [key]: nextArr });
      } else {
        // Staying in ALL mode, no-op
        onChange({ ...selected });
      }
      return;
    }

    // Specific selection mode
    if (nextChecked) {
      if (!current.includes(value)) {
        const candidate = [...current, value];
        // If user checked back to include all visible values, collapse to ALL (empty array)
        const isAll =
          allValues.length > 0 && allValues.every((v) => candidate.includes(v));
        onChange({ ...selected, [key]: isAll ? [] : candidate });
      } else {
        // Already included, no change
        onChange({ ...selected });
      }
    } else {
      const nextArr = current.filter((v) => v !== value);
      onChange({ ...selected, [key]: nextArr });
    }
  };

  const clearAll = () => {
    onChange({ publisher: [], language: [], edition: [], pubYears: [] });
  };

  const renderFacet = (
    label: string,
    key: keyof SelectedFacets,
    buckets?: FacetBucket[]
  ) => (
    <div className="mb-6 border-b border-slate-200 pb-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">{label}</h3>
      <div className="space-y-2">
        {(buckets ?? []).map((b) => (
          <label
            key={b.value}
            className="flex cursor-pointer items-center gap-3"
          >
            <input
              type="checkbox"
              checked={
                (selected[key] as string[]).length === 0 ||
                (selected[key] as string[]).includes(b.value)
              }
              onChange={(e) =>
                toggle(
                  key,
                  b.value,
                  e.target.checked,
                  (buckets ?? []).map((x) => x.value)
                )
              }
              className="cursor-pointer"
            />
            <span className="text-sm text-slate-700">
              {b.value} ({b.count})
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-64 shrink-0">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Filtros</h2>
          {selected.publisher.length ||
          selected.language.length ||
          selected.edition.length ||
          selected.pubYears.length ? (
            <button
              onClick={clearAll}
              className="text-xs text-green-600 hover:text-green-700 font-medium"
            >
              Limpiar
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="text-sm text-slate-500">Cargando filtros...</div>
        ) : (
          <>
            {renderFacet(
              "Editorial",
              "publisher",
              facets?.facets.publisher?.buckets as any
            )}
            {renderFacet(
              "Idioma",
              "language",
              facets?.facets.language?.buckets as any
            )}
            {renderFacet(
              "Año de publicación",
              "pubYears",
              facets?.facets.pubDate?.buckets as any
            )}
          </>
        )}
      </div>
    </div>
  );
}
