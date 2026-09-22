import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle,
  Search,
  Wrench,
  Eye,
  Clock,
  CheckCircle2
} from 'lucide-react';

const WorkOrdersList = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    equipment: '',
    maintenanceType: 'Preventive',
    priority: 'Medium',
    problemDescription: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    assignedEngineer: '',
    assignedTechnician: '',
    estimatedDuration: 4,
    estimatedCost: 0
  });

  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const canCreate = ['Super Admin', 'Maintenance Manager', 'Maintenance Engineer'].includes(user?.role);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (typeFilter) params.append('maintenanceType', typeFilter);

      const res = await api.get(`/maintenance/work-orders?${params.toString()}`);
      if (res.data.success) {
        setWorkOrders(res.data.workOrders);
        setPages(res.data.pages);
        setTotal(res.data.total);
      }
    } catch (err) {
      addToast('Failed to load work orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [page, statusFilter, priorityFilter, typeFilter]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [eqRes, userRes] = await Promise.all([
          api.get('/equipment?limit=100'),
          api.get('/auth/users?limit=100').catch(() => ({ data: { users: [] } }))
        ]);
        if (eqRes.data.success) {
          setEquipments(eqRes.data.equipments || []);
          if (eqRes.data.equipments.length > 0) {
            setFormData((prev) => ({ ...prev, equipment: eqRes.data.equipments[0]._id }));
          }
        }
        if (userRes.data?.success) {
          setUsers(userRes.data.users || []);
        }
      } catch (err) {}
    };
    fetchMetadata();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchWorkOrders();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData };
      if (!payload.assignedEngineer) delete payload.assignedEngineer;
      if (!payload.assignedTechnician) delete payload.assignedTechnician;

      const res = await api.post('/maintenance/work-orders', payload);
      if (res.data.success) {
        addToast(`Work Order ${res.data.workOrder.workOrderNumber} created successfully`, 'success');
        setIsModalOpen(false);
        setFormData({
          equipment: equipments[0]?._id || '',
          maintenanceType: 'Preventive',
          priority: 'Medium',
          problemDescription: '',
          scheduledDate: new Date().toISOString().split('T')[0],
          assignedEngineer: '',
          assignedTechnician: '',
          estimatedDuration: 4,
          estimatedCost: 0
        });
        fetchWorkOrders();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create work order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'workOrderNumber',
      label: 'WO Number',
      render: (row) => (
        <span
          style={{ fontWeight: 600, color: 'var(--brand-amber)', cursor: 'pointer' }}
          onClick={() => navigate(`/work-orders/${row._id}`)}
        >
          {row.workOrderNumber}
        </span>
      )
    },
    {
      key: 'equipment',
      label: 'Equipment Asset',
      render: (row) =>
        row.equipment ? `${row.equipment.equipmentId} (${row.equipment.model})` : 'N/A'
    },
    { key: 'maintenanceType', label: 'Type' },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => <StatusBadge status={row.priority} />
    },
    {
      key: 'problemDescription',
      label: 'Description',
      render: (row) => (
        <span style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
          {row.problemDescription}
        </span>
      )
    },
    {
      key: 'assignedTechnician',
      label: 'Lead Technician',
      render: (row) => (row.assignedTechnician ? row.assignedTechnician.name : 'Unassigned')
    },
    {
      key: 'scheduledDate',
      label: 'Scheduled Date',
      render: (row) => new Date(row.scheduledDate).toLocaleDateString()
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={() => navigate(`/work-orders/${row._id}`)}
          className="btn btn-secondary btn-sm"
          title="Open Work Order Dossier"
        >
          <Eye size={14} /> Open
        </button>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Maintenance Work Order Operations</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Track corrective repairs, scheduled PMs, technician checklists, and parts issuance
          </p>
        </div>
        {canCreate && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <PlusCircle size={16} /> Create Work Order
          </button>
        )}
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <form onSubmit={handleSearchSubmit} className="toolbar-search">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search WO Number, Description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <div className="toolbar-filters">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="select-filter"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="select-filter"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="select-filter"
            >
              <option value="">All Types</option>
              <option value="Preventive">Preventive</option>
              <option value="Corrective">Corrective</option>
              <option value="Breakdown">Breakdown</option>
              <option value="Inspection">Inspection</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={workOrders}
          loading={loading}
          emptyTitle="No work orders found"
          emptyDescription="No work orders match the selected filters."
          page={page}
          pages={pages}
          total={total}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Maintenance Work Order"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Select Equipment *</label>
              <select
                required
                className="form-select"
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              >
                {equipments.map((eq) => (
                  <option key={eq._id} value={eq._id}>
                    {eq.equipmentId} - {eq.manufacturer} {eq.model} ({eq.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Maintenance Type *</label>
              <select
                className="form-select"
                value={formData.maintenanceType}
                onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
              >
                <option value="Preventive">Preventive</option>
                <option value="Corrective">Corrective</option>
                <option value="Breakdown">Breakdown</option>
                <option value="Inspection">Inspection</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Level *</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Scheduled Date *</label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
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

            <div className="form-group full-width">
              <label className="form-label">Problem Description / Maintenance Scope *</label>
              <textarea
                required
                rows={3}
                className="form-textarea"
                placeholder="Detail the mechanical issue, diagnostic symptoms or PM tasks..."
                value={formData.problemDescription}
                onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Creating...' : 'Create Work Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkOrdersList;
