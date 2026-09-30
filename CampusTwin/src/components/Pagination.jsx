import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 10,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        flexWrap: 'wrap',
        gap: 12
      }}
    >
      <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
        Showing <strong>{startRecord}</strong> to <strong>{endRecord}</strong> of{' '}
        <strong>{total}</strong> results
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <span
          style={{
            fontSize: '0.8125rem',
            padding: '4px 10px',
            fontWeight: 600,
            color: 'var(--text)'
          }}
        >
          Page {page} of {totalPages}
        </span>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
