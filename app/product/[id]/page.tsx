export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/product-detail-view";
import { requireUser } from "@/lib/server/auth";
import { fetchProductById, isProductFavorited } from "@/lib/server/products";
import React from "react";

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const user = await requireUser();
  console.log("ProductPage params:", params);
  const product = await fetchProductById(await params.id);

  if (!product) {
    notFound();
  }

  const isFavorited = await isProductFavorited(user.uid, product.id);

  return (
    <ProductDetailView
      product={product}
      userId={user.uid}
      isFavorited={isFavorited}
    />
  );
}
