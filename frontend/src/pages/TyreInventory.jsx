import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Search, Disc, Eye, RotateCw } from 'lucide-react';

const TyreInventory = () => {
  const [tyres, setTyres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    tyreId: '',
    serialNumber: '',
    brand: 'Michelin',
    model: 'XDR3',
    tyreSize: '59/80R63',
    tyreType: 'Radial OTR',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: 3200000,
    initialTreadDepth: 95,
    recommendedPressure: 102
  });

  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const canManage = ['Super Admin', 'Maintenance Manager', 'Fleet Manager', 'Store Manager'].includes(user?.role);

  const fetchTyres = async () => {
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
      if (conditionFilter) params.append('condition', conditionFilter);
      if (brandFilter) params.append('brand', brandFilter);

      const res = await api.get(`/tyres?${params.toString()}`);
      if (res.data.success) {
        setTyres(res.data.tyres);
        setPages(res.data.pages);
        setTotal(res.data.total);
      }
    } catch (err) {
      addToast('Failed to load tyre inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTyres();
  }, [page, statusFilter, conditionFilter, brandFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTyres();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/tyres', formData);
      if (res.data.success) {
        addToast(`Tyre ${formData.tyreId} registered in stock`, 'success');
        setIsModalOpen(false);
        setFormData({
          tyreId: '',
          serialNumber: '',
          brand: 'Michelin',
          model: 'XDR3',
          tyreSize: '59/80R63',
          tyreType: 'Radial OTR',
          purchaseDate: new Date().toISOString().split('T')[0],
          purchaseCost: 3200000,
          initialTreadDepth: 95,
          recommendedPressure: 102
        });
        fetchTyres();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to register tyre', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'tyreId',
      label: 'Tyre ID',
      render: (row) => (
        <span
          style={{ fontWeight: 600, color: 'var(--brand-amber)', cursor: 'pointer' }}
          onClick={() => navigate(`/tyres/${row._id}`)}
        >
          {row.tyreId}
        </span>
      )
    },
    {
      key: 'serialNumber',
      label: 'Serial #',
      render: (row) => <span style={{ fontFamily: 'var(--font-mono)' }}>{row.serialNumber}</span>
    },
    {
      key: 'brandModel',
      label: 'Brand & Size',
      render: (row) => `${row.brand} ${row.tyreSize} (${row.model})`
    },
    {
      key: 'assignedEquipment',
      label: 'Mounted On',
      render: (row) =>
        row.assignedEquipment ? (
          <span>
            {row.assignedEquipment.equipmentId} ({row.currentPosition?.replace(/-/g, ' ')})
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>Unmounted (Stock)</span>
        )
    },
    {
      key: 'currentTreadDepth',
      label: 'Tread Depth',
      render: (row) => (
        <span
          style={{
            fontWeight: 600,
            color: row.currentTreadDepth < 15 ? 'var(--status-danger)' : row.currentTreadDepth < 30 ? 'var(--status-warning)' : 'var(--text-main)'
          }}
        >
          {row.currentTreadDepth} mm
        </span>
      )
    },
    {
      key: 'pressure',
      label: 'Pressure',
      render: (row) => `${row.currentPressure || 0} PSI`
    },
    {
      key: 'condition',
      label: 'Condition',
      render: (row) => <StatusBadge status={row.condition} />
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
          onClick={() => navigate(`/tyres/${row._id}`)}
          className="btn btn-secondary btn-sm"
          title="View Lifecycle Dossier"
        >
          <Eye size={14} /> View
        </button>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Heavy OTR Tyre Lifecycle & Inventory</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Monitor ultra-large radial tyres, tread degradation, pressure safety, and rotation cycles
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/tyre-workflows')} className="btn btn-secondary">
            <RotateCw size={16} /> Tyre Operations (Fit / Rotate / Inspect)
          </button>
          {canManage && (
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <PlusCircle size={16} /> Register Tyre Stock
            </button>
          )}
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <form onSubmit={handleSearchSubmit} className="toolbar-search">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search Tyre ID, Serial Number, Brand..."
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
              <option value="Installed">Installed</option>
              <option value="In Stock">In Stock</option>
              <option value="Under Inspection">Under Inspection</option>
              <option value="Under Repair">Under Repair</option>
              <option value="Retread">Retread</option>
              <option value="Scrapped">Scrapped</option>
            </select>

            <select
              value={conditionFilter}
              onChange={(e) => {
                setConditionFilter(e.target.value);
                setPage(1);
              }}
              className="select-filter"
            >
              <option value="">All Conditions</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Critical">Critical</option>
            </select>

            <select
              value={brandFilter}
              onChange={(e) => {
                setBrandFilter(e.target.value);
                setPage(1);
              }}
              className="select-filter"
            >
              <option value="">All Brands</option>
              <option value="Michelin">Michelin</option>
              <option value="Bridgestone">Bridgestone</option>
              <option value="Goodyear">Goodyear</option>
              <option value="Titan">Titan</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={tyres}
          loading={loading}
          emptyTitle="No tyres found"
          emptyDescription="No tyre assets match your criteria."
          page={page}
          pages={pages}
          total={total}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New OTR Tyre into Inventory"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Tyre Asset ID *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. TYR-1011"
                value={formData.tyreId}
                onChange={(e) => setFormData({ ...formData, tyreId: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Serial Number *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. MIC-5980R63-998"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Brand *</label>
              <select
                className="form-select"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              >
                <option value="Michelin">Michelin</option>
                <option value="Bridgestone">Bridgestone</option>
                <option value="Goodyear">Goodyear</option>
                <option value="Titan">Titan</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Model *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. XDR3, MasterCore"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tyre Size *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. 59/80R63, 53/80R63"
                value={formData.tyreSize}
                onChange={(e) => setFormData({ ...formData, tyreSize: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Purchase Cost (₹) *</label>
              <input
                type="number"
                required
                min="0"
                className="form-input"
                value={formData.purchaseCost}
                onChange={(e) => setFormData({ ...formData, purchaseCost: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Tread Depth (mm) *</label>
              <input
                type="number"
                required
                min="1"
                className="form-input"
                value={formData.initialTreadDepth}
                onChange={(e) => setFormData({ ...formData, initialTreadDepth: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Recommended Cold Pressure (PSI)</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={formData.recommendedPressure}
                onChange={(e) => setFormData({ ...formData, recommendedPressure: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Registering...' : 'Register Tyre'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TyreInventory;
