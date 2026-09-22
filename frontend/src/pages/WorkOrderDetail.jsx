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
  Wrench,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  CircleDollarSign,
  Boxes,
  PlusCircle,
  CheckSquare
} from 'lucide-react';

const WorkOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [parts, setParts] = useState([]);

  const [isPartsModalOpen, setIsPartsModalOpen] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [issueQuantity, setIssueQuantity] = useState(1);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [actualHours, setActualHours] = useState(4);
  const [actualLaborCost, setActualLaborCost] = useState(5000);
  const [completionNotes, setCompletionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canManage = ['Super Admin', 'Maintenance Manager', 'Maintenance Engineer'].includes(user?.role);
  const canUpdateChecklist = ['Super Admin', 'Maintenance Manager', 'Maintenance Engineer', 'Technician'].includes(user?.role);

  const fetchWorkOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/maintenance/work-orders/${id}`);
      if (res.data.success) {
        setWorkOrder(res.data.workOrder);
        setActualHours(res.data.workOrder.actualDuration || res.data.workOrder.estimatedDuration || 4);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load work order', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrder();
  }, [id]);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const res = await api.get('/inventory/parts?limit=100');
        if (res.data.success && res.data.parts.length > 0) {
          setParts(res.data.parts);
          setSelectedPartId(res.data.parts[0]._id);
        }
      } catch (err) {}
    };
    fetchParts();
  }, []);

  const handleChecklistChange = async (checklistIndex, newStatus) => {
    try {
      const res = await api.patch(`/maintenance/work-orders/${id}/checklist`, {
        checklistIndex,
        status: newStatus
      });
      if (res.data.success) {
        addToast('Checklist item updated', 'success');
        fetchWorkOrder();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update checklist item', 'error');
    }
  };

  const handleIssuePart = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post(`/maintenance/work-orders/${id}/parts`, {
        partId: selectedPartId,
        quantity: issueQuantity
      });
      if (res.data.success) {
        addToast('Spare parts issued to work order', 'success');
        setIsPartsModalOpen(false);
        setIssueQuantity(1);
        fetchWorkOrder();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to issue spare part', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteOrder = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.patch(`/maintenance/work-orders/${id}/complete`, {
        actualHours,
        actualLaborCost,
        completionNotes
      });
      if (res.data.success) {
        addToast('Work order marked as Completed', 'success');
        setIsCompleteModalOpen(false);
        fetchWorkOrder();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to complete work order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !workOrder) {
    return <LoadingSpinner message="Loading work order details..." />;
  }

  const hasCriticalFailure = workOrder.checklist?.some((c) => c.status === 'Failed' && c.isCritical);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/work-orders')} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Work Orders
        </button>
        <span style={{ color: 'var(--text-dark)' }}>/</span>
        <span style={{ fontWeight: 600, color: 'var(--brand-amber)' }}>{workOrder.workOrderNumber}</span>
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
              width: 54,
              height: 54,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--brand-amber-glow)',
              color: 'var(--brand-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Wrench size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 700 }}>
                {workOrder.workOrderNumber} &bull; {workOrder.maintenanceType} Maintenance
              </h1>
              <StatusBadge status={workOrder.status} />
              <StatusBadge status={workOrder.priority} />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Target Asset: <strong style={{ color: 'var(--brand-amber)' }}>{workOrder.equipment?.equipmentId}</strong> ({workOrder.equipment?.manufacturer} {workOrder.equipment?.model}) &bull; Scheduled: {new Date(workOrder.scheduledDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {canUpdateChecklist && workOrder.status !== 'Completed' && (
            <button onClick={() => setIsPartsModalOpen(true)} className="btn btn-secondary">
              <Boxes size={16} /> Issue Parts
            </button>
          )}
          {canManage && workOrder.status !== 'Completed' && (
            <button onClick={() => setIsCompleteModalOpen(true)} className="btn btn-primary">
              <CheckCircle2 size={16} /> Complete Work Order
            </button>
          )}
        </div>
      </div>

      {hasCriticalFailure && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--status-danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}
        >
          <AlertTriangle size={24} color="var(--status-danger)" />
          <div>
            <strong>CRITICAL SAFETY ITEM FAILED:</strong> One or more mandatory safety check items on this work order failed verification. Corrective repair must be executed before equipment release.
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="table-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="var(--brand-amber)" /> Maintenance Scope & Diagnostics
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6, backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            {workOrder.problemDescription}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Engineer:</span>
              <div style={{ fontWeight: 600 }}>{workOrder.assignedEngineer?.name || 'Unassigned'}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Lead Technician:</span>
              <div style={{ fontWeight: 600 }}>{workOrder.assignedTechnician?.name || 'Unassigned'}</div>
            </div>
          </div>
        </div>

        <div className="table-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CircleDollarSign size={18} color="var(--status-active)" /> Financial & Labor Cost Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Duration</span>
              <span>{workOrder.estimatedDuration || 0} Hours</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Actual Duration</span>
              <span>{workOrder.actualDuration || 0} Hours</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Actual Labor Cost</span>
              <span>₹{(workOrder.actualLaborCost || 0).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Actual Spare Parts Cost</span>
              <span>₹{(workOrder.actualPartsCost || 0).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Total Work Order Spend</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--brand-amber)' }}>
                ₹{(workOrder.actualCost || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="table-card" style={{ marginBottom: '1.5rem' }}>
        <div className="table-toolbar">
          <span className="card-title">
            <CheckSquare size={18} color="var(--brand-amber)" /> Step-by-Step Maintenance Checklist
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Technician Verification Sign-off
          </span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Task Description</th>
                <th>Criticality</th>
                <th>Verification Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {workOrder.checklist?.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ width: '40px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 500 }}>{item.task}</td>
                  <td>
                    {item.isCritical ? (
                      <span className="badge badge-danger">Critical</span>
                    ) : (
                      <span className="badge badge-neutral">Standard</span>
                    )}
                  </td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>
                    {canUpdateChecklist && workOrder.status !== 'Completed' ? (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleChecklistChange(idx, 'Passed')}
                          className="btn btn-sm"
                          style={{ backgroundColor: 'var(--status-active-bg)', color: 'var(--status-active)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                        >
                          Pass
                        </button>
                        <button
                          onClick={() => handleChecklistChange(idx, 'Failed')}
                          className="btn btn-sm"
                          style={{ backgroundColor: 'var(--status-danger-bg)', color: 'var(--status-danger)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                        >
                          Fail
                        </button>
                        <button
                          onClick={() => handleChecklistChange(idx, 'Not Applicable')}
                          className="btn btn-sm btn-secondary"
                        >
                          N/A
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Locked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <span className="card-title">
            <Boxes size={18} color="var(--status-info)" /> Consumed Spare Parts
          </span>
          {canUpdateChecklist && workOrder.status !== 'Completed' && (
            <button onClick={() => setIsPartsModalOpen(true)} className="btn btn-secondary btn-sm">
              <PlusCircle size={14} /> Issue Part from Store
            </button>
          )}
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Part Number</th>
                <th>Part Name</th>
                <th>Quantity</th>
                <th>Unit Cost</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {!workOrder.partsUsed || workOrder.partsUsed.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No spare parts issued to this work order yet.
                  </td>
                </tr>
              ) : (
                workOrder.partsUsed.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--brand-amber)' }}>{p.partNumber}</td>
                    <td>{p.name}</td>
                    <td>{p.quantity}</td>
                    <td>₹{(p.unitCost || 0).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600 }}>₹{(p.totalCost || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isPartsModalOpen}
        onClose={() => setIsPartsModalOpen(false)}
        title="Issue Spare Part to Work Order"
        maxWidth="480px"
      >
        <form onSubmit={handleIssuePart} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Select Warehouse Spare Part *</label>
            <select
              className="form-select"
              value={selectedPartId}
              onChange={(e) => setSelectedPartId(e.target.value)}
            >
              {parts.map((p) => (
                <option key={p._id} value={p._id} disabled={p.quantity <= 0}>
                  {p.partNumber} - {p.name} ({p.quantity} {p.unit} in stock - ₹{p.unitCost})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity to Issue *</label>
            <input
              type="number"
              required
              min="1"
              className="form-input"
              value={issueQuantity}
              onChange={(e) => setIssueQuantity(Number(e.target.value))}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsPartsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Issuing...' : 'Issue & Decrement Inventory'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        title="Complete Work Order Sign-Off"
        maxWidth="480px"
      >
        <form onSubmit={handleCompleteOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Actual Labor Hours *</label>
            <input
              type="number"
              step="0.5"
              required
              className="form-input"
              value={actualHours}
              onChange={(e) => setActualHours(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Actual Labor Cost (₹) *</label>
            <input
              type="number"
              required
              className="form-input"
              value={actualLaborCost}
              onChange={(e) => setActualLaborCost(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Completion Notes / Engineering Sign-off *</label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              placeholder="Detail corrective actions taken, post-repair inspection..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsCompleteModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Signing Off...' : 'Confirm Completion'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkOrderDetail;
