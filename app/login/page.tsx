"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const sp = useSearchParams()
  const callbackUrl = sp.get("callbackUrl") || "/admin/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setLoading(true)

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setErr(data?.error || "Login failed")
      return
    }

    window.location.href = callbackUrl
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-3 max-w-sm">
        <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded"
        />
        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
        />
        <button disabled={loading} className="border p-2 rounded">
            {loading ? "Logging in..." : "Login"}
        </button>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        </form>
    </div>
  )
}
