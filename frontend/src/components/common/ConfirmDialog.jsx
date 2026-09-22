import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this destructive action? This cannot be undone.',
  confirmText = 'Delete',
  isDanger = true,
  isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="460px">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-full)', backgroundColor: isDanger ? 'var(--status-danger-bg)' : 'var(--status-warning-bg)', color: isDanger ? 'var(--status-danger)' : 'var(--status-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AlertTriangle size={22} />
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '0.25rem' }}>
          {message}
        </p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isLoading}>
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
