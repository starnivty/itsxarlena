// components/Sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const menu = [
  { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Stores", path: "/admin/stores" },
  { name: "Products", path: "/admin/products" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white p-4">
      <h1 className="text-lg font-bold mb-6">CMS</h1>

      <nav className="space-y-2">
        {menu.map(item => {
          const active = pathname.startsWith(item.path)

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-3 py-2 rounded
                ${active
                  ? "bg-gray-700"
                  : "hover:bg-gray-800"
                }`}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
