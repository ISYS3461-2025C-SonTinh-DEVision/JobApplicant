/**
 * Reusable Table Component
 * 
 * Styled table component that can use HeadlessTable hook for logic.
 * Supports: dark/light themes, sorting, selection, custom cell renderers.
 * 
 * Architecture: A.2.a (Medium Frontend) - Reusable UI Component
 */

import React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

/**
 * Sort Icon Component
 */
function SortIcon({ direction }) {
  if (direction === 'asc') return <ChevronUp className="w-4 h-4" />;
  if (direction === 'desc') return <ChevronDown className="w-4 h-4" />;
  return <ChevronsUpDown className="w-4 h-4 opacity-40" />;
}

/**
 * Table Component
 * 
 * @param {Array} columns - Column definitions [{ key, label, sortable, render }]
 * @param {Array} data - Data rows
 * @param {string} variant - Theme variant: 'dark' | 'light'
 * @param {string} sortKey - Current sort key
 * @param {string} sortDirection - Current sort direction: 'asc' | 'desc'
 * @param {function} onSort - Sort handler (key) => void
 * @param {function} onRowClick - Row click handler (row) => void
 * @param {string} emptyMessage - Message when no data
 * @param {boolean} loading - Loading state
 * @param {string} className - Additional CSS classes
 */
export function Table({
  columns = [],
  data = [],
  variant = 'light',
  sortKey = null,
  sortDirection = 'asc',
  onSort = null,
  onRowClick = null,
  emptyMessage = 'No data available',
  loading = false,
  className = '',
  stickyHeader = false,
}) {
  const themes = {
    dark: {
      container: 'bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden',
      table: 'w-full border-collapse text-sm',
      thead: 'bg-dark-800/80',
      th: 'px-4 py-3 text-left font-semibold text-dark-200 border-b border-dark-700',
      thSortable: 'cursor-pointer hover:bg-dark-700/50 transition-colors select-none',
      tbody: '',
      tr: 'border-b border-dark-700/50 last:border-0 transition-colors',
      trHover: 'hover:bg-dark-700/30',
      trClickable: 'cursor-pointer',
      td: 'px-4 py-3 text-dark-300',
      empty: 'text-dark-500 text-center py-12',
      loading: 'text-dark-400 text-center py-12',
    },
    light: {
      container: 'bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm',
      table: 'w-full border-collapse text-sm',
      thead: 'bg-gray-50',
      th: 'px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200',
      thSortable: 'cursor-pointer hover:bg-gray-100 transition-colors select-none',
      tbody: '',
      tr: 'border-b border-gray-100 last:border-0 transition-colors',
      trHover: 'hover:bg-gray-50',
      trClickable: 'cursor-pointer',
      td: 'px-4 py-3 text-gray-700',
      empty: 'text-gray-400 text-center py-12',
      loading: 'text-gray-400 text-center py-12',
    },
  };

  const theme = themes[variant] || themes.light;

  const handleSort = (key) => {
    if (onSort) {
      onSort(key);
    }
  };

  const handleRowClick = (row) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  if (loading) {
    return (
      <div className={`${theme.container} ${className}`}>
        <div className={theme.loading}>
          <div className="inline-flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme.container} overflow-x-auto ${className}`}>
      <table className={theme.table}>
        <thead className={`${theme.thead} ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
          <tr>
            {columns.map((col) => {
              const isSortable = col.sortable !== false && onSort;
              const isSorted = sortKey === col.key;
              
              return (
                <th
                  key={col.key}
                  className={`${theme.th} ${isSortable ? theme.thSortable : ''}`}
                  onClick={isSortable ? () => handleSort(col.key) : undefined}
                  aria-sort={isSorted ? sortDirection : undefined}
                  style={col.width ? { width: col.width } : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span>{col.label}</span>
                    {isSortable && (
                      <SortIcon direction={isSorted ? sortDirection : null} />
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className={theme.tbody}>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={theme.empty}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className={`
                  ${theme.tr}
                  ${theme.trHover}
                  ${onRowClick ? theme.trClickable : ''}
                `}
                onClick={() => handleRowClick(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={theme.td}>
                    {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * DataTable - Table with built-in HeadlessTable logic
 * 
 * Combines Table styling with HeadlessTable sorting logic.
 */
export function DataTable({
  columns,
  data,
  defaultSortKey = null,
  defaultSortDirection = 'asc',
  ...props
}) {
  const [sortKey, setSortKey] = React.useState(defaultSortKey);
  const [sortDirection, setSortDirection] = React.useState(defaultSortDirection);

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDirection === 'asc' ? 1 : -1;
      if (bVal == null) return sortDirection === 'asc' ? -1 : 1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const comparison = String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase());
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  return (
    <Table
      columns={columns}
      data={sortedData}
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSort={handleSort}
      {...props}
    />
  );
}

export default Table;
