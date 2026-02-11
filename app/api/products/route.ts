import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"
import { productSchema } from "@/lib/schema/product"

export async function GET() {
  const { data, error } = await supabase
  .from("product_variants_view")
  .select("*")
  
  // console.log(data)

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }

  const mappedData = data.map((item) => ({
    id: item.variant_id,
    category: item.category,
    name: item.variant_name,
    price: item.price,
    stock: item.stock,
  }))

  return NextResponse.json(mappedData)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = productSchema.parse(body)

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("product_id")
      .eq("product_name", data.category)
      .single()

    if (productError) {
      // kalau tidak ketemu biasanya error dari .single()
      return NextResponse.json(
        { message: "Product not found for given category/name" },
        { status: 404 }
      )
    }

    const { data: newVariant, error } = await supabase
      .from("product_variants")
      .insert({
        variant_name: data.name,
        price: data.price,
        stock: data.stock,
        product_id: product.product_id,
      })
      .select(`
        variant_id,
        variant_name,
        price,
        stock,
        product_id,
        products!inner (
          product_name
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        id: newVariant.variant_id,
        category: newVariant.products?.[0]?.product_name || data.category,
        name: newVariant.variant_name,
        price: newVariant.price,
        stock: newVariant.stock,
      },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { message: err.errors?.[0]?.message ?? "Invalid input" },
      { status: 400 }
    )
  }
}
