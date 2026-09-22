import React, { useState, useEffect } from 'react';
import api from '../api/client';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, CalendarClock, CheckSquare } from 'lucide-react';

const MaintenanceSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    equipment: '',
    serviceType: 'Preventive',
    intervalType: 'Hours',
    intervalValue: 250,
    estimatedDuration: 4,
    estimatedCost: 25000
  });

  const { addToast } = useToast();
  const { user } = useAuth();
  const canCreate = ['Super Admin', 'Maintenance Manager'].includes(user?.role);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/maintenance/schedules');
      if (res.data.success) {
        setSchedules(res.data.schedules);
      }
    } catch (err) {
      addToast('Failed to load maintenance schedules', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const res = await api.get('/equipment?limit=100');
        if (res.data.success && res.data.equipments.length > 0) {
          setEquipments(res.data.equipments);
          setFormData((prev) => ({ ...prev, equipment: res.data.equipments[0]._id }));
        }
      } catch (err) {}
    };
    fetchEquipments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        lastTriggerValue: 0,
        nextDueValue: formData.intervalValue,
        checklistTemplate: [
          { task: 'Check fluid levels & high-pressure seals', isCritical: true },
          { task: 'Inspect structural integrity & mounting bolts', isCritical: true },
          { task: 'Lubricate pivot pins and grease points', isCritical: false }
        ]
      };
      const res = await api.post('/maintenance/schedules', payload);
      if (res.data.success) {
        addToast('Maintenance schedule created successfully', 'success');
        setIsModalOpen(false);
        fetchSchedules();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create schedule', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Schedule Title',
      render: (row) => <span style={{ fontWeight: 600, color: 'var(--brand-amber)' }}>{row.title}</span>
    },
    {
      key: 'equipment',
      label: 'Target Equipment',
      render: (row) =>
        row.equipment ? `${row.equipment.equipmentId} (${row.equipment.model})` : 'N/A'
    },
    { key: 'serviceType', label: 'Service Type' },
    {
      key: 'interval',
      label: 'Interval Trigger',
      render: (row) => `Every ${row.intervalValue} ${row.intervalType}`
    },
    {
      key: 'nextDueValue',
      label: 'Next Due Target',
      render: (row) => `${row.nextDueValue} ${row.intervalType}`
    },
    {
      key: 'estimatedDuration',
      label: 'Est. Duration',
      render: (row) => `${row.estimatedDuration || 0} hrs`
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Preventive Maintenance Schedules</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Automate recurring inspection intervals based on operating hours, mileage, and calendar intervals
          </p>
        </div>
        {canCreate && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <PlusCircle size={16} /> New PM Schedule
          </button>
        )}
      </div>

      <div className="table-card">
        <DataTable
          columns={columns}
          data={schedules}
          loading={loading}
          emptyTitle="No maintenance schedules configured"
          emptyDescription="Create a schedule template to automate recurring servicing for mining assets."
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Preventive Maintenance Schedule"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Schedule Title *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. 500-Hour Hydraulic Overhaul"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Equipment Asset *</label>
              <select
                required
                className="form-select"
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              >
                {equipments.map((eq) => (
                  <option key={eq._id} value={eq._id}>
                    {eq.equipmentId} - {eq.manufacturer} {eq.model}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Service Type</label>
              <select
                className="form-select"
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              >
                <option value="Preventive">Preventive</option>
                <option value="Inspection">Inspection</option>
                <option value="Major Overhaul">Major Overhaul</option>
                <option value="Lubrication">Lubrication</option>
                <option value="Tyre Rotation">Tyre Rotation</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Interval Trigger Type</label>
              <select
                className="form-select"
                value={formData.intervalType}
                onChange={(e) => setFormData({ ...formData, intervalType: e.target.value })}
              >
                <option value="Hours">Operating Hours</option>
                <option value="Calendar">Days (Calendar)</option>
                <option value="Mileage">Kilometers</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Interval Value *</label>
              <input
                type="number"
                required
                min="1"
                className="form-input"
                value={formData.intervalValue}
                onChange={(e) => setFormData({ ...formData, intervalValue: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Est. Duration (Hours)</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Creating...' : 'Create PM Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaintenanceSchedules;
