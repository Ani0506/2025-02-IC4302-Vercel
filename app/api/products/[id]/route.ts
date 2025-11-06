import { NextResponse } from "next/server"

import { fetchProductById } from "@/lib/server/products"

interface RouteContext {
  params: {
    id: string
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const product = await fetchProductById(context.params.id)

  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
  }

  return NextResponse.json({ product })
}
