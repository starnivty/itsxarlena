"use client"

import { useState, useEffect } from "react"
import { Product } from "@/lib/dummyProducts"

type Props = {
  open: boolean
  onClose: () => void
  onSave: (product: Product) => void
  initialData?: Product | null
}

export default function ProductModal({
  open,
  onClose,
  onSave,
  initialData,
}: Props) {
  const [form, setForm] = useState<Product>({
    id: 0,
    name: "",
    price: 0,
    stock: 0,
  })

  // Kalau edit, isi form
  useEffect(() => {
    if (initialData) {
      setForm(initialData)
    } else {
      setForm({
        id: 0,
        name: "",
        price: 0,
        stock: 0,
      })
    }
  }, [initialData])

  if (!open) return null

  const submit = () => {
    onSave({
      ...form,
      id: form.id || Date.now(), // dummy ID
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-96 p-6 rounded">
        <h2 className="font-bold mb-4">
          {initialData ? "Edit Product" : "Add Product"}
        </h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="number"
          className="border p-2 w-full mb-2"
          placeholder="Price"
          value={form.price}
          onChange={e =>
            setForm({ ...form, price: Number(e.target.value) })
          }
        />

        <input
          type="number"
          className="border p-2 w-full mb-4"
          placeholder="Stock"
          value={form.stock}
          onChange={e =>
            setForm({ ...form, stock: Number(e.target.value) })
          }
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={submit}
            className="bg-blue-600 text-white px-4 py-1 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
