import React, { useState, useEffect } from 'react';
import api from '../api/client';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, ShoppingCart, CheckCircle2 } from 'lucide-react';

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    supplier: '',
    expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    selectedPartId: '',
    quantity: 10,
    unitCost: 1000,
    notes: ''
  });

  const { addToast } = useToast();
  const { user } = useAuth();
  const canManage = ['Super Admin', 'Store Manager'].includes(user?.role);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/inventory/purchase-orders?page=${page}&limit=10`);
      if (res.data.success) {
        setOrders(res.data.orders);
        setPages(res.data.pages);
        setTotal(res.data.total);
      }
    } catch (err) {
      addToast('Failed to load purchase orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [supRes, partsRes] = await Promise.all([
          api.get('/inventory/suppliers'),
          api.get('/inventory/parts?limit=100')
        ]);
        if (supRes.data.success && supRes.data.suppliers.length > 0) {
          setSuppliers(supRes.data.suppliers);
          setFormData((prev) => ({ ...prev, supplier: supRes.data.suppliers[0].name }));
        }
        if (partsRes.data.success && partsRes.data.parts.length > 0) {
          setParts(partsRes.data.parts);
          setFormData((prev) => ({
            ...prev,
            selectedPartId: partsRes.data.parts[0]._id,
            unitCost: partsRes.data.parts[0].unitCost
          }));
        }
      } catch (err) {}
    };
    fetchMeta();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const selectedPartObj = parts.find((p) => p._id === formData.selectedPartId);
      const payload = {
        supplier: formData.supplier,
        expectedDeliveryDate: formData.expectedDeliveryDate,
        notes: formData.notes,
        items: [
          {
            part: selectedPartObj?._id,
            partNumber: selectedPartObj?.partNumber || 'PART-001',
            name: selectedPartObj?.name || 'Item',
            quantity: formData.quantity,
            unitCost: formData.unitCost,
            totalCost: formData.quantity * formData.unitCost
          }
        ]
      };
      const res = await api.post('/inventory/purchase-orders', payload);
      if (res.data.success) {
        addToast(`Purchase order ${res.data.order.poNumber} created`, 'success');
        setIsModalOpen(false);
        fetchOrders();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create PO', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceive = async (poId) => {
    try {
      const res = await api.patch(`/inventory/purchase-orders/${poId}/receive`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchOrders();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to receive goods', 'error');
    }
  };

  const columns = [
    {
      key: 'poNumber',
      label: 'PO Number',
      render: (row) => <span style={{ fontWeight: 600, color: 'var(--brand-amber)' }}>{row.poNumber}</span>
    },
    { key: 'supplier', label: 'Supplier' },
    {
      key: 'orderDate',
      label: 'Order Date',
      render: (row) => new Date(row.orderDate).toLocaleDateString()
    },
    {
      key: 'expectedDeliveryDate',
      label: 'Expected Delivery',
      render: (row) => new Date(row.expectedDeliveryDate).toLocaleDateString()
    },
    {
      key: 'totalAmount',
      label: 'Total Value',
      render: (row) => `₹${(row.totalAmount || 0).toLocaleString('en-IN')}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        canManage && row.status !== 'Received' ? (
          <button
            onClick={() => handleReceive(row._id)}
            className="btn btn-sm btn-primary"
            title="Receive Goods & Increment Inventory"
          >
            <CheckCircle2 size={14} /> Receive Goods
          </button>
        ) : (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Received</span>
        )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Procurement & Purchase Orders</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Manage spare parts supplier purchase orders, delivery schedules, and receipt intake
          </p>
        </div>
        {canManage && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <PlusCircle size={16} /> Create Purchase Order
          </button>
        )}
      </div>

      <div className="table-card">
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          emptyTitle="No purchase orders found"
          emptyDescription="Create a purchase order to replenish mining parts stock."
          page={page}
          pages={pages}
          total={total}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Procurement Purchase Order"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Select OEM Supplier *</label>
              <select
                required
                className="form-select"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              >
                {suppliers.map((s) => (
                  <option key={s._id} value={s.name}>
                    {s.name} ({s.contactPerson})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Part to Order *</label>
              <select
                required
                className="form-select"
                value={formData.selectedPartId}
                onChange={(e) => {
                  const selected = parts.find((p) => p._id === e.target.value);
                  setFormData({
                    ...formData,
                    selectedPartId: e.target.value,
                    unitCost: selected?.unitCost || 1000
                  });
                }}
              >
                {parts.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.partNumber} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity to Order *</label>
              <input
                type="number"
                required
                min="1"
                className="form-input"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Negotiated Unit Cost (₹) *</label>
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
              <label className="form-label">Expected Delivery Date *</label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Creating...' : 'Submit Purchase Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PurchaseOrders;
