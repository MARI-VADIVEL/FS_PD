import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Boxes,
  PlusCircle,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Eye
} from 'lucide-react';

const SparePartsInventory = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [stockQty, setStockQty] = useState(1);
  const [stockNotes, setStockNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    partNumber: '',
    name: '',
    category: 'Hydraulic',
    manufacturer: '',
    supplier: '',
    unit: 'Pieces',
    quantity: 0,
    minStockLevel: 5,
    maxStockLevel: 50,
    unitCost: 0,
    storageLocation: 'Main Warehouse - Shelf A1',
    description: ''
  });

  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const canManage = ['Super Admin', 'Store Manager', 'Maintenance Manager'].includes(user?.role);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/inventory/parts?${params.toString()}`);
      if (res.data.success) {
        setParts(res.data.parts);
        setPages(res.data.pages);
        setTotal(res.data.total);
      }
    } catch (err) {
      addToast('Failed to load spare parts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, [page, categoryFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchParts();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/inventory/parts', formData);
      if (res.data.success) {
        addToast(`Part ${formData.partNumber} created`, 'success');
        setIsModalOpen(false);
        setFormData({
          partNumber: '',
          name: '',
          category: 'Hydraulic',
          manufacturer: '',
          supplier: '',
          unit: 'Pieces',
          quantity: 0,
          minStockLevel: 5,
          maxStockLevel: 50,
          unitCost: 0,
          storageLocation: 'Main Warehouse - Shelf A1',
          description: ''
        });
        fetchParts();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create spare part', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockIn = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post(`/inventory/parts/${selectedPart._id}/stock-in`, {
        quantity: stockQty,
        notes: stockNotes
      });
      if (res.data.success) {
        addToast(`Stocked in ${stockQty} units`, 'success');
        setIsStockInOpen(false);
        setStockQty(1);
        setStockNotes('');
        fetchParts();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to stock in', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockOut = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post(`/inventory/parts/${selectedPart._id}/stock-out`, {
        quantity: stockQty,
        notes: stockNotes
      });
      if (res.data.success) {
        addToast(`Stocked out ${stockQty} units`, 'success');
        setIsStockOutOpen(false);
        setStockQty(1);
        setStockNotes('');
        fetchParts();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to stock out', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'partNumber',
      label: 'Part Number',
      render: (row) => (
        <span
          style={{ fontWeight: 600, color: 'var(--brand-amber)', cursor: 'pointer' }}
          onClick={() => navigate(`/inventory/${row._id}`)}
        >
          {row.partNumber}
        </span>
      )
    },
    { key: 'name', label: 'Part Name' },
    { key: 'category', label: 'Category' },
    { key: 'manufacturer', label: 'Manufacturer' },
    {
      key: 'quantity',
      label: 'In Stock',
      render: (row) => (
        <span
          style={{
            fontWeight: 700,
            color: row.quantity <= row.minStockLevel ? 'var(--status-danger)' : 'var(--text-main)'
          }}
        >
          {row.quantity} {row.unit}
        </span>
      )
    },
    {
      key: 'unitCost',
      label: 'Unit Cost',
      render: (row) => `₹${(row.unitCost || 0).toLocaleString('en-IN')}`
    },
    { key: 'storageLocation', label: 'Location' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => navigate(`/inventory/${row._id}`)}
            className="btn btn-secondary btn-sm"
            title="View Details"
          >
            <Eye size={14} />
          </button>
          {canManage && (
            <>
              <button
                onClick={() => {
                  setSelectedPart(row);
                  setIsStockInOpen(true);
                }}
                className="btn btn-sm"
                style={{ backgroundColor: 'var(--status-active-bg)', color: 'var(--status-active)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                title="Stock In (+)"
              >
                <ArrowDownRight size={14} /> In
              </button>
              <button
                onClick={() => {
                  setSelectedPart(row);
                  setIsStockOutOpen(true);
                }}
                className="btn btn-sm"
                style={{ backgroundColor: 'var(--status-danger-bg)', color: 'var(--status-danger)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                title="Stock Out (-)"
              >
                <ArrowUpRight size={14} /> Out
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Spare Parts & Warehouse Inventory</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Maintain critical mining spares, track buffer thresholds, and control stock movements
          </p>
        </div>
        {canManage && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <PlusCircle size={16} /> Register Spare Part
          </button>
        )}
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <form onSubmit={handleSearchSubmit} className="toolbar-search">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search Part Number, Name, Shelf..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <div className="toolbar-filters">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="select-filter"
            >
              <option value="">All Categories</option>
              <option value="Hydraulic">Hydraulic</option>
              <option value="Engine">Engine</option>
              <option value="Transmission">Transmission</option>
              <option value="Electrical">Electrical</option>
              <option value="Braking">Braking</option>
              <option value="Filtration">Filtration</option>
              <option value="Fasteners">Fasteners</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="select-filter"
            >
              <option value="">All Stock Levels</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={parts}
          loading={loading}
          emptyTitle="No spare parts found"
          emptyDescription="No parts match your filter parameters."
          page={page}
          pages={pages}
          total={total}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Spare Part in Warehouse"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Part Number *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. PN-HYD-009"
                value={formData.partNumber}
                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Part Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Steering Cylinder Seal Kit"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Hydraulic">Hydraulic</option>
                <option value="Engine">Engine</option>
                <option value="Transmission">Transmission</option>
                <option value="Electrical">Electrical</option>
                <option value="Braking">Braking</option>
                <option value="Filtration">Filtration</option>
                <option value="Chassis">Chassis</option>
                <option value="Fasteners">Fasteners</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Manufacturer *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Parker, CAT, Fleetguard"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <select
                className="form-select"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="Pieces">Pieces</option>
                <option value="Kits">Kits</option>
                <option value="Sets">Sets</option>
                <option value="Liters">Liters</option>
                <option value="Meters">Meters</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Initial Quantity</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Minimum Buffer Stock *</label>
              <input
                type="number"
                required
                min="1"
                className="form-input"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit Cost (₹) *</label>
              <input
                type="number"
                required
                min="0"
                className="form-input"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Storage Location / Bin</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Warehouse Bay 2 - Rack C"
                value={formData.storageLocation}
                onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Registering...' : 'Register Spare Part'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isStockInOpen}
        onClose={() => setIsStockInOpen(false)}
        title={`Stock In: ${selectedPart?.partNumber}`}
        maxWidth="440px"
      >
        <form onSubmit={handleStockIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Quantity to Add *</label>
            <input
              type="number"
              required
              min="1"
              className="form-input"
              value={stockQty}
              onChange={(e) => setStockQty(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Receipt Notes / Reference</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Received shipment from supplier"
              value={stockNotes}
              onChange={(e) => setStockNotes(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsStockInOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Updating...' : 'Add Stock'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isStockOutOpen}
        onClose={() => setIsStockOutOpen(false)}
        title={`Stock Out: ${selectedPart?.partNumber}`}
        maxWidth="440px"
      >
        <form onSubmit={handleStockOut} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Quantity to Remove * (Max: {selectedPart?.quantity})</label>
            <input
              type="number"
              required
              min="1"
              max={selectedPart?.quantity}
              className="form-input"
              value={stockQty}
              onChange={(e) => setStockQty(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Reason / Destination</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Scrapped damaged seal / emergency repair"
              value={stockNotes}
              onChange={(e) => setStockNotes(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsStockOutOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-danger">
              {submitting ? 'Updating...' : 'Deduct Stock'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SparePartsInventory;
