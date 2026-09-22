import React, { useState, useEffect } from 'react';
import api from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { useToast } from '../context/ToastContext';
import {
  FileBarChart2,
  Download,
  Calendar,
  Printer,
  Filter
} from 'lucide-react';

const Reports = () => {
  const [reportType, setReportType] = useState('equipment');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ reportType });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/reports?${params.toString()}`);
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      addToast('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleExportCSV = () => {
    const params = new URLSearchParams({ reportType, format: 'csv' });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const token = localStorage.getItem('mining_token');
    const exportUrl = `${api.defaults.baseURL}/reports?${params.toString()}`;

    fetch(exportUrl, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-operational-report.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        addToast('CSV export downloaded successfully', 'success');
      })
      .catch(() => {
        addToast('Failed to export CSV', 'error');
      });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Operational Reports & Analytics Intelligence</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Generate executive fleet performance, cost expenditure, and tyre lifecycle CSV exports
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => window.print()} className="btn btn-secondary">
            <Printer size={16} /> Print Report
          </button>
          <button onClick={handleExportCSV} className="btn btn-primary">
            <Download size={16} /> Export to CSV
          </button>
        </div>
      </div>

      <div className="tab-nav">
        <button
          onClick={() => setReportType('equipment')}
          className={`tab-btn ${reportType === 'equipment' ? 'active' : ''}`}
        >
          Fleet Equipment
        </button>
        <button
          onClick={() => setReportType('maintenance')}
          className={`tab-btn ${reportType === 'maintenance' ? 'active' : ''}`}
        >
          Maintenance Work Orders & Cost
        </button>
        <button
          onClick={() => setReportType('tyres')}
          className={`tab-btn ${reportType === 'tyres' ? 'active' : ''}`}
        >
          OTR Tyre Performance & Cost/Hr
        </button>
        <button
          onClick={() => setReportType('inventory')}
          className={`tab-btn ${reportType === 'inventory' ? 'active' : ''}`}
        >
          Spare Parts Valuation
        </button>
        <button
          onClick={() => setReportType('downtime')}
          className={`tab-btn ${reportType === 'downtime' ? 'active' : ''}`}
        >
          Downtime Breakdown
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <Calendar size={16} color="var(--brand-amber)" />
              <span>From:</span>
              <input
                type="date"
                className="form-input"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span>To:</span>
              <input
                type="date"
                className="form-input"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button onClick={fetchReport} className="btn btn-secondary btn-sm">
              <Filter size={14} /> Filter
            </button>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Total Records: <strong>{reportData?.count || 0}</strong>
          </span>
        </div>

        {loading || !reportData ? (
          <LoadingSpinner message="Synthesizing operational datasets..." />
        ) : (
          <div className="table-wrapper">
            {reportType === 'equipment' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Equipment ID</th>
                    <th>Asset Tag</th>
                    <th>Type</th>
                    <th>Model</th>
                    <th>Operating Hours</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Next PM Due</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.map((e) => (
                    <tr key={e._id}>
                      <td style={{ fontWeight: 600, color: 'var(--brand-amber)' }}>{e.equipmentId}</td>
                      <td>{e.assetNumber}</td>
                      <td>{e.equipmentType}</td>
                      <td>{e.model}</td>
                      <td style={{ fontWeight: 600 }}>{(e.operatingHours || 0).toLocaleString()} hrs</td>
                      <td>{e.location}</td>
                      <td><StatusBadge status={e.status} /></td>
                      <td>{e.nextServiceDate ? new Date(e.nextServiceDate).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'maintenance' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>WO Number</th>
                    <th>Equipment</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Scheduled Date</th>
                    <th>Status</th>
                    <th>Labor Cost</th>
                    <th>Parts Cost</th>
                    <th>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.map((w) => (
                    <tr key={w._id}>
                      <td style={{ fontWeight: 600, color: 'var(--brand-amber)' }}>{w.workOrderNumber}</td>
                      <td>{w.equipment?.equipmentId || 'N/A'}</td>
                      <td>{w.maintenanceType}</td>
                      <td><StatusBadge status={w.priority} /></td>
                      <td>{new Date(w.scheduledDate).toLocaleDateString()}</td>
                      <td><StatusBadge status={w.status} /></td>
                      <td>₹{(w.actualLaborCost || 0).toLocaleString('en-IN')}</td>
                      <td>₹{(w.actualPartsCost || 0).toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 700, color: 'var(--brand-amber)' }}>
                        ₹{(w.actualCost || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'tyres' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tyre ID</th>
                    <th>Serial #</th>
                    <th>Brand & Size</th>
                    <th>Current Machine</th>
                    <th>Status</th>
                    <th>Tread Depth</th>
                    <th>Total Hours</th>
                    <th>Cost Per Hour</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.map((t) => (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 600, color: 'var(--brand-amber)' }}>{t.tyreId}</td>
                      <td>{t.serialNumber}</td>
                      <td>{t.brand} {t.tyreSize}</td>
                      <td>{t.assignedEquipment ? t.assignedEquipment.equipmentId : 'In Stock'}</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td style={{ fontWeight: 600 }}>{t.currentTreadDepth} mm</td>
                      <td>{(t.currentOperatingHours || 0).toLocaleString()} hrs</td>
                      <td style={{ fontWeight: 700, color: 'var(--brand-amber)' }}>₹{t.costPerHour || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'inventory' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Part Number</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Manufacturer</th>
                    <th>Stock Qty</th>
                    <th>Unit Cost</th>
                    <th>Total Holding Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.map((p) => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 600, color: 'var(--brand-amber)' }}>{p.partNumber}</td>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>{p.manufacturer}</td>
                      <td style={{ fontWeight: 700 }}>{p.quantity} {p.unit}</td>
                      <td>₹{(p.unitCost || 0).toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 700, color: 'var(--brand-amber)' }}>
                        ₹{((p.quantity || 0) * (p.unitCost || 0)).toLocaleString('en-IN')}
                      </td>
                      <td><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'downtime' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Equipment Asset</th>
                    <th>Category</th>
                    <th>Reason / Failure Root</th>
                    <th>Start Timestamp</th>
                    <th>End Timestamp</th>
                    <th>Duration Hours</th>
                    <th>Impact Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.map((d) => (
                    <tr key={d._id}>
                      <td style={{ fontWeight: 600, color: 'var(--brand-amber)' }}>
                        {d.equipment ? `${d.equipment.equipmentId} (${d.equipment.model})` : 'N/A'}
                      </td>
                      <td style={{ fontWeight: 600 }}>{d.category}</td>
                      <td>{d.reason}</td>
                      <td>{new Date(d.startTime).toLocaleString()}</td>
                      <td>{d.endTime ? new Date(d.endTime).toLocaleString() : 'Ongoing'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--status-danger)' }}>{d.durationHours || 0} hrs</td>
                      <td><StatusBadge status={d.impactLevel} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
