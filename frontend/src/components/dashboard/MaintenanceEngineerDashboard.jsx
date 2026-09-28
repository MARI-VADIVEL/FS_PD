import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../common/StatCard';
import DowntimeChart from '../charts/DowntimeChart';
import { Wrench, Stethoscope, AlertTriangle, Clock, CalendarClock, Boxes, Activity, Plus } from 'lucide-react';

const MaintenanceEngineerDashboard = ({ stats, charts, recentWorkOrders, lowStockParts }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-view">
      {/* Title & Banner */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
            Maintenance Engineering Dashboard
          </h1>
          <p className="page-subtitle" style={{ color: '#94a3b8' }}>
            Equipment diagnostics, root-cause breakdown analysis, corrective maintenance planning, and spare parts engineering.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/work-orders')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Stethoscope size={16} /> Diagnose Equipment
          </button>
          <button onClick={() => navigate('/work-orders')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Corrective Work Order
          </button>
          <button onClick={() => navigate('/inventory')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Boxes size={16} /> Request Parts
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-4" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <StatCard title="Assigned Work Orders" value={stats.openWorkOrders || 0} icon={Wrench} color="blue" subtitle="Under engineering review" onClick={() => navigate('/work-orders')} />
        <StatCard title="Critical Equipment" value={stats.breakdownEquipment || 0} icon={AlertTriangle} color="red" subtitle="Breakdown status" onClick={() => navigate('/equipment')} />
        <StatCard title="Under Repair" value={stats.underMaintenanceEquipment || 0} icon={Activity} color="amber" subtitle="Active workshop jobs" onClick={() => navigate('/equipment')} />
        <StatCard title="Pending Diagnosis" value={stats.pendingDiagnosisCount || 0} icon={Stethoscope} color="purple" subtitle="Needs engineering inspection" onClick={() => navigate('/work-orders')} />
        <StatCard title="PM Due" value={stats.overdueWorkOrders || 0} icon={CalendarClock} color="amber" subtitle="Preventive maintenance due" onClick={() => navigate('/pm-schedules')} />
        <StatCard title="Avg Repair Time" value={`${stats.mttr || 3.8} hrs`} icon={Clock} color="green" subtitle="Engineering MTTR" onClick={() => navigate('/reports')} />
        <StatCard title="Breakdown Count" value={stats.breakdownEquipment || 0} icon={AlertTriangle} color="red" subtitle="Unscheduled outages" onClick={() => navigate('/reports')} />
        <StatCard title="Parts Required" value={stats.lowStockCount || 0} icon={Boxes} color="blue" subtitle="Pending allocations" onClick={() => navigate('/inventory')} />
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Active Work Orders & Diagnosis */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600 }}>Equipment Requiring Technical Diagnosis</h3>
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
                </tr>
              </thead>
              <tbody>
                {(recentWorkOrders || []).map((wo) => (
                  <tr key={wo._id} onClick={() => navigate(`/work-orders/${wo._id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{wo.workOrderNumber}</td>
                    <td>{wo.equipment?.assetNumber || 'HEX-9800'}</td>
                    <td><span className="badge badge-amber">{wo.priority}</span></td>
                    <td><span className="badge badge-blue">{wo.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Root Causes / Downtime */}
        <div className="card">
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Breakdown Root Causes by System</h3>
          <DowntimeChart data={charts?.downtimeChartData || []} />
        </div>
      </div>
    </div>
  );
};

export default MaintenanceEngineerDashboard;
