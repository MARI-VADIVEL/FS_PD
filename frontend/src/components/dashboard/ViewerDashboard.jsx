import React from 'react';
import StatCard from '../common/StatCard';
import EquipmentStatusChart from '../charts/EquipmentStatusChart';
import CostTrendChart from '../charts/CostTrendChart';
import { Activity, Truck, Wrench, Disc, AlertTriangle, Eye, Shield } from 'lucide-react';

const ViewerDashboard = ({ stats, charts, recentWorkOrders }) => {
  return (
    <div className="dashboard-view">
      {/* Title & Read-Only Banner */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
            Operations Overview
          </h1>
          <p className="page-subtitle" style={{ color: '#94a3b8' }}>
            Executive read-only overview of fleet operations, maintenance status, and tyre lifecycle.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', fontSize: '0.875rem' }}>
          <Eye size={16} /> Read-Only Profile Mode
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-3" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <StatCard title="Fleet Availability" value={`${stats.equipmentAvailability || 92.5}%`} icon={Activity} color="green" subtitle="Operational target 90%" />
        <StatCard title="Equipment Count" value={stats.totalEquipment || 0} icon={Truck} color="blue" subtitle={`${stats.activeEquipment || 0} Active`} />
        <StatCard title="Open Work Orders" value={stats.openWorkOrders || 0} icon={Wrench} color="amber" subtitle="Active maintenance" />
        <StatCard title="Maintenance Status" value={`${stats.maintenanceCompliance || 95}%`} icon={Shield} color="green" subtitle="Schedule compliance" />
        <StatCard title="Tyre Status" value={`${stats.installedTyres || 0} Fitted`} icon={Disc} color="purple" subtitle="In-service OTR tyres" />
        <StatCard title="Critical Alerts" value={stats.criticalAlertsCount || 0} icon={AlertTriangle} color="red" subtitle="Active notifications" />
      </div>

      {/* Charts & Read-only widgets */}
      <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Fleet Operating Status</h3>
          <EquipmentStatusChart data={charts?.equipmentStatusChart || []} />
        </div>

        <div className="card">
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Maintenance Spend Overview</h3>
          <CostTrendChart data={charts?.monthlyCostTrends || []} />
        </div>
      </div>

      <div className="card">
        <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Work Orders Summary</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>WO #</th>
                <th>Equipment</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(recentWorkOrders || []).map((wo) => (
                <tr key={wo._id}>
                  <td style={{ fontWeight: 600, color: '#f8fafc' }}>{wo.workOrderNumber}</td>
                  <td>{wo.equipment?.assetNumber || 'CAT-797F'}</td>
                  <td><span className="badge badge-blue">{wo.priority}</span></td>
                  <td><span className="badge badge-green">{wo.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewerDashboard;
