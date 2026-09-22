import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  Boxes,
  History,
  TrendingDown,
  TrendingUp,
  MapPin,
  Building
} from 'lucide-react';

const SparePartDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/inventory/parts/${id}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load part details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading || !data) {
    return <LoadingSpinner message="Loading spare part information..." />;
  }

  const { part, movements } = data;
  const totalValue = (part.quantity || 0) * (part.unitCost || 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/inventory')} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Inventory
        </button>
        <span style={{ color: 'var(--text-dark)' }}>/</span>
        <span style={{ fontWeight: 600, color: 'var(--brand-amber)' }}>{part.partNumber}</span>
      </div>

      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--brand-amber-glow)',
              color: 'var(--brand-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Boxes size={30} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 700 }}>
                {part.partNumber} &bull; {part.name}
              </h1>
              <StatusBadge status={part.status} />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Category: {part.category} | Manufacturer: {part.manufacturer} | Location: {part.storageLocation}
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dark)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Holding Value
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-amber)' }}>
            ₹{totalValue.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Current In-Stock</span>
            <span className="stat-value">{part.quantity} {part.unit}</span>
            <span className="stat-sub">Min Safe Level: {part.minStockLevel}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Unit Cost</span>
            <span className="stat-value">₹{(part.unitCost || 0).toLocaleString('en-IN')}</span>
            <span className="stat-sub">Supplier: {part.supplier || 'Standard OEM'}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Warehouse Bin</span>
            <span className="stat-value" style={{ fontSize: '1.15rem' }}>{part.storageLocation}</span>
            <span className="stat-sub">Status: {part.status}</span>
          </div>
        </div>
      </div>

      <div className="table-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={18} color="var(--brand-amber)" /> Inventory Movement & Issuance Log
        </h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Movement Type</th>
                <th>Quantity</th>
                <th>Previous Stock</th>
                <th>New Stock</th>
                <th>Reference</th>
                <th>User / Tech</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No stock transaction records found.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m._id}>
                    <td>{new Date(m.date).toLocaleString()}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: m.movementType.includes('In') || m.movementType.includes('Return')
                            ? 'var(--status-active-bg)'
                            : 'var(--status-danger-bg)',
                          color: m.movementType.includes('In') || m.movementType.includes('Return')
                            ? 'var(--status-active)'
                            : 'var(--status-danger)'
                        }}
                      >
                        {m.movementType}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{m.quantity}</td>
                    <td>{m.previousQuantity}</td>
                    <td style={{ fontWeight: 600 }}>{m.newQuantity}</td>
                    <td>{m.referenceId || m.referenceType}</td>
                    <td>{m.user}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{m.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SparePartDetail;
