"use client"

import { useState, useEffect } from "react"
import { VariantInput } from "@/lib/schema/variant"

type Props = {
  defaultValues?: VariantInput
  submitLabel: string
  onSubmit: (data: VariantInput) => Promise<void> | void
  onCancel: () => void
}

export default function VariantForm({
  defaultValues = {
    store: "",
    product: "",
    name: "",
    price: 0,
  },
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<VariantInput>(defaultValues)
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
    await onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {loadingStore ? (
        <p>Loading stores...</p>
      ) : storesError ? (
        <p className="text-red-500">{storesError}</p>
      ) : (
        <select
          className="border p-2 w-full"
          value={form.store}
          onChange={e => setForm({ ...form, store: e.target.value })}
        >
          <option value="">Select store</option>
          {stores.map(s => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      {loadingCategories ? (
        <p>Loading categories...</p>
      ) : categoriesError ? (
        <p className="text-red-500">{categoriesError}</p>
      ) : (
        <select
          className="border p-2 w-full"
          value={form.product}
          onChange={e => setForm({ ...form, product: e.target.value })}
        >
          <option value="">Select product</option>
          {categories.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}

      <input
        className="border p-2 w-full"
        placeholder="Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <input
        className="border p-2 w-full"
        type="number"
        placeholder="Price"
        value={form.price}
        onChange={e =>
          setForm({ ...form, price: Number(e.target.value) })
        }
      />

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 border"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1 bg-black text-white"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
