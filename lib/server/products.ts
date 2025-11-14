import type { Filter, Sort } from "mongodb";

import {
  ObjectId,
  getCollection,
  type FavoriteDocument,
  type ProductDocument,
} from "@/lib/mongo/client";

const PRODUCTS_COLLECTION =
  process.env.MONGODB_PRODUCTS_COLLECTION ?? "documents";
const FAVORITES_COLLECTION =
  process.env.MONGODB_FAVORITES_COLLECTION ?? "favorites";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  image_url: string;
  category: string;
  rating: number;
  review_count: number;
  in_stock: boolean;
  url?: string;
  publisher?: string;
  publication_date?: string;
  entities?: string[];
}

function parseRating(raw?: string): { rating: number; reviewCount: number } {
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

function normalizeCategory(doc: ProductDocument): string {
  if (doc.category) {
    return doc.category;
  }

  if (doc.entities && doc.entities.length > 0) {
    return doc.entities[0];
  }

  return doc.Publisher ?? "General";
}

function mapProduct(doc: ProductDocument): Product {
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

export interface ProductFilters {
  search?: string;
  facets?: {
    pubDateTo: string;
    pubDateFrom: string;
    publisher?: string[];
    language?: string[];
    edition?: string[];
    pubYears?: string[];
  };
}

function buildQuery(filters: ProductFilters): Filter<ProductDocument> {
  // Fallback regex search only when Atlas Search is not used
  const query: Filter<ProductDocument> = {};
  if (filters.search) {
    const regex = new RegExp(filters.search, "i");
    query.$or = [
      { Title: regex },
      { Description: regex },
      { entities: regex },
      { Publisher: regex },
    ];
  }
  return query;
}

function buildFacetMatch(filters: ProductFilters): Filter<ProductDocument> {
  const f = filters.facets;
  if (!f) return {};
  const andClauses: any[] = [];
  const nonEmpty = (arr?: any[]) =>
    (arr ?? [])
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter((v) => v.length > 0);
  const pubs = nonEmpty(f.publisher);
  const langs = nonEmpty(f.language);
  const eds = nonEmpty(f.edition);
  const years = nonEmpty(f.pubYears);
  const hasEmptyPublisher = Array.isArray(f.publisher)
    ? (f.publisher as any[]).some(
        (v) => typeof v === "string" && v.trim().length === 0
      )
    : false;
  const hasEmptyLanguage = Array.isArray(f.language)
    ? (f.language as any[]).some(
        (v) => typeof v === "string" && v.trim().length === 0
      )
    : false;
  const hasEmptyEdition = Array.isArray(f.edition)
    ? (f.edition as any[]).some(
        (v) => typeof v === "string" && v.trim().length === 0
      )
    : false;

  if (pubs.length || hasEmptyPublisher) {
    const or: any[] = [];
    if (pubs.length) or.push({ Publisher: { $in: pubs } });
    if (hasEmptyPublisher) {
      or.push({ Publisher: { $exists: false } });
      or.push({ Publisher: null });
      or.push({ Publisher: "" });
    }
    andClauses.push({ $or: or });
  }
  if (langs.length || hasEmptyLanguage) {
    const or: any[] = [];
    if (langs.length) or.push({ Language: { $in: langs } });
    if (hasEmptyLanguage) {
      or.push({ Language: { $exists: false } });
      or.push({ Language: null });
      or.push({ Language: "" });
    }
    andClauses.push({ $or: or });
  }
  if (eds.length || hasEmptyEdition) {
    const or: any[] = [];
    if (eds.length) or.push({ Edition: { $in: eds } });
    if (hasEmptyEdition) {
      or.push({ Edition: { $exists: false } });
      or.push({ Edition: null });
      or.push({ Edition: "" });
    }
    andClauses.push({ $or: or });
  }
  if (years.length) {
    const yearNums = years
      .map((y) => Number.parseInt(y, 10))
      .filter((n) => Number.isFinite(n));
    if (yearNums.length) {
      andClauses.push({
        $expr: {
          $in: [
            {
              $year: {
                $dateFromString: {
                  dateString: "$Publication date",
                  onError: null,
                  onNull: null,
                },
              },
            },
            yearNums,
          ],
        },
      });
    }
  }

  const exprClauses: any[] = [];
  const hasFrom = Boolean(f.pubDateFrom);
  const hasTo = Boolean(f.pubDateTo);
  if (hasFrom || hasTo) {
    const fromDate = hasFrom ? new Date(f.pubDateFrom as string) : undefined;
    const toDate = hasTo ? new Date(f.pubDateTo as string) : undefined;
    if (hasFrom) {
      exprClauses.push({
        $gte: [
          {
            $dateFromString: {
              dateString: "$Publication date",
              onError: null,
              onNull: null,
            },
          },
          fromDate,
        ],
      });
    }
    if (hasTo) {
      exprClauses.push({
        $lte: [
          {
            $dateFromString: {
              dateString: "$Publication date",
              onError: null,
              onNull: null,
            },
          },
          toDate,
        ],
      });
    }
  }

  const out: any = {};
  if (andClauses.length) out.$and = andClauses;
  if (exprClauses.length) out.$expr = { $and: exprClauses };
  return out;
}

export async function fetchProducts(
  filters: ProductFilters = {}
): Promise<Product[]> {
  const productCollection = await getCollection<ProductDocument>(
    PRODUCTS_COLLECTION
  );

  const f0 = filters.facets;
  const hasRealFacets = Boolean(
    f0 &&
      ((Array.isArray(f0.publisher) &&
        f0.publisher.filter((v) => v && v.trim().length > 0).length > 0) ||
        (Array.isArray(f0.language) &&
          f0.language.filter((v) => v && v.trim().length > 0).length > 0) ||
        (Array.isArray(f0.edition) &&
          f0.edition.filter((v) => v && v.trim().length > 0).length > 0) ||
        (Array.isArray(f0.pubYears) &&
          f0.pubYears.filter((v) => v && v.trim().length > 0).length > 0))
  );
  const useAtlasSearch = Boolean(filters.search || hasRealFacets);

  if (useAtlasSearch) {
    try {
      const indexName = process.env.MONGODB_ATLAS_SEARCH_INDEX ?? "default";

      const filterClauses: any[] = [];
      const mustClauses: any[] = [];

      if (filters.search) {
        mustClauses.push({
          text: {
            query: filters.search,
            path: ["Title", "Description", "entities", "Publisher"],
            fuzzy: { maxEdits: 1 },
          },
        });
      }

      const f = filters.facets;
      const nonEmpty = (arr?: any[]) =>
        (arr ?? [])
          .map((v) => (typeof v === "string" ? v.trim() : ""))
          .filter((v) => v.length > 0);
      const pubs = nonEmpty(f?.publisher);
      const langs = nonEmpty(f?.language);
      const eds = nonEmpty(f?.edition);
      const years = nonEmpty(f?.pubYears);
      const hasEmptyPublisher = Array.isArray(f?.publisher)
        ? (f!.publisher as any[]).some(
            (v) => typeof v === "string" && v.trim().length === 0
          )
        : false;
      const hasEmptyLanguage = Array.isArray(f?.language)
        ? (f!.language as any[]).some(
            (v) => typeof v === "string" && v.trim().length === 0
          )
        : false;
      const hasEmptyEdition = Array.isArray(f?.edition)
        ? (f!.edition as any[]).some(
            (v) => typeof v === "string" && v.trim().length === 0
          )
        : false;

      if (pubs.length) {
        filterClauses.push({
          compound: {
            should: pubs.map((v) => ({
              text: { path: "Publisher", query: v },
            })),
            minimumShouldMatch: 1,
          },
        });
      }
      if (langs.length) {
        filterClauses.push({
          compound: {
            should: langs.map((v) => ({
              text: { path: "Language", query: v },
            })),
            minimumShouldMatch: 1,
          },
        });
      }
      if (eds.length) {
        filterClauses.push({
          compound: {
            should: eds.map((v) => ({ text: { path: "Edition", query: v } })),
            minimumShouldMatch: 1,
          },
        });
      }
      // Years by post-$match (compute year server-side)

      const compound: any = {};
      if (mustClauses.length) compound.must = mustClauses;
      if (filterClauses.length) compound.filter = filterClauses;

      const pipeline: any[] = [
        {
          $search: {
            index: indexName,
            ...(Object.keys(compound).length
              ? { compound }
              : { exists: { path: "Title" } }),
            highlight: { path: ["Title", "Description"] },
          },
        },
        { $addFields: { score: { $meta: "searchScore" } } },
        { $sort: { score: -1 } },
      ];

      // Post-filter for empty facet selections not expressible in $search
      const postAnd: any[] = [];
      if (pubs.length || hasEmptyPublisher) {
        const or: any[] = [];
        if (pubs.length) or.push({ Publisher: { $in: pubs } });
        if (hasEmptyPublisher) {
          or.push({ Publisher: { $exists: false } });
          or.push({ Publisher: null });
          or.push({ Publisher: "" });
        }
        if (or.length) postAnd.push({ $or: or });
      }
      if (langs.length || hasEmptyLanguage) {
        const or: any[] = [];
        if (langs.length) or.push({ Language: { $in: langs } });
        if (hasEmptyLanguage) {
          or.push({ Language: { $exists: false } });
          or.push({ Language: null });
          or.push({ Language: "" });
        }
        if (or.length) postAnd.push({ $or: or });
      }
      if (eds.length || hasEmptyEdition) {
        const or: any[] = [];
        if (eds.length) or.push({ Edition: { $in: eds } });
        if (hasEmptyEdition) {
          or.push({ Edition: { $exists: false } });
          or.push({ Edition: null });
          or.push({ Edition: "" });
        }
        if (or.length) postAnd.push({ $or: or });
      }
      if (years.length) {
        postAnd.push({
          $expr: {
            $in: [
              {
                $year: {
                  $dateFromString: {
                    dateString: "$Publication date",
                    onError: null,
                    onNull: null,
                  },
                },
              },
              years
                .map((y) => Number.parseInt(y, 10))
                .filter((n) => Number.isFinite(n)),
            ],
          },
        });
      }
      if (postAnd.length) pipeline.push({ $match: { $and: postAnd } });

      const docs = await productCollection
        .aggregate<ProductDocument>(pipeline)
        .toArray();

      // If Atlas Search returns results, use them.
      // If it returns 0 docs (for any reason), fall back method below.
      if (docs.length > 0) {
        return docs.map(mapProduct);
      }

      const facetMatch = buildFacetMatch(filters);
      const textMatch = buildQuery(filters);
      const combined: any = {
        ...textMatch,
        ...("$and" in facetMatch
          ? { $and: [...(textMatch.$and ?? []), ...(facetMatch.$and as any[])] }
          : {}),
        ...(facetMatch.$expr ? { $expr: facetMatch.$expr } : {}),
      };

      if (combined.$expr) {
        const alt = await productCollection
          .aggregate<ProductDocument>([{ $match: combined }])
          .toArray();
        return alt.map(mapProduct);
      }

      const alt = await productCollection.find(combined).toArray();
      return alt.map(mapProduct);
    } catch (err) {
      // Fall through to basic find if $search is unavailable — surface error for debugging
      // (don't rethrow so we keep fallback behavior)
      // eslint-disable-next-line no-console
      console.error(
        "Atlas Search aggregation failed, falling back to simple query:",
        err
      );
    }
  }

  // Fallback to simple find with regex when no search/facets
  const facetMatch = buildFacetMatch(filters);
  const textMatch = buildQuery(filters);
  const query = {
    ...textMatch,
    ...("$and" in facetMatch
      ? { $and: [...(textMatch.$and ?? []), ...(facetMatch.$and as any[])] }
      : {}),
    ...(facetMatch.$expr ? { $expr: facetMatch.$expr } : {}),
  } as any;

  if (query.$expr) {
    const docs = await productCollection
      .aggregate<ProductDocument>([{ $match: query }])
      .toArray();
    return docs.map(mapProduct);
  }
  const docs = await productCollection.find(query).toArray();
  return docs.map(mapProduct);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const productCollection = await getCollection<ProductDocument>(
    PRODUCTS_COLLECTION
  );

  let doc: ProductDocument | null = null;

  // First: explicit string 'id' field
  doc = await productCollection.findOne({ id } as any);

  if (!doc && ObjectId.isValid(id)) {
    doc = await productCollection.findOne({ _id: new ObjectId(id) });
  }

  if (!doc) {
    // Fallback: in case _id is stored as a string in the dataset
    doc = await productCollection.findOne({ _id: id } as any);
  }

  if (!doc) {
    doc = await productCollection.findOne({ ASIN: id });
  }

  return doc ? mapProduct(doc) : null;
}

export async function listFavorites(userId: string): Promise<string[]> {
  const favoritesCollection = await getCollection<FavoriteDocument>(
    FAVORITES_COLLECTION
  );
  const docs = await favoritesCollection.find({ userId }).toArray();
  return docs.map((doc) => doc.productId);
}

export async function isProductFavorited(
  userId: string,
  productId: string
): Promise<boolean> {
  const favoritesCollection = await getCollection<FavoriteDocument>(
    FAVORITES_COLLECTION
  );
  const favorite = await favoritesCollection.findOne({ userId, productId });
  return Boolean(favorite);
}

export async function addFavorite(userId: string, productId: string) {
  const favoritesCollection = await getCollection<FavoriteDocument>(
    FAVORITES_COLLECTION
  );
  await favoritesCollection.updateOne(
    { userId, productId },
    { $setOnInsert: { userId, productId, createdAt: new Date() } },
    { upsert: true }
  );
}

export async function removeFavorite(userId: string, productId: string) {
  const favoritesCollection = await getCollection<FavoriteDocument>(
    FAVORITES_COLLECTION
  );
  await favoritesCollection.deleteOne({ userId, productId });
}
