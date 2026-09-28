import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../common/StatCard';
import EquipmentStatusChart from '../charts/EquipmentStatusChart';
import CostTrendChart from '../charts/CostTrendChart';
import { Users, Shield, Truck, Disc, Wrench, AlertTriangle, Activity, Sliders, UserPlus, Plus, ArrowRight } from 'lucide-react';

const SuperAdminDashboard = ({ stats, charts, recentWorkOrders, recentAlerts, recentAudits }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-view">
      {/* Title & Banner */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
            System Administration Dashboard
          </h1>
          <p className="page-subtitle" style={{ color: '#94a3b8' }}>
            Full system control, user access management, audit logs, and infrastructure metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/users')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} /> Manage Users
          </button>
          <button onClick={() => navigate('/equipment')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Add Equipment
          </button>
          <button onClick={() => navigate('/settings')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={16} /> System Settings
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-4" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <StatCard title="Total Users" value={stats.totalUsers || 8} icon={Users} color="blue" subtitle={`${stats.activeUsers || 8} Active`} onClick={() => navigate('/users')} />
        <StatCard title="Active Users" value={stats.activeUsers || 8} icon={Shield} color="green" subtitle="Authorized roles" onClick={() => navigate('/users')} />
        <StatCard title="Total Equipment" value={stats.totalEquipment || 0} icon={Truck} color="amber" subtitle={`${stats.activeEquipment || 0} Active`} onClick={() => navigate('/equipment')} />
        <StatCard title="Total Tyres" value={stats.totalTyres || 0} icon={Disc} color="purple" subtitle={`${stats.installedTyres || 0} In-Service`} onClick={() => navigate('/tyres')} />
        <StatCard title="Open Work Orders" value={stats.openWorkOrders || 0} icon={Wrench} color="blue" subtitle={`${stats.overdueWorkOrders || 0} Overdue`} onClick={() => navigate('/work-orders')} />
        <StatCard title="Low Stock Items" value={stats.lowStockCount || 0} icon={AlertTriangle} color="red" subtitle="Requires reorder" onClick={() => navigate('/inventory')} />
        <StatCard title="Critical Alerts" value={stats.criticalAlertsCount || 0} icon={AlertTriangle} color="red" subtitle="Unresolved" onClick={() => navigate('/alerts')} />
        <StatCard title="System Activity" value={`${stats.recentAudits?.length || 100}%`} icon={Activity} color="green" subtitle="Audit logs active" onClick={() => navigate('/audit-logs')} />
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* User Activity & Audit Logs */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600 }}>Recent System Audit Logs</h3>
            <button onClick={() => navigate('/audit-logs')} className="btn btn-sm btn-outline">View All</button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {(recentAudits || []).slice(0, 5).map((log, i) => (
                  <tr key={log._id || i}>
                    <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{new Date(log.createdAt || Date.now()).toLocaleTimeString()}</td>
                    <td><span className="badge badge-blue">{log.action}</span></td>
                    <td>{log.module}</td>
                    <td>{log.user?.name || 'System Admin'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Equipment & Fleet Overview */}
        <div className="card">
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Fleet Status Breakdown</h3>
          <EquipmentStatusChart data={charts?.equipmentStatusChart || []} />
        </div>
      </div>

      {/* Maintenance & Inventory Summaries */}
      <div className="grid grid-2" style={{ gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Maintenance Spend Distribution</h3>
          <CostTrendChart data={charts?.monthlyCostTrends || []} />
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600 }}>Critical System Alerts</h3>
            <button onClick={() => navigate('/alerts')} className="btn btn-sm btn-outline">Alerts Center</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(recentAlerts || []).slice(0, 4).map((alert, i) => (
              <div key={alert._id || i} style={{ padding: '0.75rem 1rem', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{alert.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{alert.message}</div>
                </div>
                <span className="badge badge-red">{alert.severity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
