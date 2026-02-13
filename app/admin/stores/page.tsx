"use client"

import { useEffect, useState } from "react"
import {
  getStores,
  createStore,
  updateStore,
  deleteStore,
  Store
} from "@/lib/api/stores"
import { StoreInput } from "@/lib/schema/store"
import CreateStoreModal from "@/components/CreateStoreModal"
import EditStoreModal from "@/components/EditStoreModal"

const ITEMS_PER_PAGE = 5

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Store | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // =============================
  // INITIAL FETCH
  // =============================
  useEffect(() => {
    getStores()
      .then(setStores)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // =============================
  // OPTIMISTIC CREATE
  // =============================
  async function handleCreate(data: StoreInput) {
    const tempId = Date.now()

    const cleanData = {
      ...data,
      pricelist_url: data.pricelist_url || ""
    }

    const optimistic: Store = {
      id: tempId,
      ...cleanData
    }

    // 1️⃣ optimistic add
    setStores(prev => [...prev, optimistic])

    try {
      const created = await createStore(cleanData)

      // 2️⃣ replace temp with real
      setStores(prev =>
        prev.map(p => (p.id === tempId ? created : p))
      )
    } catch (e: any) {
      // 3️⃣ rollback
      setStores(prev => prev.filter(p => p.id !== tempId))
      alert(e.message)
    }
  }

  // =============================
  // OPTIMISTIC UPDATE
  // =============================
  async function handleUpdate(id: number, data: StoreInput) {
    const previous = stores

    const cleanData = {
      ...data,
      pricelist_url: data.pricelist_url || ""
    }

    // 1️⃣ optimistic update
    setStores(prev =>
      prev.map(p =>
        p.id === id ? { ...p, ...cleanData } : p
      )
    )

    try {
      const updated = await updateStore(id, cleanData)

      // 2️⃣ sync server result
      setStores(prev =>
        prev.map(p => (p.id === updated.id ? updated : p))
      )
    } catch (e: any) {
      // 3️⃣ rollback
      setStores(previous)
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
    if (selected.size === stores.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(stores.map(p => p.id as number)))
    }
  }
  // =============================
  // OPTIMISTIC DELETE (SINGLE)
  // =============================
  async function handleDelete(id: number) {
    if (!confirm("Delete this store?")) return

    const previous = stores

    // 1️⃣ optimistic remove
    setStores(prev => prev.filter(p => p.id !== id))

    try {
      await deleteStore(id)
    } catch (e: any) {
      // 2️⃣ rollback
      setStores(previous)
      alert(e.message)
    }
  }

  // =============================
  // OPTIMISTIC DELETE (BULK)
  // =============================
  async function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} store(s)? This cannot be undone.`)) return

    const previous = stores
    const idsToDelete = Array.from(selected)

    // 1️⃣ optimistic remove
    setStores(prev => prev.filter(p => !selected.has(p.id as number)))
    setSelected(new Set())

    try {
      // 2️⃣ delete all selected
      await Promise.all(idsToDelete.map(id => deleteStore(id)))
    } catch (e: any) {
      // 3️⃣ rollback
      setStores(previous)
      alert(e.message)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-red-500">{error}</p>

  // =============================
  // SEARCH & PAGINATION
  // =============================
  const filtered = stores.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.admin_wa.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedStores = filtered.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1)
  }

  return (
    <div className="space-y-4 text-black">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-xl font-semibold">Stores</h1>
        <input
          type="text"
          placeholder="Search by name..."
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
            Add Store
          </button>
        </div>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2 text-center w-10">
              <input
                type="checkbox"
                checked={selected.size === stores.length && stores.length > 0}
                onChange={toggleSelectAll}
                className="cursor-pointer"
              />
            </th>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Admin WA</th>
            <th className="border p-2 text-left">Pricelist Url</th>
            <th className="border p-2" />
          </tr>
        </thead>
        <tbody>
          {paginatedStores.map(p => (
            <tr key={p.id}>
              <td className="border p-2">
                <input
                  type="checkbox"
                  checked={selected.has(p.id as number)}
                  onChange={() => toggleSelect(p.id as number)}
                  className="cursor-pointer"
                />
              </td>
              <td className="border p-2">{p.name}</td> 
              <td className="border p-2">{p.admin_wa}</td>
              <td className="border p-2">{p.pricelist_url}</td>
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
            Showing {paginatedStores.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filtered.length)} of {filtered.length}
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
        <CreateStoreModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}

      {/* EDIT MODAL */}
      {editing && (
        <EditStoreModal
          store={editing}
          onClose={() => setEditing(null)}
          onSubmit={data => handleUpdate(editing.id, data)}
        />
      )}
    </div>
  )
}