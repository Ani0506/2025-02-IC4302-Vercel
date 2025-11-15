"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductGrid } from "./product-grid";
import { FilterSidebar } from "./filter-sidebar";
import { SearchBar } from "./search-bar";
import { Button } from "./ui/button";
import { signOutCurrentUser } from "@/lib/firebase/auth";
import type { AuthenticatedUser } from "@/lib/server/auth";

interface MainLayoutProps {
  user: AuthenticatedUser;
}

export function MainLayout({ user }: MainLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFacets, setSelectedFacets] = useState({
    publisher: [] as string[],
    language: [] as string[],
    edition: [] as string[],
    pubYears: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/session", { method: "DELETE" });
      await signOutCurrentUser();
      router.replace("/auth/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white font-bold">
              MT
            </div>
            <h1 className="text-2xl font-bold text-slate-900">MercadoTech</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              Bienvenido,{" "}
              <span className="font-semibold">{user.email ?? "Invitado"}</span>
            </div>
            <Button
              onClick={handleLogout}
              disabled={isLoading}
              variant="outline"
              className="border-slate-200 bg-transparent"
            >
              {isLoading ? "Cerrando..." : "Cerrar sesión"}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar productos..."
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex gap-6 px-6 py-6">
        {/* Sidebar Filters */}
        <FilterSidebar
          searchQuery={searchQuery}
          selected={selectedFacets}
          onChange={setSelectedFacets}
        />

        {/* Products Grid */}
        <ProductGrid
          searchQuery={searchQuery}
          facets={selectedFacets}
          userId={user.uid}
        />
      </div>
    </div>
  );
}
