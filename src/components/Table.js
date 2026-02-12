export default function Table({ columns = [], rows = [], rowKey = (r, i) => i, onRowClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
            {columns.map((c) => (
              <th key={c.key} className="whitespace-nowrap px-3 py-2 font-semibold">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={rowKey(r, i)}
              className={`border-b border-slate-50 ${onRowClick ? "cursor-pointer hover:bg-slate-50" : ""}`}
              onClick={() => onRowClick?.(r)}
            >
              {columns.map((c) => (
                <td key={c.key} className="whitespace-nowrap px-3 py-2 text-slate-700">
                  {typeof c.cell === "function" ? c.cell(r) : r?.[c.key]}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-center text-slate-500" colSpan={columns.length}>
                No records
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
