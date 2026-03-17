import { SpecImporter } from '@/components/admin/SpecImporter'

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F1F3D]">Import Tool Specs</h1>
        <p className="text-gray-500 text-sm mt-1">
          Bulk import tools from JSON or CSV files. Each spec will be validated before import.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SpecImporter />
      </div>
    </div>
  )
}
