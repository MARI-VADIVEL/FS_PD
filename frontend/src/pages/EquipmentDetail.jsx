import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Truck,
  Disc,
  Wrench,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  AlertTriangle,
  History,
  Edit,
  Activity
} from 'lucide-react';

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canEdit = ['Super Admin', 'Maintenance Manager', 'Fleet Manager', 'Maintenance Engineer'].includes(user?.role);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/equipment/${id}`);
      if (res.data.success) {
        setData(res.data);
        setNewStatus(res.data.equipment.status);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load equipment details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.patch(`/equipment/${id}/status`, {
        status: newStatus,
        reason: statusReason
      });
      if (res.data.success) {
        addToast(`Equipment status changed to ${newStatus}`, 'success');
        setIsStatusModalOpen(false);
        setStatusReason('');
        fetchDetail();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return <LoadingSpinner message="Loading equipment dossier..." />;
  }

  const { equipment, assignedTyres, workOrders, downtimes, healthScore } = data;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/equipment')} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Fleet
        </button>
        <span style={{ color: 'var(--text-dark)' }}>/</span>
        <span style={{ fontWeight: 600, color: 'var(--brand-amber)' }}>{equipment.equipmentId}</span>
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
            <Truck size={30} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700 }}>
                {equipment.equipmentId} &bull; {equipment.manufacturer} {equipment.model}
              </h1>
              <StatusBadge status={equipment.status} />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Asset Tag: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{equipment.assetNumber}</span> | Type: {equipment.equipmentType} | Location: {equipment.location}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dark)', textTransform: 'uppercase', fontWeight: 600 }}>
              Asset Health Score
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

          {canEdit && (
            <button onClick={() => setIsStatusModalOpen(true)} className="btn btn-primary">
              <Activity size={16} /> Update Status
            </button>
          )}
        </div>
      </div>

      <div className="tab-nav">
        <button
          onClick={() => setActiveTab('overview')}
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        >
          Overview & Specs
        </button>
        <button
          onClick={() => setActiveTab('tyres')}
          className={`tab-btn ${activeTab === 'tyres' ? 'active' : ''}`}
        >
          Assigned Tyres ({assignedTyres.length})
        </button>
        <button
          onClick={() => setActiveTab('workOrders')}
          className={`tab-btn ${activeTab === 'workOrders' ? 'active' : ''}`}
        >
          Maintenance History ({workOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('downtime')}
          className={`tab-btn ${activeTab === 'downtime' ? 'active' : ''}`}
        >
          Downtime Logs ({downtimes.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
        >
          Audit & Status History
        </button>
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="table-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} color="var(--brand-amber)" /> Mechanical Specifications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Serial Number</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{equipment.serialNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Year of Manufacture</span>
                <span>{equipment.yearOfManufacture}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fuel / Power Type</span>
                <span>{equipment.fuelType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Rated Capacity</span>
                <span>{equipment.capacity}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Operating Hours</span>
                <span style={{ fontWeight: 600 }}>{(equipment.operatingHours || 0).toLocaleString()} hrs</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Mileage</span>
                <span>{(equipment.mileage || 0).toLocaleString()} km</span>
              </div>
            </div>
          </div>

          <div className="table-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--status-info)" /> Operational & Service Intervals
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Operator</span>
                <span style={{ fontWeight: 600 }}>{equipment.assignedOperator || 'Unassigned'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Department</span>
                <span>{equipment.assignedDepartment}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>PM Service Interval</span>
                <span>Every {equipment.maintenanceIntervalHours} hrs</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Last Service Completed</span>
                <span>{equipment.lastServiceDate ? new Date(equipment.lastServiceDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Next Service Due</span>
                <span style={{ color: 'var(--brand-amber)', fontWeight: 600 }}>
                  {equipment.nextServiceDate ? new Date(equipment.nextServiceDate).toLocaleDateString() : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tyres' && (
        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tyre ID</th>
                  <th>Position</th>
                  <th>Brand & Size</th>
                  <th>Tread Depth</th>
                  <th>Pressure</th>
                  <th>Condition</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignedTyres.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No tyres currently mounted on this equipment.
                    </td>
                  </tr>
                ) : (
                  assignedTyres.map((tyre) => (
                    <tr key={tyre._id}>
                      <td style={{ fontWeight: 600, color: 'var(--brand-amber)' }}>{tyre.tyreId}</td>
                      <td>
                        <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                          {tyre.currentPosition?.replace(/-/g, ' ')}
                        </span>
                      </td>
                      <td>{tyre.brand} {tyre.tyreSize}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: tyre.currentTreadDepth < 15 ? 'var(--status-danger)' : 'var(--text-main)' }}>
                          {tyre.currentTreadDepth} mm
                        </span>
                      </td>
                      <td>{tyre.currentPressure} PSI</td>
                      <td><StatusBadge status={tyre.condition} /></td>
                      <td>
                        <button
                          onClick={() => navigate(`/tyres/${tyre._id}`)}
                          className="btn btn-secondary btn-sm"
                        >
                          View Tyre
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'workOrders' && (
        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>WO Number</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Description</th>
                  <th>Scheduled</th>
                  <th>Actual Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No work orders recorded for this asset.
                    </td>
                  </tr>
                ) : (
                  workOrders.map((wo) => (
                    <tr
                      key={wo._id}
                      onClick={() => navigate(`/work-orders/${wo._id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--brand-amber)' }}>{wo.workOrderNumber}</td>
                      <td>{wo.maintenanceType}</td>
                      <td><StatusBadge status={wo.priority} /></td>
                      <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {wo.problemDescription}
                      </td>
                      <td>{new Date(wo.scheduledDate).toLocaleDateString()}</td>
                      <td>₹{(wo.actualCost || 0).toLocaleString('en-IN')}</td>
                      <td><StatusBadge status={wo.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'downtime' && (
        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Reason</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration</th>
                  <th>Impact</th>
                </tr>
              </thead>
              <tbody>
                {downtimes.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Zero downtime incidents logged.
                    </td>
                  </tr>
                ) : (
                  downtimes.map((dt) => (
                    <tr key={dt._id}>
                      <td style={{ fontWeight: 600 }}>{dt.category}</td>
                      <td>{dt.reason}</td>
                      <td>{new Date(dt.startTime).toLocaleString()}</td>
                      <td>{dt.endTime ? new Date(dt.endTime).toLocaleString() : 'Ongoing'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--brand-amber)' }}>{dt.durationHours || 0} hrs</td>
                      <td><StatusBadge status={dt.impactLevel} /></td>
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
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Equipment Status Transition Audit
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(equipment.statusHistory || []).slice().reverse().map((sh, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <StatusBadge status={sh.status} />
                  <span style={{ fontSize: '0.85rem', marginLeft: '0.75rem', color: 'var(--text-main)' }}>
                    {sh.reason || 'Status changed'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dark)', textAlign: 'right' }}>
                  <div>By: {sh.changedBy || 'System'}</div>
                  <div>{new Date(sh.changedAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Change Status: ${equipment.equipmentId}`}
        maxWidth="480px"
      >
        <form onSubmit={handleStatusUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">New Operating Status</label>
            <select
              className="form-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Available">Available</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Breakdown">Breakdown</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Operational Notes *</label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              placeholder="Provide justification for status change..."
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsStatusModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Updating...' : 'Confirm Status Change'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EquipmentDetail;
