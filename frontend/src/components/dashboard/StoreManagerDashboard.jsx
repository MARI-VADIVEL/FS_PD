import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../common/StatCard';
import { Boxes, DollarSign, AlertTriangle, ShoppingCart, ArrowDownRight, ArrowUpRight, Plus, Truck, PackageCheck } from 'lucide-react';

const StoreManagerDashboard = ({ stats, lowStockParts, recentPurchaseOrders }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-view">
      {/* Title & Banner */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
            Spare Parts & Inventory Dashboard
          </h1>
          <p className="page-subtitle" style={{ color: '#94a3b8' }}>
            Mining warehouse management, spare parts stock levels, reorder alerts, and purchase orders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/inventory')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Add Spare Part
          </button>
          <button onClick={() => navigate('/inventory')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowDownRight size={16} /> Stock In / Out
          </button>
          <button onClick={() => navigate('/purchase-orders')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={16} /> Create Purchase Order
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-4" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <StatCard title="Total Spare Parts" value={stats.totalSpareParts || 48} icon={Boxes} color="blue" subtitle="Warehouse SKUs" onClick={() => navigate('/inventory')} />
        <StatCard title="Total Stock Value" value={`$${(stats.sparePartsValue || 0).toLocaleString()}`} icon={DollarSign} color="green" subtitle="Valuation at unit cost" onClick={() => navigate('/inventory')} />
        <StatCard title="Low Stock Items" value={stats.lowStockCount || 0} icon={AlertTriangle} color="amber" subtitle="Below min threshold" onClick={() => navigate('/inventory')} />
        <StatCard title="Out of Stock Items" value={stats.outOfStockCount || 0} icon={AlertTriangle} color="red" subtitle="Zero quantity stock" onClick={() => navigate('/inventory')} />
        <StatCard title="Pending Purchase Orders" value={stats.pendingPurchaseOrders || 0} icon={ShoppingCart} color="purple" subtitle="Awaiting delivery" onClick={() => navigate('/purchase-orders')} />
        <StatCard title="Parts Issued" value={142} icon={ArrowUpRight} color="blue" subtitle="Issued to work orders" onClick={() => navigate('/inventory')} />
        <StatCard title="Parts Received" value={98} icon={ArrowDownRight} color="green" subtitle="Stock-in fulfilled" onClick={() => navigate('/inventory')} />
        <StatCard title="Active Suppliers" value={stats.totalSuppliers || 6} icon={Truck} color="blue" subtitle="Approved vendors" onClick={() => navigate('/purchase-orders')} />
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Low Stock Items & Reorder Recommendations */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600 }}>Low Stock & Reorder Alerts</h3>
            <button onClick={() => navigate('/inventory')} className="btn btn-sm btn-outline">View Inventory</button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Part No</th>
                  <th>Part Name</th>
                  <th>In Stock</th>
                  <th>Min Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(lowStockParts || []).slice(0, 5).map((part) => (
                  <tr key={part._id} onClick={() => navigate(`/inventory/${part._id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{part.partNumber}</td>
                    <td>{part.name}</td>
                    <td style={{ color: part.quantityInStock === 0 ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>{part.quantityInStock}</td>
                    <td>{part.minStockLevel}</td>
                    <td>
                      <span className={`badge ${part.quantityInStock === 0 ? 'badge-red' : 'badge-amber'}`}>
                        {part.quantityInStock === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Purchase Orders */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600 }}>Pending Purchase Orders</h3>
            <button onClick={() => navigate('/purchase-orders')} className="btn btn-sm btn-outline">Procurement</button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO #</th>
                  <th>Supplier</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(recentPurchaseOrders || []).slice(0, 5).map((po) => (
                  <tr key={po._id}>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{po.poNumber}</td>
                    <td>{po.supplier?.name || 'Komatsu Genuine Parts'}</td>
                    <td>${(po.totalAmount || 0).toLocaleString()}</td>
                    <td><span className="badge badge-purple">{po.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreManagerDashboard;
