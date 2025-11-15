import type { Filter, Sort } from "mongodb";

import { ObjectId, getCollection, type ProductDocument } from "@/lib/mongo/client";
import type { Product, ProductFilters } from "@/lib/domain/product";
import { MONGODB_PRODUCTS_COLLECTION, MONGODB_ATLAS_SEARCH_INDEX } from "@/lib/config";
import { mapProduct } from "@/lib/server/products-mapping";

function buildQuery(filters: ProductFilters): Filter<ProductDocument> {
  const query: Filter<ProductDocument> = {};
  if (filters.search) {
    const regex = new RegExp(filters.search, "i");
    query.$or = [{ Title: regex }, { Description: regex }, { entities: regex }, { Publisher: regex }];
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
    ? (f.publisher as any[]).some((v) => typeof v === "string" && v.trim().length === 0)
    : false;

  if (pubs.length && hasEmptyPublisher) {
    andClauses.push({
      $or: [
        { Publisher: { $in: pubs } },
        { Publisher: { $exists: false } },
        { Publisher: "" },
      ],
    });
  } else if (pubs.length) {
    andClauses.push({ Publisher: { $in: pubs } });
  } else if (hasEmptyPublisher) {
    andClauses.push({
      $or: [{ Publisher: { $exists: false } }, { Publisher: "" }],
    });
  }
  if (langs.length) {
    andClauses.push({ Language: { $in: langs } });
  }
  if (eds.length) {
    andClauses.push({ Edition: { $in: eds } });
  }
  if (years.length) {
    const numericYears = years
      .map((v) => Number.parseInt(v, 10))
      .filter((v) => Number.isFinite(v));
    if (numericYears.length) {
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
            numericYears,
          ],
        },
      });
    }
  }

  if (!andClauses.length) return {};
  return { $and: andClauses } as any;
}

function buildSort(): Sort {
  return { _id: -1 };
}

export async function fetchProducts(filters: ProductFilters): Promise<Product[]> {
  const productCollection = await getCollection<ProductDocument>(MONGODB_PRODUCTS_COLLECTION);

  if (filters.search || filters.facets) {
    const indexName = MONGODB_ATLAS_SEARCH_INDEX;
    const must: any[] = [];
    const should: any[] = [];

    if (filters.search) {
      must.push({
        text: {
          query: filters.search,
          path: ["Title", "Description", "entities", "Publisher"],
        },
      });
    }

    if (filters.facets?.publisher && filters.facets.publisher.length) {
      const nonEmptyPublishers = filters.facets.publisher
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      if (nonEmptyPublishers.length) {
        must.push({
          text: {
            query: nonEmptyPublishers,
            path: "Publisher",
          },
        });
      }

      const hasEmptyPublisher = filters.facets.publisher.some((v) => v.trim().length === 0);
      if (hasEmptyPublisher) {
        should.push({
          compound: {
            should: [
              { exists: { path: "Publisher" } },
              {
                equals: {
                  path: "Publisher",
                  value: "",
                },
              },
            ],
            minimumShouldMatch: 1,
          },
        });
      }
    }

    if (filters.facets?.language && filters.facets.language.length) {
      const nonEmptyLanguages = filters.facets.language
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      if (nonEmptyLanguages.length) {
        must.push({
          text: {
            query: nonEmptyLanguages,
            path: "Language",
          },
        });
      }
    }

    if (filters.facets?.edition && filters.facets.edition.length) {
      const nonEmptyEditions = filters.facets.edition
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      if (nonEmptyEditions.length) {
        must.push({
          text: {
            query: nonEmptyEditions,
            path: "Edition",
          },
        });
      }
    }

    if (filters.facets?.pubYears && filters.facets.pubYears.length) {
      const numericYears = filters.facets.pubYears
        .map((year) => Number.parseInt(year, 10))
        .filter((year) => Number.isFinite(year));
      if (numericYears.length) {
        must.push({
          range: {
            path: "Publication date",
            gte: new Date(Math.min(...numericYears), 0, 1),
            lte: new Date(Math.max(...numericYears), 11, 31),
          },
        });
      }
    }

    if (must.length || should.length) {
      const pipeline: any[] = [
        {
          $search: {
            index: indexName,
            compound: {
              must: must.length ? must : undefined,
              should: should.length ? should : undefined,
            },
          },
        },
        {
          $sort: buildSort(),
        },
        {
          $limit: 60,
        },
      ];

      const docs = await productCollection.aggregate<ProductDocument>(pipeline).toArray();

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
    }
  }

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
  const productCollection = await getCollection<ProductDocument>(MONGODB_PRODUCTS_COLLECTION);

  let doc: ProductDocument | null = null;

  doc = await productCollection.findOne({ id } as any);

  if (!doc && ObjectId.isValid(id)) {
    doc = await productCollection.findOne({ _id: new ObjectId(id) });
  }

  if (!doc) {
    doc = await productCollection.findOne({ _id: id } as any);
  }

  if (!doc) {
    doc = await productCollection.findOne({ ASIN: id });
  }

  return doc ? mapProduct(doc) : null;
}
