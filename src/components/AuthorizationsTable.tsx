import { siteContent } from "@/content/site";

export default function AuthorizationsTable() {
  const { columns, rows } = siteContent.autorizaciones;

  return (
    <div className="overflow-x-auto rounded-xl shadow-md ring-1 ring-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead>
          <tr className="bg-primary-700">
            {columns.map((col) => (
              <th
                key={col}
                scope="col"
                className="px-4 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={`${rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-primary-50 transition-colors duration-100`}
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className={`px-4 py-3.5 text-gray-700 ${cellIdx === 0 ? "font-medium text-primary-800" : ""}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
