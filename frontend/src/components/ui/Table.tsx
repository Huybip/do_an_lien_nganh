import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  keyField?: keyof T
}

export default function Table<T extends Record<string, any>>({ columns, data, loading, keyField = 'id' }: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/60 bg-white">
      <table className="w-full border-collapse">
        <thead className="bg-slate-50/80">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-4.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-100/50">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-5.5 align-middle">
                    <div className="skeleton h-4 w-24" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center text-slate-400 text-sm">
                Không có dữ liệu hiển thị
              </td>
            </tr>
          ) : data.map((row) => (
            <tr key={String(row[keyField])} className="border-b border-slate-100/70 hover:bg-slate-50/50 transition duration-200">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-5.5 text-sm text-slate-600 align-middle">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}