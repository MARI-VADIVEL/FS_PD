import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  Disc,
  Truck,
  ClipboardCheck,
  History,
  TrendingDown,
  Gauge,
  Thermometer,
  CircleDollarSign
} from 'lucide-react';

const TyreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inspections');

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tyres/${id}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load tyre details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading || !data) {
    return <LoadingSpinner message="Retrieving tyre lifecycle records..." />;
  }

  const { tyre, inspections, history, healthScore } = data;
  const treadWearPercent =
    tyre.initialTreadDepth > 0
      ? Math.round(((tyre.initialTreadDepth - tyre.currentTreadDepth) / tyre.initialTreadDepth) * 100)
      : 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/tyres')} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Tyre Inventory
        </button>
        <span style={{ color: 'var(--text-dark)' }}>/</span>
        <span style={{ fontWeight: 600, color: 'var(--brand-amber)' }}>{tyre.tyreId}</span>
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
              backgroundColor: 'var(--brand-blue-glow)',
              color: 'var(--brand-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Disc size={30} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700 }}>
                {tyre.tyreId} &bull; {tyre.brand} {tyre.tyreSize}
              </h1>
              <StatusBadge status={tyre.status} />
              <StatusBadge status={tyre.condition} />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Serial: <span style={{ fontFamily: 'var(--font-mono)' }}>{tyre.serialNumber}</span> | Model: {tyre.model} | Type: {tyre.tyreType}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dark)', textTransform: 'uppercase', fontWeight: 600 }}>
              Tyre Health Index
            </div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.8rem',
                fontWeight: 800,
                color: healthScore >= 80 ? 'var(--status-active)' : healthScore >= 50 ? 'var(--status-warning)' : 'var(--status-danger)'
              }}
            >
              {healthScore}%
            </div>
          </div>
          <button onClick={() => navigate('/tyre-workflows')} className="btn btn-primary">
            Record Inspection
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Remaining Tread</span>
            <span className="stat-value" style={{ color: tyre.currentTreadDepth < 15 ? 'var(--status-danger)' : 'var(--text-main)' }}>
              {tyre.currentTreadDepth} mm
            </span>
            <span className="stat-sub">{treadWearPercent}% Worn (Orig: {tyre.initialTreadDepth}mm)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Current Pressure</span>
            <span className="stat-value">{tyre.currentPressure} PSI</span>
            <span className="stat-sub">Target: {tyre.recommendedPressure} PSI</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Hours in Service</span>
            <span className="stat-value">{(tyre.currentOperatingHours || 0).toLocaleString()} hrs</span>
            <span className="stat-sub">Fitment Hours: {tyre.installationHours || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Cost Per Hour</span>
            <span className="stat-value">₹{tyre.costPerHour || 0}</span>
            <span className="stat-sub">Purchase: ₹{(tyre.purchaseCost || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Mount Position</span>
            <span className="stat-value" style={{ fontSize: '1.2rem', textTransform: 'capitalize' }}>
              {tyre.currentPosition ? tyre.currentPosition.replace(/-/g, ' ') : 'Unassigned'}
            </span>
            <span className="stat-sub">
              {tyre.assignedEquipment ? `Asset: ${tyre.assignedEquipment.equipmentId}` : 'In Warehouse Stock'}
            </span>
          </div>
        </div>
      </div>

      <div className="tab-nav">
        <button
          onClick={() => setActiveTab('inspections')}
          className={`tab-btn ${activeTab === 'inspections' ? 'active' : ''}`}
        >
          Inspection History ({inspections.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
        >
          Lifecycle & Rotation Audit ({history.length})
        </button>
      </div>

      {activeTab === 'inspections' && (
        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Inspector</th>
                  <th>Tread Depth</th>
                  <th>Cold Pressure</th>
                  <th>Temperature</th>
                  <th>Condition</th>
                  <th>Damage Type</th>
                  <th>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {inspections.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No physical inspection records found for this tyre.
                    </td>
                  </tr>
                ) : (
                  inspections.map((ins) => (
                    <tr key={ins._id}>
                      <td>{new Date(ins.inspectionDate).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 500 }}>{ins.inspector}</td>
                      <td style={{ fontWeight: 600 }}>{ins.treadDepth} mm</td>
                      <td>{ins.pressure} PSI</td>
                      <td>{ins.temperature}&deg;C</td>
                      <td><StatusBadge status={ins.visualCondition} /></td>
                      <td style={{ color: ins.damageType !== 'None' ? 'var(--status-danger)' : 'var(--text-muted)' }}>
                        {ins.damageType}
                      </td>
                      <td style={{ fontWeight: 500, color: 'var(--brand-amber)' }}>
                        {ins.recommendation}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="table-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} color="var(--brand-amber)" /> Chronological Tyre Lifecycle Journey
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {history.map((h, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderLeft: '4px solid var(--brand-blue)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--brand-amber)' }}>
                      {h.eventType}
                    </span>
                    {h.toPosition && (
                      <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                        Pos: {h.toPosition.replace(/-/g, ' ')}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {h.reason || 'Operational tyre movement'}
                  </p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-dark)' }}>
                  <div>By: {h.performedBy}</div>
                  <div>{new Date(h.date).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TyreDetail;
