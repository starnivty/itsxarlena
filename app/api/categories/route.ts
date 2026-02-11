import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"

export async function GET() {
  const { data, error } = await supabase
    .from("product_view")
    .select("product_name")

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }

  const mappedData = data.map((item) => ({
    category: item.product_name,
  }))

  // ambil unique category
  const categories = Array.from(
    new Set(mappedData.map(item => item.category))
  )

  return NextResponse.json(categories)
}
