import type { Product } from "@/lib/domain/product";
import type { ProductDocument } from "@/lib/mongo/client";

export function parseRating(raw?: string): {
  rating: number;
  reviewCount: number;
} {
  if (!raw) {
    return { rating: 0, reviewCount: 0 };
  }

  const ratingMatch = raw.match(/(\d+(\.\d+)?)/);
  const rating = ratingMatch ? Number.parseFloat(ratingMatch[1]) : 0;

  const reviewsMatch = raw.match(/(\d{1,3}(?:,\d{3})*|\d+)/g);
  let reviewCount = 0;
  if (reviewsMatch && reviewsMatch.length > 1) {
    const numeric = reviewsMatch
      .map((value) => Number.parseInt(value.replace(/,/g, ""), 10))
      .filter((value) => Number.isFinite(value));
    if (numeric.length > 1) {
      reviewCount = numeric[1];
    }
  }

  return { rating, reviewCount };
}

export function normalizeCategory(doc: ProductDocument): string {
  if (doc.category) {
    return doc.category;
  }

  if (doc.entities && doc.entities.length > 0) {
    return doc.entities[0];
  }

  return doc.Publisher ?? "General";
}

export function mapProduct(doc: ProductDocument): Product {
  const { rating, reviewCount } = parseRating(doc["Customer Reviews"]);

  return {
    id: (doc as any).id ?? doc._id.toString(),
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
  };
}

