"use client"

export default function AdminDashboard() {
  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <div className="p-4 text-black">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <button onClick={logout} className="border p-2 rounded mt-4">
        Logout
      </button>
    </div>
  )
}
