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

    // 1) Resolve product_id dari "product" (nama product)
    // Ganti "name" sesuai kolom di tabel products kamu (misal: product_name, title, etc.)
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("product_id")
      .eq("product_name", data.product)
      .single()

    if (productError) {
      // kalau tidak ketemu biasanya error dari .single()
      return NextResponse.json(
        { message: "Variant not found for given product name" },
        { status: 404 }
      )
    }

    console.log("hasil data :", data)

    // 2) Update variant pakai product_id yang sudah ketemu
    const { data: updatedVariant, error } = await supabase
      .from("product_variants")
      .update({
        variant_name: data.name,
        price: data.price,
        product_id: product.product_id,
      })
      .eq("variant_id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json(updatedVariant)
  } catch (err: any) {
    return NextResponse.json(
      { message: err.errors?.[0]?.message ?? "Invalid input" },
      { status: 400 }
    )
  }
}

