import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your criteria.',
  page = 1,
  pages = 1,
  total = 0,
  onPageChange
}) => {
  if (loading) {
    return <LoadingSpinner message="Fetching operational records..." />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={col.key || idx} style={{ width: col.width || 'auto' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={row._id || row.id || rowIdx}>
                {columns.map((col, colIdx) => (
                  <td key={col.key || colIdx}>
                    {col.render ? col.render(row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && onPageChange && (
        <div className="table-pagination">
          <span>
            Showing page {page} of {pages} ({total} total records)
          </span>
          <div className="pagination-controls">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="page-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 0.5rem' }}>
              {page}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pages}
              className="page-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
