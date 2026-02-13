"use client"

import { useState, useEffect } from "react"
import { Variant } from "@/lib/api/variants"
import { VariantInput } from "@/lib/schema/variant"

interface Props {
  variant: Variant
  onClose: () => void
  onSubmit: (data: VariantInput) => Promise<void>
}

export default function EditVariantModal({ variant, onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState<VariantInput>({
    store: variant.store,
    product: variant.product,
    name: variant.name,
    price: variant.price,
  })
  const [loading, setLoading] = useState(false)
  const [stores, setStores] = useState<{ id: string; name: string; admin_wa: string; pricelist_url: string }[]>([])
  const [loadingStore, setLoadingStore] = useState(false)
  const [storesError, setStoresError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoadingStore(true)
    fetch("/api/stores")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load stores")
        return res.json()
      })
      .then((data) => {
        if (mounted) setStores(data)
      })
      .catch(e => {
        if (mounted) setStoresError(e.message)
      })
      .finally(() => mounted && setLoadingStore(false))

    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    setLoadingCategories(true)
    fetch("/api/categories")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load categories")
        return res.json()
      })
      .then((data: string[]) => {
        if (mounted) setCategories(data)
      })
      .catch(e => {
        if (mounted) setCategoriesError(e.message)
      })
      .finally(() => mounted && setLoadingCategories(false))

    return () => { mounted = false }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error("Failed to update variant:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-lg font-bold mb-4">Edit Variant</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Store</label>
            {loadingStore ? (
              <p className="text-sm">Loading stores...</p>
            ) : storesError ? (
              <p className="text-red-500 text-sm">{storesError}</p>
            ) : (
              <select
                value={formData.store}
                onChange={e => setFormData({ ...formData, store: e.target.value })}
                className="w-full border px-3 py-2"
                required
              >
                <option value="">Select store</option>
                {stores.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
            <label className="block text-sm font-medium mb-1 mt-3">Product</label>
            {loadingCategories ? (
              <p className="text-sm">Loading products...</p>
            ) : categoriesError ? (
              <p className="text-red-500 text-sm">{categoriesError}</p>
            ) : (
              <select
                value={formData.product}
                onChange={e => setFormData({ ...formData, product: e.target.value })}
                className="w-full border px-3 py-2"
                required
              >
                <option value="">Select product</option>
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
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
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="w-full border px-3 py-2"
              required
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