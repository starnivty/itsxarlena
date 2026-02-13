"use client"

import { useEffect, useState } from "react"
import {
  getVariants,
  createVariant,
  updateVariant,
  deleteVariant,
  Variant,
} from "@/lib/api/variants"
import { VariantInput } from "@/lib/schema/variant"
import CreateVariantModal from "@/components/CreateVariantModal"
import EditVariantModal from "@/components/EditVariantModal"

const ITEMS_PER_PAGE = 10

export default function VariantsPage() {
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Variant | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // =============================
  // INITIAL FETCH
  // =============================
  useEffect(() => {
    getVariants()
      .then(setVariants)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // =============================
  // OPTIMISTIC CREATE
  // =============================
  async function handleCreate(data: VariantInput) {
    const tempId = Date.now()

    const optimistic: Variant = {
      id: tempId,
      ...data
    }

    // 1️⃣ optimistic add
    setVariants(prev => [...prev, optimistic])

    try {
      const created = await createVariant(data)

      // 2️⃣ replace temp with real
      setVariants(prev =>
        prev.map(p => (p.id === tempId ? created : p))
      )
    } catch (e: any) {
      // 3️⃣ rollback
      setVariants(prev => prev.filter(p => p.id !== tempId))
      alert(e.message)
    }
  }

  // =============================
  // OPTIMISTIC UPDATE
  // =============================
  async function handleUpdate(id: number, data: VariantInput) {
    const previous = variants

    // 1️⃣ optimistic update
    setVariants(prev =>
      prev.map(p =>
        p.id === id ? { ...p, ...data } : p
      )
    )

    try {
      const updated = await updateVariant(id, data)

      // 2️⃣ sync server result
      setVariants(prev =>
        prev.map(p => (p.id === updated.id ? updated : p))
      )
    } catch (e: any) {
      // 3️⃣ rollback
      setVariants(previous)
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
    if (selected.size === variants.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(variants.map(p => p.id as number)))
    }
  }

  // =============================
  // OPTIMISTIC DELETE (SINGLE)
  // =============================
  async function handleDelete(id: number) {
    if (!confirm("Delete this variant?")) return

    const previous = variants

    // 1️⃣ optimistic remove
    setVariants(prev => prev.filter(p => p.id !== id))

    try {
      await deleteVariant(id)
    } catch (e: any) {
      // 2️⃣ rollback
      setVariants(previous)
      alert(e.message)
    }
  }

  // =============================
  // OPTIMISTIC DELETE (BULK)
  // =============================
  async function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} variant(s)? This cannot be undone.`)) return

    const previous = variants
    const idsToDelete = Array.from(selected)

    // 1️⃣ optimistic remove
    setVariants(prev => prev.filter(p => !selected.has(p.id as number)))
    setSelected(new Set())

    try {
      // 2️⃣ delete all selected
      await Promise.all(idsToDelete.map(id => deleteVariant(id)))
    } catch (e: any) {
      // 3️⃣ rollback
      setVariants(previous)
      alert(e.message)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-red-500">{error}</p>

  // =============================
  // SEARCH & PAGINATION
  // =============================
  const filtered = variants.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.product.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedVariants = filtered.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1)
  }

  return (
    <div className="space-y-4 text-black">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-xl font-semibold">Variants</h1>
        <input
          type="text"
          placeholder="Search by variant name or product name..."
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
            Add Variant
          </button>
        </div>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2 text-center w-10">
              <input
                type="checkbox"
                checked={selected.size === variants.length && variants.length > 0}
                onChange={toggleSelectAll}
                className="cursor-pointer"
              />
            </th>
            <th className="border p-2">Product</th>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Price</th>
            <th className="border p-2 text-left">Stock</th>
            <th className="border p-2" />
          </tr>
        </thead>
        <tbody>
          {paginatedVariants.map(p => (
            <tr key={p.id} className={selected.has(p.id as number) ? "bg-blue-50" : ""}>
              <td className="border p-2 text-center">
                <input
                  type="checkbox"
                  checked={selected.has(p.id as number)}
                  onChange={() => toggleSelect(p.id as number)}
                  className="cursor-pointer"
                />
              </td>
              <td className="border p-2">{p.product}</td>
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
            Showing {paginatedVariants.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filtered.length)} of {filtered.length}
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
        <CreateVariantModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}

      {/* EDIT MODAL */}
      {editing && (
        <EditVariantModal
          variant={editing}
          onClose={() => setEditing(null)}
          onSubmit={data => handleUpdate(editing.id, data)}
        />
      )}
    </div>
  )
}