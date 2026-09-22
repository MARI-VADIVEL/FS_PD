import React from 'react';

const StatusBadge = ({ status, type = 'status' }) => {
  if (!status) return null;

  const normalized = String(status).toLowerCase();

  let badgeClass = 'badge-neutral';

  if (['active', 'completed', 'received', 'passed', 'excellent', 'in stock', 'available'].includes(normalized)) {
    badgeClass = 'badge-active';
  } else if (['in progress', 'assigned', 'open', 'good', 'installed', 'medium', 'ordered'].includes(normalized)) {
    badgeClass = 'badge-info';
  } else if (['under maintenance', 'under inspection', 'under repair', 'retread', 'warning', 'low stock', 'fair', 'high'].includes(normalized)) {
    badgeClass = 'badge-warning';
  } else if (['breakdown', 'critical', 'failed', 'out of stock', 'scrapped', 'poor', 'cancelled'].includes(normalized)) {
    badgeClass = 'badge-danger';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
};

export default StatusBadge;
