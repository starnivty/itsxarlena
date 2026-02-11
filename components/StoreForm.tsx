"use client"

import { useState, useEffect } from "react"
import { StoreInput } from "@/lib/schema/store"

type Props = {
  defaultValues?: StoreInput
  submitLabel: string
  onSubmit: (data: StoreInput) => Promise<void> | void
  onCancel: () => void
}

export default function StoreForm({
  defaultValues = {
    name: "",
    admin_wa: "",
    pricelist_url: "",
  },
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<StoreInput>(defaultValues)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        className="border p-2 w-full"
        placeholder="Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <input
        className="border p-2 w-full"
        placeholder="Admin WA"
        value={form.admin_wa}
        onChange={e => setForm({ ...form, admin_wa: e.target.value })}
      />

      <input
        className="border p-2 w-full"
        placeholder="Pricelist URL"
        value={form.pricelist_url}
        onChange={e => setForm({ ...form, pricelist_url: e.target.value })}
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
