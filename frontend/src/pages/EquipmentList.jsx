import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle,
  Search,
  Truck,
  Eye,
  Trash2,
  Filter
} from 'lucide-react';

const EquipmentList = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [maintenanceDue, setMaintenanceDue] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    equipmentId: '',
    assetNumber: '',
    equipmentType: 'Haul Truck',
    manufacturer: '',
    model: '',
    serialNumber: '',
    yearOfManufacture: new Date().getFullYear(),
    purchaseDate: new Date().toISOString().split('T')[0],
    operatingHours: 0,
    location: 'Main Pit',
    assignedDepartment: 'Mining Operations',
    assignedOperator: '',
    status: 'Available',
    fuelType: 'Diesel',
    capacity: ''
  });

  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const canEdit = ['Super Admin', 'Maintenance Manager', 'Fleet Manager'].includes(user?.role);

  const fetchEquipments = async () => {
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
      if (typeFilter) params.append('equipmentType', typeFilter);
      if (locationFilter) params.append('location', locationFilter);
      if (maintenanceDue) params.append('maintenanceDue', 'true');

      const res = await api.get(`/equipment?${params.toString()}`);
      if (res.data.success) {
        setEquipments(res.data.equipments);
        setPages(res.data.pages);
        setTotal(res.data.total);
      }
    } catch (err) {
      addToast('Failed to load equipment data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, [page, statusFilter, typeFilter, locationFilter, maintenanceDue]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEquipments();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/equipment', formData);
      if (res.data.success) {
        addToast(`Equipment ${formData.equipmentId} registered successfully`, 'success');
        setIsModalOpen(false);
        setFormData({
          equipmentId: '',
          assetNumber: '',
          equipmentType: 'Haul Truck',
          manufacturer: '',
          model: '',
          serialNumber: '',
          yearOfManufacture: new Date().getFullYear(),
          purchaseDate: new Date().toISOString().split('T')[0],
          operatingHours: 0,
          location: 'Main Pit',
          assignedDepartment: 'Mining Operations',
          assignedOperator: '',
          status: 'Available',
          fuelType: 'Diesel',
          capacity: ''
        });
        fetchEquipments();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to register equipment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      const res = await api.delete(`/equipment/${selectedEquipment._id}`);
      if (res.data.success) {
        addToast('Equipment deleted (soft delete)', 'success');
        setIsDeleteOpen(false);
        fetchEquipments();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete equipment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'equipmentId',
      label: 'Equipment ID',
      render: (row) => (
        <span
          style={{ fontWeight: 600, color: 'var(--brand-amber)', cursor: 'pointer' }}
          onClick={() => navigate(`/equipment/${row._id}`)}
        >
          {row.equipmentId}
        </span>
      )
    },
    {
      key: 'assetNumber',
      label: 'Asset #',
      render: (row) => <span style={{ fontFamily: 'var(--font-mono)' }}>{row.assetNumber}</span>
    },
    { key: 'equipmentType', label: 'Type' },
    {
      key: 'model',
      label: 'Model',
      render: (row) => `${row.manufacturer} ${row.model}`
    },
    {
      key: 'operatingHours',
      label: 'Hours Run',
      render: (row) => `${(row.operatingHours || 0).toLocaleString()} hrs`
    },
    { key: 'location', label: 'Location' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'nextServiceDate',
      label: 'Next PM Due',
      render: (row) =>
        row.nextServiceDate ? new Date(row.nextServiceDate).toLocaleDateString() : 'N/A'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate(`/equipment/${row._id}`)}
            className="btn btn-secondary btn-sm"
            title="View Details"
          >
            <Eye size={14} />
          </button>
          {canEdit && (
            <button
              onClick={() => {
                setSelectedEquipment(row);
                setIsDeleteOpen(true);
              }}
              className="btn btn-danger btn-sm"
              title="Delete Equipment"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Mining Fleet Equipment Management</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Register, allocate, and monitor heavy earthmoving and haulage assets
          </p>
        </div>
        {canEdit && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <PlusCircle size={16} /> Register New Equipment
          </button>
        )}
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <form onSubmit={handleSearchSubmit} className="toolbar-search">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by ID, Asset, Model, Operator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <div className="toolbar-filters">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="select-filter"
            >
              <option value="">All Types</option>
              <option value="Haul Truck">Haul Truck</option>
              <option value="Hydraulic Excavator">Hydraulic Excavator</option>
              <option value="Wheel Loader">Wheel Loader</option>
              <option value="Track Dozer">Track Dozer</option>
              <option value="Motor Grader">Motor Grader</option>
              <option value="Drill Rig">Drill Rig</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="select-filter"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Available">Available</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Breakdown">Breakdown</option>
              <option value="Retired">Retired</option>
            </select>

            <button
              onClick={() => {
                setMaintenanceDue(!maintenanceDue);
                setPage(1);
              }}
              className={`btn ${maintenanceDue ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              <Filter size={14} /> Due for Service
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={equipments}
          loading={loading}
          emptyTitle="No mining equipment found"
          emptyDescription="No equipment matching your filters. Try clearing your search parameters."
          page={page}
          pages={pages}
          total={total}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Mining Equipment"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Equipment ID *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. EQ-009"
                value={formData.equipmentId}
                onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Asset Tag Number *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. HT-797-09"
                value={formData.assetNumber}
                onChange={(e) => setFormData({ ...formData, assetNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Equipment Type *</label>
              <select
                className="form-select"
                value={formData.equipmentType}
                onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
              >
                <option value="Haul Truck">Haul Truck</option>
                <option value="Hydraulic Excavator">Hydraulic Excavator</option>
                <option value="Wheel Loader">Wheel Loader</option>
                <option value="Track Dozer">Track Dozer</option>
                <option value="Motor Grader">Motor Grader</option>
                <option value="Drill Rig">Drill Rig</option>
                <option value="Water Tanker">Water Tanker</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Manufacturer *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Caterpillar, Komatsu"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Model *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. 797F, 930E-5"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Serial Number *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Chassis / Serial No"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Year of Manufacture *</label>
              <input
                type="number"
                required
                className="form-input"
                value={formData.yearOfManufacture}
                onChange={(e) => setFormData({ ...formData, yearOfManufacture: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Current Operating Hours</label>
              <input
                type="number"
                className="form-input"
                value={formData.operatingHours}
                onChange={(e) => setFormData({ ...formData, operatingHours: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Operating Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. North Pit Zone A"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Operator</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh Kumar"
                value={formData.assignedOperator}
                onChange={(e) => setFormData({ ...formData, assignedOperator: e.target.value })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Registering...' : 'Register Equipment'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Retire / Soft Delete Equipment"
        message={`Are you sure you want to retire equipment ${selectedEquipment?.equipmentId} (${selectedEquipment?.assetNumber})? Historical records and tyre logs will remain preserved.`}
        confirmText="Retire Equipment"
        isLoading={submitting}
      />
    </div>
  );
};

export default EquipmentList;
