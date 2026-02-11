import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  return NextResponse.json({ slug: params.slug })
}
