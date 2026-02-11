"use client"

import { useState, useEffect } from "react"
import { ProductInput } from "@/lib/schema/product"

type Props = {
  defaultValues?: ProductInput
  submitLabel: string
  onSubmit: (data: ProductInput) => Promise<void> | void
  onCancel: () => void
}

export default function ProductForm({
  defaultValues = {
    category: "",
    name: "",
    price: 0,
    stock: 0,
  },
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<ProductInput>(defaultValues)
  const [categories, setCategories] = useState<string[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

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
      {loadingCategories ? (
        <p>Loading categories...</p>
      ) : categoriesError ? (
        <p className="text-red-500">{categoriesError}</p>
      ) : (
        <select
          className="border p-2 w-full"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
        >
          <option value="">Select category</option>
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

      <input
        className="border p-2 w-full"
        type="number"
        placeholder="Stock"
        value={form.stock}
        onChange={e =>
          setForm({ ...form, stock: Number(e.target.value) })
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
