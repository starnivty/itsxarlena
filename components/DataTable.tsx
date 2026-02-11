"use client"

type Column<T> = {
  key: keyof T
  label: string
}

type Props<T> = {
  columns: Column<T>[]
  data: T[]
  onEdit?: (row: T) => void
}

export default function DataTable<T extends { id: number }>({
  columns,
  data,
  onEdit,
}: Props<T>) {
  return (
    <table className="w-full border bg-white">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={String(col.key)} className="p-2 text-left">
              {col.label}
            </th>
          ))}
          <th className="p-2">Action</th>
        </tr>
      </thead>

      <tbody>
        {data.map(row => (
          <tr key={row.id} className="border-t">
            {columns.map(col => (
              <td key={String(col.key)} className="p-2">
                {String(row[col.key])}
              </td>
            ))}
            <td className="p-2">
              <button
                onClick={() => onEdit?.(row)}
                className="text-blue-600"
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
