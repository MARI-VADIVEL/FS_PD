import React, { useState, useEffect } from 'react';
import api from '../api/client';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { Users, PlusCircle, ShieldCheck, UserX } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Viewer',
    department: 'Mining Operations',
    phone: ''
  });

  const { addToast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/auth/users?page=${page}&limit=10`);
      if (res.data.success) {
        setUsers(res.data.users);
        setPages(res.data.pages);
        setTotal(res.data.total);
      }
    } catch (err) {
      addToast('Failed to load user accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/auth/users', formData);
      if (res.data.success) {
        addToast(`User ${formData.email} registered`, 'success');
        setIsModalOpen(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'Viewer',
          department: 'Mining Operations',
          phone: ''
        });
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id, email) => {
    try {
      const res = await api.delete(`/auth/users/${id}`);
      if (res.data.success) {
        addToast(`User ${email} deactivated`, 'success');
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to deactivate', 'error');
    }
  };

  const columns = [
    { key: 'name', label: 'Full Name' },
    { key: 'email', label: 'Email Address' },
    {
      key: 'role',
      label: 'System Role',
      render: (row) => (
        <span className="badge badge-info" style={{ fontWeight: 600 }}>
          {row.role}
        </span>
      )
    },
    { key: 'department', label: 'Department' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (row) => (row.lastLogin ? new Date(row.lastLogin).toLocaleString() : 'Never')
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        row.role !== 'Super Admin' && row.status === 'Active' ? (
          <button
            onClick={() => handleDeactivate(row._id, row.email)}
            className="btn btn-danger btn-sm"
            title="Deactivate Account"
          >
            <UserX size={14} /> Deactivate
          </button>
        ) : null
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">User Accounts & Role Permissions</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Super Admin directory controlling role-based access across 8 enterprise functional tiers
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <PlusCircle size={16} /> Add New User
        </button>
      </div>

      <div className="table-card">
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyTitle="No users found"
          emptyDescription="Add team members and assign role-based permissions."
          page={page}
          pages={pages}
          total={total}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision New Enterprise User Account"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Ramesh Patel"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="user@miningplatform.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Password *</label>
              <input
                type="password"
                required
                minLength={6}
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Role *</label>
              <select
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Maintenance Manager">Maintenance Manager</option>
                <option value="Maintenance Engineer">Maintenance Engineer</option>
                <option value="Technician">Technician</option>
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Store Manager">Store Manager</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Fleet Maintenance"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Creating...' : 'Provision User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
