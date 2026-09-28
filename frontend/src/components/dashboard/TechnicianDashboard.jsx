import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../common/StatCard';
import { Wrench, CheckSquare, PlayCircle, CheckCircle2, Boxes, ClipboardList, RotateCw, ArrowRight } from 'lucide-react';

const TechnicianDashboard = ({ stats, myAssignedList, recentWorkOrders }) => {
  const navigate = useNavigate();

  const assignedJobs = myAssignedList?.length > 0 ? myAssignedList : recentWorkOrders || [];

  return (
    <div className="dashboard-view">
      {/* Title & Banner */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
            My Maintenance Dashboard
          </h1>
          <p className="page-subtitle" style={{ color: '#94a3b8' }}>
            Your daily assigned work orders, interactive checklists, tyre inspections, and labor logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/work-orders')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlayCircle size={16} /> My Assigned Jobs
          </button>
          <button onClick={() => navigate('/tyre-workflows')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RotateCw size={16} /> Perform Tyre Inspection
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-3" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <StatCard title="My Open Work Orders" value={stats.myOpenWorkOrders || assignedJobs.length} icon={Wrench} color="blue" subtitle="Assigned to you" onClick={() => navigate('/work-orders')} />
        <StatCard title="Critical Jobs" value={stats.overdueWorkOrders || 1} icon={CheckSquare} color="red" subtitle="High priority action required" onClick={() => navigate('/work-orders')} />
        <StatCard title="Jobs In Progress" value={stats.myJobsInProgress || 2} icon={PlayCircle} color="amber" subtitle="Active in shop" onClick={() => navigate('/work-orders')} />
        <StatCard title="Completed Today" value={stats.myCompletedToday || 4} icon={CheckCircle2} color="green" subtitle="Log hours submitted" onClick={() => navigate('/work-orders')} />
        <StatCard title="Pending Parts" value={stats.lowStockCount || 0} icon={Boxes} color="purple" subtitle="Waiting for Store Manager" onClick={() => navigate('/inventory')} />
        <StatCard title="Today's Inspections" value={stats.tyresNeedingInspection || 3} icon={ClipboardList} color="blue" subtitle="Tyre pressure & tread checks" onClick={() => navigate('/tyre-workflows')} />
      </div>

      {/* Assigned Tasks & Checklists Widget */}
      <div className="grid grid-2" style={{ gap: '1.5rem' }}>
        {/* My Assigned Work Orders */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600 }}>My Assigned Work Orders</h3>
            <button onClick={() => navigate('/work-orders')} className="btn btn-sm btn-outline">View All</button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>WO #</th>
                  <th>Equipment</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignedJobs.slice(0, 5).map((wo) => (
                  <tr key={wo._id}>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{wo.workOrderNumber}</td>
                    <td>{wo.equipment?.assetNumber || 'CAT-797F'}</td>
                    <td>
                      <span className={`badge ${wo.priority === 'Critical' ? 'badge-red' : wo.priority === 'High' ? 'badge-amber' : 'badge-blue'}`}>
                        {wo.priority}
                      </span>
                    </td>
                    <td><span className="badge badge-amber">{wo.status}</span></td>
                    <td>
                      <button onClick={() => navigate(`/work-orders/${wo._id}`)} className="btn btn-xs btn-primary">
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspection Checklist Tasks */}
        <div className="card">
          <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Today's Inspection & Maintenance Tasks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#1e293b', borderRadius: '6px', borderLeft: '4px solid #3b82f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>CAT 797F - OTR Tyre Pressure Inspection</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Inspect FL & FR Tread Depth & Cold PSI</div>
              </div>
              <button onClick={() => navigate('/tyre-workflows')} className="btn btn-xs btn-outline">Perform</button>
            </div>

            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#1e293b', borderRadius: '6px', borderLeft: '4px solid #f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>Komatsu 930E - Hydraulic Hose Replacement</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Work Order #WO-1042 - Checklist update</div>
              </div>
              <button onClick={() => navigate('/work-orders')} className="btn btn-xs btn-outline">Checklist</button>
            </div>

            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#1e293b', borderRadius: '6px', borderLeft: '4px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>Liebherr R9800 - Engine Oil Filter Service</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Record labor hours & submit result</div>
              </div>
              <button onClick={() => navigate('/work-orders')} className="btn btn-xs btn-outline">Log Hours</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
