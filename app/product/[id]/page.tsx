import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProductDetailView } from "@/components/product-detail-view"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Check authentication
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    redirect("/auth/login")
  }

  // Fetch product
  const { data: product, error: productError } = await supabase.from("products").select("*").eq("id", id).single()

  if (productError || !product) {
    redirect("/")
  }

  // Fetch favorite status
  const { data: favoriteData } = await supabase
    .from("favorites")
    .select("id")
    .eq("product_id", id)
    .eq("user_id", authData.user.id)
    .single()

  return <ProductDetailView product={product} userId={authData.user.id} isFavorited={!!favoriteData} />
}
