import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"
import { variantSchema } from "@/lib/schema/variant"

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
    id: item.store_product_id,
    store: item.store_name,
    product: item.product_name,
    name: item.variant_name,
    price: item.price,
  }))

  return NextResponse.json(mappedData)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = variantSchema.parse(body)

    // cari store_id berdasarkan store_name
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("store_id")
      .eq("store_name", data.store)
      .single()

    if (storeError) {
      return NextResponse.json(
        { message: "Store not found for given store name" },
        { status: 404 }
      )
    }

    // cari product_id berdasarkan product_name
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("product_id")
      .eq("product_name", data.product)
      .single()

    if (productError) {
      // kalau tidak ketemu biasanya error dari .single()
      return NextResponse.json(
        { message: "Product not found for given product name" },
        { status: 404 }
      )
    }

    const { data: newVariant, error } = await supabase
      .from("product_variants")
      .insert({
        variant_name: data.name,
        product_id: product.product_id,
      })
      .select(`
        variant_id,
        variant_name,
        product_id,
        products!inner (
          product_name
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    // 2) insert price per store
    const { data: newStorePrice, error: priceErr } = await supabase
      .from("store_product_prices")
      .insert({
        store_id: store.store_id,              // <-- pastikan kamu punya ini
        variant_id: newVariant.variant_id,    // <-- dari insert pertama
        price: data.price,                    // atau data.store_price
        currency: "IDR",
      })
      .select(`
        store_product_id,
        store_id,
        stores!inner (
          store_name
        ),
        variant_id,
        price,
        currency
      `)
      .single()

    if (priceErr) {
      // optional: rollback variant (kalau kamu pengen bersih)
      // await supabase.from("product_variants").delete().eq("variant_id", newVariant.variant_id)

      return NextResponse.json({ message: priceErr.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        id: newVariant.variant_id,
        product: newVariant.products?.[0]?.product_name || data.product,
        store: newStorePrice.stores?.[0]?.store_name || data.store,
        name: newVariant.variant_name,
        // kamu bisa balikin harga dari store_product_prices biar sumbernya jelas
        price: newStorePrice.price,
        currency: newStorePrice.currency,
        store_product_id: newStorePrice.store_product_id,
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
