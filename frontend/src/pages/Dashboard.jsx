import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import EquipmentStatusChart from '../components/charts/EquipmentStatusChart';
import CostTrendChart from '../components/charts/CostTrendChart';
import TyreHealthChart from '../components/charts/TyreHealthChart';
import DowntimeChart from '../components/charts/DowntimeChart';
import {
  Truck,
  Disc,
  Wrench,
  AlertOctagon,
  Percent,
  CircleDollarSign,
  Boxes,
  Clock,
  RotateCw,
  PlusCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !data) {
    return <LoadingSpinner message="Calculating fleet analytics & maintenance KPIs..." />;
  }

  const { stats, charts, recentWorkOrders, recentAlerts } = data;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Executive Operations & Maintenance Dashboard</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time mining fleet availability, heavy OTR tyre health indices, and work order operations
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/work-orders')} className="btn btn-primary">
            <PlusCircle size={16} /> New Work Order
          </button>
          <button onClick={fetchStats} className="btn btn-secondary">
            <RotateCw size={16} /> Refresh Metrics
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Fleet Availability"
          value={`${stats.equipmentAvailability}%`}
          subValue={`${stats.activeEquipment} Active / ${stats.totalEquipment} Total`}
          icon={Percent}
          iconBg="rgba(16, 185, 129, 0.12)"
          iconColor="var(--status-active)"
          onClick={() => navigate('/equipment')}
        />
        <StatCard
          title="Active Equipment"
          value={stats.activeEquipment}
          subValue={`${stats.underMaintenanceEquipment} Maint / ${stats.breakdownEquipment} Breakdown`}
          icon={Truck}
          onClick={() => navigate('/equipment')}
        />
        <StatCard
          title="In-Service Tyres"
          value={stats.installedTyres}
          subValue={`${stats.tyresNeedingReplacement} Critical / ${stats.totalTyres} Total`}
          icon={Disc}
          iconBg="rgba(59, 130, 246, 0.12)"
          iconColor="var(--brand-blue)"
          onClick={() => navigate('/tyres')}
        />
        <StatCard
          title="Open Work Orders"
          value={stats.openWorkOrders}
          subValue={`${stats.overdueWorkOrders} Overdue`}
          icon={Wrench}
          iconBg={stats.overdueWorkOrders > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)'}
          iconColor={stats.overdueWorkOrders > 0 ? 'var(--status-danger)' : 'var(--brand-amber)'}
          onClick={() => navigate('/work-orders')}
        />
        <StatCard
          title="Total Maintenance Spend"
          value={`₹${(stats.totalMaintenanceCost || 0).toLocaleString('en-IN')}`}
          subValue={`Parts: ₹${(stats.totalPartsCost || 0).toLocaleString('en-IN')}`}
          icon={CircleDollarSign}
          onClick={() => navigate('/reports')}
        />
        <StatCard
          title="Spare Parts Valuation"
          value={`₹${(stats.sparePartsValue || 0).toLocaleString('en-IN')}`}
          subValue={`${stats.lowStockCount} items at low stock`}
          icon={Boxes}
          iconBg={stats.lowStockCount > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(6, 182, 212, 0.12)'}
          iconColor={stats.lowStockCount > 0 ? 'var(--brand-amber)' : 'var(--status-info)'}
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="Mean Time Between Failures"
          value={`${stats.mtbf} hrs`}
          subValue={`MTTR: ${stats.mttr} hrs`}
          icon={Clock}
          onClick={() => navigate('/reports')}
        />
        <StatCard
          title="Critical Alerts"
          value={stats.criticalAlertsCount}
          subValue="Requires Immediate Attention"
          icon={AlertOctagon}
          iconBg="rgba(239, 68, 68, 0.15)"
          iconColor="var(--status-danger)"
          onClick={() => navigate('/alerts')}
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="card-header">
            <span className="card-title">Fleet Operating Status Breakdown</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time</span>
          </div>
          <EquipmentStatusChart data={charts.equipmentStatusChart} />
        </div>

        <div className="chart-card">
          <div className="card-header">
            <span className="card-title">Maintenance Cost Distribution (Monthly)</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Parts vs Labor</span>
          </div>
          <CostTrendChart data={charts.monthlyCostTrends} />
        </div>

        <div className="chart-card">
          <div className="card-header">
            <span className="card-title">Heavy OTR Tyre Condition Distribution</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Physical Inspections</span>
          </div>
          <TyreHealthChart data={charts.tyreConditionStats} />
        </div>

        <div className="chart-card">
          <div className="card-header">
            <span className="card-title">Equipment Downtime Hours by Category</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Root Cause Analysis</span>
          </div>
          <DowntimeChart data={charts.downtimeChartData} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        <div className="table-card">
          <div className="table-toolbar">
            <span className="card-title">Recent Work Orders</span>
            <button onClick={() => navigate('/work-orders')} className="btn btn-secondary btn-sm">
              View All <ExternalLink size={14} />
            </button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>WO Number</th>
                  <th>Equipment</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentWorkOrders.map((wo) => (
                  <tr
                    key={wo._id}
                    onClick={() => navigate(`/work-orders/${wo._id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--brand-amber)' }}>{wo.workOrderNumber}</td>
                    <td>{wo.equipment ? `${wo.equipment.equipmentId} (${wo.equipment.model})` : 'N/A'}</td>
                    <td><StatusBadge status={wo.priority} /></td>
                    <td><StatusBadge status={wo.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-card">
          <div className="table-toolbar">
            <span className="card-title">
              <ShieldAlert size={18} color="var(--status-danger)" /> Critical Safety & Asset Alerts
            </span>
            <button onClick={() => navigate('/alerts')} className="btn btn-secondary btn-sm">
              View All <ExternalLink size={14} />
            </button>
          </div>
          <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No active critical alerts
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert._id}
                  onClick={() => navigate('/alerts')}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '4px solid var(--status-danger)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{alert.title}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {alert.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
