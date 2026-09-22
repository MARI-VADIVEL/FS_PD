import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', size = 32 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '0.75rem', color: 'var(--text-muted)' }}>
      <Loader2 size={size} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand-amber)' }} />
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
      <style>
        {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
};

export default LoadingSpinner;
