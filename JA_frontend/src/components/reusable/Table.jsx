import React from "react";

export function Table({ columns, data }) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-md">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-3 py-2 text-left font-semibold text-gray-700 border-b"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-3 py-2 border-b text-gray-700"
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
