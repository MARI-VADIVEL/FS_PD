import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import {
  BellRing,
  CheckCircle2,
  CheckCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  ExternalLink
} from 'lucide-react';

const AlertsCenter = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (severityFilter) params.append('severity', severityFilter);
      if (readFilter) params.append('isRead', readFilter);

      const res = await api.get(`/alerts?${params.toString()}`);
      if (res.data.success) {
        setAlerts(res.data.alerts);
        setPages(res.data.pages);
        setTotal(res.data.total);
      }
    } catch (err) {
      addToast('Failed to load alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [page, severityFilter, readFilter]);

  const handleMarkRead = async (id) => {
    try {
      const res = await api.patch(`/alerts/${id}/read`);
      if (res.data.success) {
        addToast('Alert marked as read', 'success');
        fetchAlerts();
      }
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.patch('/alerts/read-all');
      if (res.data.success) {
        addToast('All alerts marked as read', 'success');
        fetchAlerts();
      }
    } catch (err) {}
  };

  const handleNavigateEntity = (alert) => {
    if (!alert.relatedEntity?.entityType) return;
    const type = alert.relatedEntity.entityType;
    const entId = alert.relatedEntity.entityId;

    if (type === 'Equipment') navigate(`/equipment/${entId}`);
    else if (type === 'Tyre') navigate(`/tyres/${entId}`);
    else if (type === 'WorkOrder') navigate(`/work-orders/${entId}`);
    else if (type === 'SparePart') navigate(`/inventory/${entId}`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Operational Alerts & Notification Center</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Automated alerts for safety incidents, maintenance overdue triggers, and tyre wear limits
          </p>
        </div>
        <button onClick={handleMarkAllRead} className="btn btn-secondary">
          <CheckCheck size={16} /> Mark All as Read
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <span className="card-title">
            <BellRing size={18} color="var(--brand-amber)" /> Incident Telemetry Stream ({total})
          </span>

          <div className="toolbar-filters">
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setPage(1);
              }}
              className="select-filter"
            >
              <option value="">All Severities</option>
              <option value="Critical">Critical Only</option>
              <option value="Warning">Warning</option>
              <option value="Info">Info</option>
            </select>

            <select
              value={readFilter}
              onChange={(e) => {
                setReadFilter(e.target.value);
                setPage(1);
              }}
              className="select-filter"
            >
              <option value="">All Statuses</option>
              <option value="false">Unread Only</option>
              <option value="true">Read</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Scanning alert queues..." />
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No operational alerts found matching criteria.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
            {alerts.map((alert) => (
              <div
                key={alert._id}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: alert.isRead ? 'var(--bg-surface)' : 'rgba(30, 41, 59, 0.9)',
                  borderLeft: `4px solid ${
                    alert.severity === 'Critical'
                      ? 'var(--status-danger)'
                      : alert.severity === 'Warning'
                      ? 'var(--status-warning)'
                      : 'var(--status-info)'
                  }`,
                  borderTop: '1px solid var(--border-light)',
                  borderRight: '1px solid var(--border-light)',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        color: alert.severity === 'Critical' ? '#fca5a5' : 'var(--text-main)'
                      }}
                    >
                      {alert.title}
                    </span>
                    <StatusBadge status={alert.severity} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dark)' }}>
                      {alert.alertType} &bull; {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{alert.message}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {alert.relatedEntity?.entityId && (
                    <button
                      onClick={() => handleNavigateEntity(alert)}
                      className="btn btn-secondary btn-sm"
                      title="View Related Entity"
                    >
                      Inspect Asset <ExternalLink size={12} />
                    </button>
                  )}
                  {!alert.isRead && (
                    <button
                      onClick={() => handleMarkRead(alert._id)}
                      className="btn btn-sm"
                      style={{ backgroundColor: 'var(--brand-amber-glow)', color: 'var(--brand-amber)', border: '1px solid rgba(245, 158, 11, 0.3)' }}
                    >
                      <CheckCircle2 size={14} /> Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsCenter;
