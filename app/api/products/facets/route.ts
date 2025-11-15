export const runtime = "nodejs"

import { ok, serverError } from "@/lib/server/api"
import { getCollection, type ProductDocument } from "@/lib/mongo/client"

const PRODUCTS_COLLECTION = process.env.MONGODB_PRODUCTS_COLLECTION ?? "documents"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") ?? undefined

  const productCollection = await getCollection<ProductDocument>(PRODUCTS_COLLECTION)

  try {
    const indexName = process.env.MONGODB_ATLAS_SEARCH_INDEX ?? "default"

    const operator = search
      ? { text: { query: search, path: ["Title", "Description", "entities", "Publisher"] } }
      : { exists: { path: "Title" } }

    const pipeline: any[] = [
      {
        $searchMeta: {
          index: indexName,
          facet: {
            operator,
            facets: {
              publisher: { type: "string", path: "Publisher" },
              language: { type: "string", path: "Language" },
              edition: { type: "string", path: "Edition" },
              pubDate: { type: "date", path: "Publication date", granularity: "year" },
            },
          },
        },
      },
    ]

    const [meta] = (await productCollection.aggregate(pipeline).toArray()) as any[]
    const raw = meta?.facet ?? { count: 0, facets: {} }

    const normalize = (b?: Array<{ _id?: any; value?: any; count: number }>) =>
      (b ?? []).map((x) => ({ value: (x.value ?? x._id) as string, count: x.count }))

    const facets = {
      count: raw.count ?? 0,
      facets: {
        publisher: raw.facets?.publisher ? { buckets: normalize(raw.facets.publisher.buckets) } : undefined,
        language: raw.facets?.language ? { buckets: normalize(raw.facets.language.buckets) } : undefined,
        edition: raw.facets?.edition ? { buckets: normalize(raw.facets.edition.buckets) } : undefined,
        pubDate: raw.facets?.pubDate ? { buckets: normalize(raw.facets.pubDate.buckets) } : undefined,
      },
    }

    return ok({ facets })
  } catch (error) {
    const match: any = {}

    if (search) {
      const regex = new RegExp(search, "i")
      match.$or = [{ Title: regex }, { Description: regex }, { entities: regex }, { Publisher: regex }]
    }

    try {
      const stringFacet = async (path: string) => {
        const pipeline = [
          { $match: match },
          { $group: { _id: `$${path}`, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 },
        ]
        const rows = (await productCollection.aggregate(pipeline).toArray()) as Array<{ _id: string; count: number }>
        return rows.map((r) => ({ value: r._id, count: r.count }))
      }

      const dateFacet = async () => {
        const pipeline = [
          { $match: match },
          { $addFields: { _pubDateStr: "$Publication date" } },
          {
            $addFields: {
              _pubDate: {
                $dateFromString: { dateString: "$_pubDateStr", onError: null, onNull: null },
              },
            },
          },
          { $match: { _pubDate: { $ne: null } } },
          { $addFields: { _year: { $year: "$_pubDate" } } },
          { $group: { _id: "$_year", count: { $sum: 1 } } },
          { $sort: { _id: -1 } },
          { $limit: 20 },
        ]
        const rows = (await productCollection.aggregate(pipeline).toArray()) as Array<{ _id: number; count: number }>
        return rows.map((r) => ({ value: String(r._id), count: r.count }))
      }

      const [publisher, language, edition, pubDate] = await Promise.all([
        stringFacet("Publisher"),
        stringFacet("Language"),
        stringFacet("Edition"),
        dateFacet(),
      ])

      return ok({
        facets: {
          count: 0,
          facets: {
            publisher: { buckets: publisher },
            language: { buckets: language },
            edition: { buckets: edition },
            pubDate: { buckets: pubDate },
          },
        },
      })
    } catch (fallbackError) {
      console.error("[products/facets] Error computing facets:", error, fallbackError)
      return serverError("Error al obtener facetas de productos")
    }
  }
}
