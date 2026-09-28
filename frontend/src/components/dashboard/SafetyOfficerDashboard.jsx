import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../common/StatCard';
import { ShieldCheck, AlertOctagon, AlertTriangle, ClipboardList, Disc, CheckCircle2, ShieldAlert, Plus, RotateCw } from 'lucide-react';

const SafetyOfficerDashboard = ({ stats, recentAlerts, recentInspections }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-view">
      {/* Title & Banner */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
            Safety & Inspection Dashboard
          </h1>
          <p className="page-subtitle" style={{ color: '#94a3b8' }}>
            Mining site safety compliance, OTR tyre inspection audits, equipment hazard tracking, and critical defect logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/tyre-workflows')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RotateCw size={16} /> New Safety Inspection
          </button>
          <button onClick={() => navigate('/alerts')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} /> Report Safety Hazard
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-4" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <StatCard title="Pending Inspections" value={stats.pendingInspectionsCount || 4} icon={ClipboardList} color="amber" subtitle="Inspection due" onClick={() => navigate('/tyre-workflows')} />
        <StatCard title="Failed Inspections" value={stats.failedInspectionsCount || 1} icon={AlertOctagon} color="red" subtitle="Action required" onClick={() => navigate('/tyre-workflows')} />
        <StatCard title="Critical Defects" value={stats.criticalDefectsCount || 2} icon={ShieldAlert} color="red" subtitle="Immediate danger flag" onClick={() => navigate('/tyres')} />
        <StatCard title="Open Safety Issues" value={stats.criticalAlertsCount || 3} icon={AlertTriangle} color="amber" subtitle="Unresolved hazards" onClick={() => navigate('/alerts')} />
        <StatCard title="Safety Compliance" value={`${stats.safetyCompliance || 96.8}%`} icon={ShieldCheck} color="green" subtitle="Site audit score" onClick={() => navigate('/reports')} />
        <StatCard title="Tyre Inspection Issues" value={stats.tyresNeedingInspection || 5} icon={Disc} color="purple" subtitle="Tread/Pressure flags" onClick={() => navigate('/tyres')} />
        <StatCard title="Overdue Inspections" value={1} icon={ClipboardList} color="red" subtitle="Past audit interval" onClick={() => navigate('/tyre-workflows')} />
        <StatCard title="Safety Alerts" value={stats.totalUnreadAlerts || 6} icon={AlertTriangle} color="red" subtitle="Active notifications" onClick={() => navigate('/alerts')} />
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-2" style={{ gap: '1.5rem' }}>
        {/* Failed & Critical Inspection Logs */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600 }}>Recent Tyre & Equipment Inspections</h3>
            <button onClick={() => navigate('/tyre-workflows')} className="btn btn-sm btn-outline">Perform Inspection</button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tyre / Equipment</th>
                  <th>PSI / Depth</th>
                  <th>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {(recentInspections || []).slice(0, 5).map((insp, i) => (
                  <tr key={insp._id || i}>
                    <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{new Date(insp.inspectionDate || Date.now()).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{insp.tyre?.tyreId || 'TY-1088'}</td>
                    <td>{insp.pressure} PSI / {insp.treadDepth} mm</td>
                    <td>
                      <span className={`badge ${insp.recommendation === 'Scrap' || insp.recommendation === 'Repair' ? 'badge-red' : 'badge-green'}`}>
                        {insp.recommendation || 'Continue Service'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Safety Alerts */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600 }}>Active Safety Alerts & Defects</h3>
            <button onClick={() => navigate('/alerts')} className="btn btn-sm btn-outline">Alerts Center</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(recentAlerts || []).slice(0, 4).map((alert, i) => (
              <div key={alert._id || i} style={{ padding: '0.75rem 1rem', backgroundColor: '#1e293b', borderRadius: '6px', borderLeft: '4px solid #ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

export default SafetyOfficerDashboard;
