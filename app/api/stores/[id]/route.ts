import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"
import { storeSchema } from "@/lib/schema/store"

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const id = Number(url.pathname.split("/").pop())

  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 })
  }

  const { data: deleted, error } = await supabase
    .from("stores")        
    .delete()
    .eq("store_id", id)            
    .select(`
        store_id,
        store_name,
        admin_wa,
        pricelist_url
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
    const data = storeSchema.parse(body)

    const { data: updatedStore, error } = await supabase
      .from("stores")
      .update({
        store_name: data.name,
        admin_wa: data.admin_wa,
        pricelist_url: data.pricelist_url,
      })
      .eq("store_id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json(updatedStore)
  } catch (err: any) {
    return NextResponse.json(
      { message: err.errors?.[0]?.message ?? "Invalid input" },
      { status: 400 }
    )
  }
}

