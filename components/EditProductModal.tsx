"use client"

import { useState } from "react"
import { Product } from "@/lib/api/products"
import { ProductInput } from "@/lib/schema/product"

interface Props {
  product: Product
  onClose: () => void
  onSubmit: (data: ProductInput) => Promise<void>
}

export default function EditProductModal({ product, onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState<ProductInput>({
    category: product.category,
    name: product.name,
    price: product.price,
    stock: product.stock
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error("Failed to update product:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-lg font-bold mb-4">Edit Product</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full border px-3 py-2"
              required
            />
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

          <div>
            <label className="block text-sm font-medium mb-1">Stock</label>
            <input
              type="number"
              value={formData.stock}
              onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
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