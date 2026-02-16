export default function SubCategoriesPage() {
  return (
    <div className="space-y-4 text-black">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-xl font-semibold">Sub Categories</h1>
        <input
          type="text"
          placeholder="Search by name..."
          value=""
          className="px-3 py-1 border border-gray-300 rounded flex-1 max-w-xs"
        />
        <div className="space-x-2">
          <button className="px-3 py-1 bg-black text-white hover:bg-gray-800">
            Add Sub Category
          </button>
        </div>
      </div>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2 text-left">Category Name</th>
            <th className="border p-2 text-left">Sub-Category Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">Apps Prem</td>
            <td className="border p-2">ALIGHT MOTION</td> 
          </tr>
        </tbody>
      </table>
    </div>
  )
}
