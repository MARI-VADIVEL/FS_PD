import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ title = 'No records found', description = 'There are no items matching your criteria.', actionText, onAction }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1.5rem', textAlign: 'center', gap: '0.75rem' }}>
      <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)' }}>
        <PackageOpen size={28} />
      </div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>{title}</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 360 }}>{description}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
