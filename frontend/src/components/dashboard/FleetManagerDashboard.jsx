import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../common/StatCard';
import EquipmentStatusChart from '../charts/EquipmentStatusChart';
import DowntimeChart from '../charts/DowntimeChart';
import { Truck, CheckCircle2, PlayCircle, Wrench, AlertTriangle, Activity, Clock, Plus, AlertOctagon } from 'lucide-react';

const FleetManagerDashboard = ({ stats, charts, recentWorkOrders }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-view">
      {/* Title & Banner */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
            Fleet Operations Dashboard
          </h1>
          <p className="page-subtitle" style={{ color: '#94a3b8' }}>
            Mining fleet availability, machine status tracking, utilization efficiency, and downtime performance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/equipment')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Add Equipment
          </button>
          <button onClick={() => navigate('/work-orders')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertOctagon size={16} /> Report Breakdown
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-4" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <StatCard title="Total Equipment" value={stats.totalEquipment || 0} icon={Truck} color="blue" subtitle="Heavy Mining Fleet" onClick={() => navigate('/equipment')} />
        <StatCard title="Available Equipment" value={stats.availableEquipment || 0} icon={CheckCircle2} color="green" subtitle="Ready for dispatch" onClick={() => navigate('/equipment')} />
        <StatCard title="Equipment Running" value={stats.activeEquipment || 0} icon={PlayCircle} color="blue" subtitle="Active in pit" onClick={() => navigate('/equipment')} />
        <StatCard title="Under Maintenance" value={stats.underMaintenanceEquipment || 0} icon={Wrench} color="amber" subtitle="Workshop scheduled" onClick={() => navigate('/equipment')} />
        <StatCard title="Equipment Breakdown" value={stats.breakdownEquipment || 0} icon={AlertTriangle} color="red" subtitle="Unplanned outage" onClick={() => navigate('/equipment')} />
        <StatCard title="Fleet Availability" value={`${stats.equipmentAvailability || 92.5}%`} icon={Activity} color="green" subtitle="Target > 90%" onClick={() => navigate('/reports')} />
        <StatCard title="Fleet Utilization" value={`${stats.fleetUtilization || 85.0}%`} icon={Activity} color="blue" subtitle="Shift operating hours" onClick={() => navigate('/reports')} />
        <StatCard title="Total Downtime" value={`${stats.totalDowntimeHours || 148} hrs`} icon={Clock} color="red" subtitle="Cumulative lost hours" onClick={() => navigate('/reports')} />
      </div>

      {/* Main Fleet Widgets */}
      <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Equipment Status Chart */}
        <div className="card">
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Fleet Operating Status</h3>
          <EquipmentStatusChart data={charts?.equipmentStatusChart || []} />
        </div>

        {/* Downtime Breakdown */}
        <div className="card">
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Fleet Downtime Causes</h3>
          <DowntimeChart data={charts?.downtimeChartData || []} />
        </div>
      </div>

      {/* Active Maintenance Requests */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600 }}>Active Fleet Maintenance Requests</h3>
          <button onClick={() => navigate('/equipment')} className="btn btn-sm btn-outline">View Equipment List</button>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>WO #</th>
                <th>Equipment</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Reported Date</th>
              </tr>
            </thead>
            <tbody>
              {(recentWorkOrders || []).map((wo) => (
                <tr key={wo._id} onClick={() => navigate(`/work-orders/${wo._id}`)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 600, color: '#f8fafc' }}>{wo.workOrderNumber}</td>
                  <td>{wo.equipment?.assetNumber || 'CAT-797F'}</td>
                  <td>
                    <span className={`badge ${wo.priority === 'Critical' ? 'badge-red' : 'badge-amber'}`}>{wo.priority}</span>
                  </td>
                  <td><span className="badge badge-blue">{wo.status}</span></td>
                  <td>{new Date(wo.createdAt || Date.now()).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FleetManagerDashboard;
