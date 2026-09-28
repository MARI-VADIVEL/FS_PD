import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../common/StatCard';
import CostTrendChart from '../charts/CostTrendChart';
import DowntimeChart from '../charts/DowntimeChart';
import { Wrench, AlertOctagon, Truck, Clock, CheckCircle2, DollarSign, Activity, CalendarClock, Plus, ArrowRight } from 'lucide-react';

const MaintenanceManagerDashboard = ({ stats, charts, recentWorkOrders }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-view">
      {/* Title & Banner */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
            Maintenance Management Dashboard
          </h1>
          <p className="page-subtitle" style={{ color: '#94a3b8' }}>
            Work order execution, technician assignments, downtime tracking, and preventive maintenance compliance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/work-orders')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> New Work Order
          </button>
          <button onClick={() => navigate('/pm-schedules')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarClock size={16} /> Schedule Maintenance
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-4" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <StatCard title="Open Work Orders" value={stats.openWorkOrders || 0} icon={Wrench} color="blue" subtitle={`${stats.overdueWorkOrders || 0} Overdue`} onClick={() => navigate('/work-orders')} />
        <StatCard title="Overdue Maintenance" value={stats.overdueWorkOrders || 0} icon={AlertOctagon} color="red" subtitle="Requires immediate action" onClick={() => navigate('/work-orders')} />
        <StatCard title="Under Maintenance" value={stats.underMaintenanceEquipment || 0} icon={Truck} color="amber" subtitle="Currently in workshop" onClick={() => navigate('/equipment')} />
        <StatCard title="Critical Breakdowns" value={stats.breakdownEquipment || 0} icon={Activity} color="red" subtitle="Unplanned downtime" onClick={() => navigate('/equipment')} />
        <StatCard title="PM Compliance" value={`${stats.maintenanceCompliance || 94.5}%`} icon={CheckCircle2} color="green" subtitle="Schedule target > 90%" onClick={() => navigate('/pm-schedules')} />
        <StatCard title="Maintenance Cost" value={`$${(stats.totalMaintenanceCost || 0).toLocaleString()}`} icon={DollarSign} color="purple" subtitle="Labor + Parts" onClick={() => navigate('/reports')} />
        <StatCard title="MTTR" value={`${stats.mttr || 4.2} hrs`} icon={Clock} color="amber" subtitle="Mean Time To Repair" onClick={() => navigate('/reports')} />
        <StatCard title="MTBF" value={`${stats.mtbf || 142} hrs`} icon={Clock} color="green" subtitle="Mean Time Between Failures" onClick={() => navigate('/reports')} />
      </div>

      {/* Main Widgets */}
      <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Active & Overdue Work Orders */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600 }}>Work Orders Needing Attention</h3>
            <button onClick={() => navigate('/work-orders')} className="btn btn-sm btn-outline">View All</button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>WO Number</th>
                  <th>Equipment</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Technician</th>
                </tr>
              </thead>
              <tbody>
                {(recentWorkOrders || []).map((wo) => (
                  <tr key={wo._id} onClick={() => navigate(`/work-orders/${wo._id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{wo.workOrderNumber}</td>
                    <td>{wo.equipment?.assetNumber || 'CAT-797F'}</td>
                    <td>
                      <span className={`badge ${wo.priority === 'Critical' ? 'badge-red' : wo.priority === 'High' ? 'badge-amber' : 'badge-blue'}`}>
                        {wo.priority}
                      </span>
                    </td>
                    <td><span className="badge badge-green">{wo.status}</span></td>
                    <td>{wo.assignedTechnician?.name || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Equipment Downtime Category Chart */}
        <div className="card">
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Equipment Downtime Breakdown (Hours)</h3>
          <DowntimeChart data={charts?.downtimeChartData || []} />
        </div>
      </div>

      {/* Cost Trends */}
      <div className="card">
        <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Monthly Maintenance Cost Trends</h3>
        <CostTrendChart data={charts?.monthlyCostTrends || []} />
      </div>
    </div>
  );
};

export default MaintenanceManagerDashboard;
