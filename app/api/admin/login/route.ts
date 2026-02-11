import { NextResponse } from "next/server"
import { createSignedSessionCookie } from "@/lib/admin-auth"

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}))

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const secret = process.env.ADMIN_AUTH_SECRET

  if (!adminEmail || !adminPassword || !secret) {
    return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 })
  }

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 })
  }

  const exp = Date.now() + 1000 * 60 * 60 * 12 // 12 jam
  const cookieValue = await createSignedSessionCookie({ email, role: "admin", exp }, secret)

  const res = NextResponse.json({ ok: true })
  res.cookies.set("admin_session", cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(exp),
  })
  return res
}
