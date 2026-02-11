"use client"

import { useState } from "react"
import { Store } from "@/lib/api/stores"
import { StoreInput } from "@/lib/schema/store"

interface Props {
  store: Store
  onClose: () => void
  onSubmit: (data: StoreInput) => Promise<void>
}

export default function EditStoreModal({ store, onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState<StoreInput>({
    name: store.name,
    admin_wa: store.admin_wa,
    pricelist_url: store.pricelist_url,
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error("Failed to update store:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-lg font-bold mb-4">Edit Store</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Admin WA</label>
            <input
              type="text"
              value={formData.admin_wa}
              onChange={e => setFormData({ ...formData, admin_wa: e.target.value })}
              className="w-full border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pricelist URL</label>
            <input
              type="text"
              value={formData.pricelist_url}
              onChange={e => setFormData({ ...formData, pricelist_url: e.target.value })}
              className="w-full border px-3 py-2"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 bg-black text-white disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}