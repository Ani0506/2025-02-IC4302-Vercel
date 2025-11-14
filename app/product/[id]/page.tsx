export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/product-detail-view";
import { requireUser } from "@/lib/server/auth";
import { fetchProductById, isProductFavorited } from "@/lib/server/products";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const user = await requireUser();
  const product = await fetchProductById(id);

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
