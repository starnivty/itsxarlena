import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { verifySignedSessionCookie } from "@/lib/admin-auth"

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // protect semua /admin kecuali /admin/logout (kalau kamu bikin page logout) - optional
  if (!pathname.startsWith("/admin")) return NextResponse.next()

  // kalau kamu punya halaman login di /login, biarkan
  // (login bukan /admin jadi aman)

  const secret = process.env.ADMIN_AUTH_SECRET
  if (!secret) {
    return new NextResponse("Server misconfigured", { status: 500 })
  }

  const cookie = req.cookies.get("admin_session")?.value
  if (!cookie) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  //if (!cookie) {
  //  const url = req.nextUrl.clone()
  //  url.pathname = "/login"
  //  url.searchParams.set("callbackUrl", pathname)
  //  return NextResponse.redirect(url)
  //}

  const session = await verifySignedSessionCookie(cookie, secret)
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  //if (!session) {
  //  const url = req.nextUrl.clone()
  //  url.pathname = "/login"
  //  url.searchParams.set("callbackUrl", pathname)
  //  url.searchParams.set("error", "SessionExpired")
  //  return NextResponse.redirect(url)
  //}

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
