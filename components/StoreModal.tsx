"use client"

import { useState, useEffect } from "react"
import { Store } from "@/lib/dummyStores"

type Props = {
  open: boolean
  onClose: () => void
  onSave: (store: Store) => void
  initialData?: Store | null
}

export default function StoreModal({
  open,
  onClose,
  onSave,
  initialData,
}: Props) {
  const [form, setForm] = useState<Store>({
    id: 0,
    name: "",
    owner: "",
    products: 0,
  })

  // Kalau edit, isi form
  useEffect(() => {
    if (initialData) {
      setForm(initialData)
    } else {
      setForm({
        id: 0,
        name: "",
        owner: "",
        products: 0,
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
          {initialData ? "Edit Store" : "Add Store"}
        </h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Owner"
          value={form.owner}
          onChange={e => setForm({ ...form, owner: e.target.value })}
        />

        <input
          type="number"
          className="border p-2 w-full mb-2"
          placeholder="Products"
          value={form.products}
          onChange={e =>
            setForm({ ...form, products: Number(e.target.value) })
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
