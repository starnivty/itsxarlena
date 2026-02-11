const te = new TextEncoder()
const td = new TextDecoder()

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  const base64 = btoa(binary)
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function base64UrlToBytes(base64url: string) {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((base64url.length + 3) % 4)
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function hmacSha256(message: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    te.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, te.encode(message))
  return new Uint8Array(sig)
}

export type AdminSession = {
  email: string
  role: "admin"
  exp: number
}

export async function createSignedSessionCookie(payload: AdminSession, secret: string) {
  const body = JSON.stringify(payload)
  const sigBytes = await hmacSha256(body, secret)
  return `${bytesToBase64Url(te.encode(body))}.${bytesToBase64Url(sigBytes)}`
}

export async function verifySignedSessionCookie(value: string, secret: string) {
  const [bodyB64, sigB64] = value.split(".")
  if (!bodyB64 || !sigB64) return null

  const body = td.decode(base64UrlToBytes(bodyB64))
  const expectedSig = await hmacSha256(body, secret)
  const expectedSigB64 = bytesToBase64Url(expectedSig)
  if (expectedSigB64 !== sigB64) return null

  let payload: AdminSession
  try {
    payload = JSON.parse(body)
  } catch {
    return null
  }

  if (!payload?.exp || Date.now() > payload.exp) return null
  if (payload.role !== "admin") return null
  return payload
}
