import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"
import { id } from "zod/locales"

export async function GET() {
  const { data, error } = await supabase
  .from("stores")
  .select("store_id, store_name, admin_wa, pricelist_url")
  
  // console.log(data)

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }

  const mappedData = data.map((item) => ({
    id: item.store_id,
    name: item.store_name,
    admin_wa: item.admin_wa,
    pricelist_url: item.pricelist_url,
  }))

  return NextResponse.json(mappedData)
}
