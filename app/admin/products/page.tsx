"use client"

import { useEffect, useState } from "react"
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  Product
} from "@/lib/api/products"
import { ProductInput } from "@/lib/schema/product"
import CreateProductModal from "@/components/CreateProductModal"
import EditProductModal from "@/components/EditProductModal"

const ITEMS_PER_PAGE = 10

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // =============================
  // INITIAL FETCH
  // =============================
  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // =============================
  // OPTIMISTIC CREATE
  // =============================
  async function handleCreate(data: ProductInput) {
    const tempId = Date.now()

    const optimistic: Product = {
      id: tempId,
      ...data
    }

    // 1️⃣ optimistic add
    setProducts(prev => [...prev, optimistic])

    try {
      const created = await createProduct(data)

      // 2️⃣ replace temp with real
      setProducts(prev =>
        prev.map(p => (p.id === tempId ? created : p))
      )
    } catch (e: any) {
      // 3️⃣ rollback
      setProducts(prev => prev.filter(p => p.id !== tempId))
      alert(e.message)
    }
  }

  // =============================
  // OPTIMISTIC UPDATE
  // =============================
  async function handleUpdate(id: number, data: ProductInput) {
    const previous = products

    // 1️⃣ optimistic update
    setProducts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, ...data } : p
      )
    )

    try {
      const updated = await updateProduct(id, data)

      // 2️⃣ sync server result
      setProducts(prev =>
        prev.map(p => (p.id === updated.id ? updated : p))
      )
    } catch (e: any) {
      // 3️⃣ rollback
      setProducts(previous)
      alert(e.message)
    }
  }

  // =============================
  // OPTIMISTIC DELETE
  // =============================
  // =============================
  // CHECKBOX HANDLERS
  // =============================
  function toggleSelect(id: number) {
    setSelected(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  function toggleSelectAll() {
    if (selected.size === products.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(products.map(p => p.id as number)))
    }
  }

  // =============================
  // OPTIMISTIC DELETE (SINGLE)
  // =============================
  async function handleDelete(id: number) {
    if (!confirm("Delete this product?")) return

    const previous = products

    // 1️⃣ optimistic remove
    setProducts(prev => prev.filter(p => p.id !== id))

    try {
      await deleteProduct(id)
    } catch (e: any) {
      // 2️⃣ rollback
      setProducts(previous)
      alert(e.message)
    }
  }

  // =============================
  // OPTIMISTIC DELETE (BULK)
  // =============================
  async function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} product(s)? This cannot be undone.`)) return

    const previous = products
    const idsToDelete = Array.from(selected)

    // 1️⃣ optimistic remove
    setProducts(prev => prev.filter(p => !selected.has(p.id as number)))
    setSelected(new Set())

    try {
      // 2️⃣ delete all selected
      await Promise.all(idsToDelete.map(id => deleteProduct(id)))
    } catch (e: any) {
      // 3️⃣ rollback
      setProducts(previous)
      alert(e.message)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-red-500">{error}</p>

  // =============================
  // SEARCH & PAGINATION
  // =============================
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedProducts = filtered.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1)
  }

  return (
    <div className="space-y-4 text-black">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-xl font-semibold">Products</h1>
        <input
          type="text"
          placeholder="Search by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded flex-1 max-w-xs"
        />
        <div className="space-x-2">
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 text-white hover:bg-red-700"
            >
              Delete Selected ({selected.size})
            </button>
          )}
          <button
            onClick={() => setShowCreate(true)}
            className="px-3 py-1 bg-black text-white hover:bg-gray-800"
          >
            Add Product
          </button>
        </div>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2 text-center w-10">
              <input
                type="checkbox"
                checked={selected.size === products.length && products.length > 0}
                onChange={toggleSelectAll}
                className="cursor-pointer"
              />
            </th>
            <th className="border p-2">Category</th>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Price</th>
            <th className="border p-2 text-left">Stock</th>
            <th className="border p-2" />
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.map(p => (
            <tr key={p.id} className={selected.has(p.id as number) ? "bg-blue-50" : ""}>
              <td className="border p-2 text-center">
                <input
                  type="checkbox"
                  checked={selected.has(p.id as number)}
                  onChange={() => toggleSelect(p.id as number)}
                  className="cursor-pointer"
                />
              </td>
              <td className="border p-2">{p.category}</td>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.price}</td>
              <td className="border p-2">{p.stock}</td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => setEditing(p)}
                  className="underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-600 underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {paginatedProducts.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filtered.length)} of {filtered.length}
          </div>
          <div className="space-x-1 flex">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-2 py-1 rounded ${
                  currentPage === page
                    ? "bg-black text-white"
                    : "border border-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <CreateProductModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}

      {/* EDIT MODAL */}
      {editing && (
        <EditProductModal
          product={editing}
          onClose={() => setEditing(null)}
          onSubmit={data => handleUpdate(editing.id, data)}
        />
      )}
    </div>
  )
}