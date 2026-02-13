import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"
import { variantSchema } from "@/lib/schema/variant"

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const id = Number(url.pathname.split("/").pop())

  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 })
  }

  const { data: deleted, error } = await supabase
    .from("product_variants")        // atau "products"
    .delete()
    .eq("variant_id", id)            // ganti ke "id" kalau kolomnya id
    .select(`
      variant_id,
      variant_name,
      price,
      product_id,
      products ( product_name )
    `)
    .single()

  if (error) {
    // kalau tidak ketemu row, PostgREST kadang error juga kalau pakai .single()
    // jadi ini aman untuk dibalikin sebagai 400/404 tergantung kebutuhan
    return NextResponse.json({ message: error.message }, { status: 400 })
  }

  if (!deleted) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  return NextResponse.json(deleted)
}

export async function PUT(req: Request) {
  const url = new URL(req.url)
  const id = Number(url.pathname.split("/").pop())

  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 })
  }

  try {
    const body = await req.json()
    const data = variantSchema.parse(body)

    // 1) cari store_id berdasarkan store_name
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("store_id")
      .eq("store_name", data.store)
      .single()

    if (storeError || !store) {
      return NextResponse.json(
        { message: "Store not found for given store name" },
        { status: 404 }
      )
    }

    // 2) cari product_id berdasarkan product_name
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("product_id")
      .eq("product_name", data.product)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { message: "Product not found for given product name" },
        { status: 404 }
      )
    }

    // 3) cari variant_id berdasarkan variant_name
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("variant_id, variant_name, product_id")
      .eq("variant_name", data.name)
      .maybeSingle()

    if (variantError || !variant) {
      return NextResponse.json(
        { message: "Variant not found for given variant name" },
        { status: 404 }
      )
    }


    // 4) pastikan variant ada (biar 404 bener)
    const { data: existingVariant, error: existingErr } = await supabase
      .from("product_variants")
      .select("variant_id")
      .eq("variant_id", variant.variant_id)
      .single()

    if (existingErr || !existingVariant) {
      return NextResponse.json({ message: "Variant not found" }, { status: 404 })
    }

    // 5) update variant (TANPA price, karena price ada di store_product_prices)
    const { data: updatedVariant, error: variantErr } = await supabase
      .from("product_variants")
      .update({
        variant_name: data.name,
        product_id: product.product_id,
      })
      .eq("variant_id", variant.variant_id)
      .select(`
        variant_id,
        variant_name,
        product_id,
        products!inner (
          product_name
        )
      `)
      .single()

    if (variantErr || !updatedVariant) {
      return NextResponse.json(
        { message: variantErr?.message ?? "Failed to update variant" },
        { status: 400 }
      )
    }

    // 5) upsert price per store (butuh unique constraint di (store_id, variant_id))
    const { data: upsertedPrice, error: priceErr } = await supabase
      .from("store_product_prices")
      .upsert(
        {
          store_id: store.store_id,
          variant_id: updatedVariant.variant_id,
          price: data.price,
          currency: "IDR",
        },
        {
          onConflict: "store_id,variant_id",
        }
      )
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

    if (priceErr || !upsertedPrice) {
      return NextResponse.json(
        { message: priceErr?.message ?? "Failed to update store price" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        id: updatedVariant.variant_id,
        product: updatedVariant.products?.[0]?.product_name || data.product,
        store: upsertedPrice.stores?.[0]?.store_name || data.store,
        name: updatedVariant.variant_name,
        price: upsertedPrice.price,
        currency: upsertedPrice.currency,
        store_product_id: upsertedPrice.store_product_id,
      },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { message: err.errors?.[0]?.message ?? "Invalid input" },
      { status: 400 }
    )
  }
}


