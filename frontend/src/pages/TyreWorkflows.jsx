import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  RotateCw,
  PlusCircle,
  MinusCircle,
  ClipboardCheck,
  Disc,
  Truck,
  ArrowRight
} from 'lucide-react';

const TyreWorkflows = () => {
  const [activeWorkflow, setActiveWorkflow] = useState('install');
  const [tyres, setTyres] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [installData, setInstallData] = useState({
    tyreId: '',
    equipmentId: '',
    position: 'front-left',
    installationHours: 0,
    currentPressure: 102,
    currentTreadDepth: 90
  });

  const [rotateData, setRotateData] = useState({
    tyreId: '',
    newPosition: 'front-right',
    equipmentHours: 0,
    reason: 'Scheduled wear equalization rotation'
  });

  const [removeData, setRemoveData] = useState({
    tyreId: '',
    removalReason: 'Tread wear reached limit / scheduled overhaul',
    currentHours: 0,
    currentTreadDepth: 20,
    nextStatus: 'In Stock'
  });

  const [inspectData, setInspectData] = useState({
    tyreId: '',
    treadDepth: 65,
    pressure: 102,
    temperature: 45,
    visualCondition: 'Good',
    damageType: 'None',
    recommendation: 'Continue Service',
    notes: 'Routine walkaround pit inspection'
  });

  const loadData = async () => {
    try {
      const [tyresRes, eqRes] = await Promise.all([
        api.get('/tyres?limit=100'),
        api.get('/equipment?limit=100')
      ]);
      if (tyresRes.data.success) {
        setTyres(tyresRes.data.tyres || []);
        if (tyresRes.data.tyres.length > 0) {
          const firstTyre = tyresRes.data.tyres[0];
          setInstallData((prev) => ({ ...prev, tyreId: firstTyre._id }));
          setRotateData((prev) => ({ ...prev, tyreId: firstTyre._id }));
          setRemoveData((prev) => ({ ...prev, tyreId: firstTyre._id }));
          setInspectData((prev) => ({ ...prev, tyreId: firstTyre._id }));
        }
      }
      if (eqRes.data.success) {
        setEquipments(eqRes.data.equipments || []);
        if (eqRes.data.equipments.length > 0) {
          setInstallData((prev) => ({ ...prev, equipmentId: eqRes.data.equipments[0]._id }));
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInstallSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/tyres/install', installData);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        loadData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to install tyre', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRotateSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/tyres/rotate', rotateData);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        loadData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to rotate tyre', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/tyres/remove', removeData);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        loadData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to remove tyre', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInspectSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/tyres/inspect', inspectData);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        loadData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to record inspection', 'error');
    } finally {
      setLoading(false);
    }
  };

  const installedTyres = tyres.filter((t) => t.status === 'Installed');
  const stockTyres = tyres.filter((t) => t.status === 'In Stock');

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Heavy OTR Tyre Field Operations & Maintenance Workflows</h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Execute equipment fitment, cross-axle tyre rotation, dismount removals, and safety inspections
        </p>
      </div>

      <div className="tab-nav">
        <button
          onClick={() => setActiveWorkflow('install')}
          className={`tab-btn ${activeWorkflow === 'install' ? 'active' : ''}`}
        >
          <PlusCircle size={16} style={{ display: 'inline', marginRight: '0.4rem' }} /> Fit / Install Tyre
        </button>
        <button
          onClick={() => setActiveWorkflow('rotate')}
          className={`tab-btn ${activeWorkflow === 'rotate' ? 'active' : ''}`}
        >
          <RotateCw size={16} style={{ display: 'inline', marginRight: '0.4rem' }} /> Rotate Positions
        </button>
        <button
          onClick={() => setActiveWorkflow('inspect')}
          className={`tab-btn ${activeWorkflow === 'inspect' ? 'active' : ''}`}
        >
          <ClipboardCheck size={16} style={{ display: 'inline', marginRight: '0.4rem' }} /> Record Inspection
        </button>
        <button
          onClick={() => setActiveWorkflow('remove')}
          className={`tab-btn ${activeWorkflow === 'remove' ? 'active' : ''}`}
        >
          <MinusCircle size={16} style={{ display: 'inline', marginRight: '0.4rem' }} /> Dismount / Remove
        </button>
      </div>

      <div className="table-card" style={{ maxWidth: '780px', padding: '2rem' }}>
        {activeWorkflow === 'install' && (
          <form onSubmit={handleInstallSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600 }}>
              Mount & Install Tyre onto Mining Equipment
            </h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Select Unmounted Tyre (From Stock) *</label>
                <select
                  required
                  className="form-select"
                  value={installData.tyreId}
                  onChange={(e) => setInstallData({ ...installData, tyreId: e.target.value })}
                >
                  {stockTyres.length === 0 ? (
                    <option value="">No unmounted tyres in stock</option>
                  ) : (
                    stockTyres.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.tyreId} - {t.brand} {t.tyreSize} ({t.currentTreadDepth}mm tread remaining)
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Target Equipment *</label>
                <select
                  required
                  className="form-select"
                  value={installData.equipmentId}
                  onChange={(e) => setInstallData({ ...installData, equipmentId: e.target.value })}
                >
                  {equipments.map((eq) => (
                    <option key={eq._id} value={eq._id}>
                      {eq.equipmentId} - {eq.manufacturer} {eq.model} ({eq.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Wheel Position *</label>
                <select
                  className="form-select"
                  value={installData.position}
                  onChange={(e) => setInstallData({ ...installData, position: e.target.value })}
                >
                  <option value="front-left">Front Left (FL)</option>
                  <option value="front-right">Front Right (FR)</option>
                  <option value="rear-left-outer">Rear Left Outer (RLO)</option>
                  <option value="rear-left-inner">Rear Left Inner (RLI)</option>
                  <option value="rear-right-outer">Rear Right Outer (RRO)</option>
                  <option value="rear-right-inner">Rear Right Inner (RRI)</option>
                  <option value="spare">Spare Carrier</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cold Inflation Pressure (PSI)</label>
                <input
                  type="number"
                  className="form-input"
                  value={installData.currentPressure}
                  onChange={(e) => setInstallData({ ...installData, currentPressure: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Fitment Tread Depth (mm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={installData.currentTreadDepth}
                  onChange={(e) => setInstallData({ ...installData, currentTreadDepth: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Equipment Operating Hours at Fitment</label>
                <input
                  type="number"
                  className="form-input"
                  value={installData.installationHours}
                  onChange={(e) => setInstallData({ ...installData, installationHours: Number(e.target.value) })}
                />
              </div>
            </div>

            <button type="submit" disabled={loading || stockTyres.length === 0} className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
              {loading ? 'Recording Installation...' : 'Confirm Tyre Installation'}
            </button>
          </form>
        )}

        {activeWorkflow === 'rotate' && (
          <form onSubmit={handleRotateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600 }}>
              Rotate Tyre Position on Mining Equipment
            </h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Select Currently Installed Tyre *</label>
                <select
                  required
                  className="form-select"
                  value={rotateData.tyreId}
                  onChange={(e) => setRotateData({ ...rotateData, tyreId: e.target.value })}
                >
                  {installedTyres.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.tyreId} - {t.brand} {t.tyreSize} (Mounted on {t.assignedEquipment?.equipmentId || 'Equipment'} at {t.currentPosition})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target New Position *</label>
                <select
                  className="form-select"
                  value={rotateData.newPosition}
                  onChange={(e) => setRotateData({ ...rotateData, newPosition: e.target.value })}
                >
                  <option value="front-left">Front Left (FL)</option>
                  <option value="front-right">Front Right (FR)</option>
                  <option value="rear-left-outer">Rear Left Outer (RLO)</option>
                  <option value="rear-left-inner">Rear Left Inner (RLI)</option>
                  <option value="rear-right-outer">Rear Right Outer (RRO)</option>
                  <option value="rear-right-inner">Rear Right Inner (RRI)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Equipment Hours at Rotation</label>
                <input
                  type="number"
                  className="form-input"
                  value={rotateData.equipmentHours}
                  onChange={(e) => setRotateData({ ...rotateData, equipmentHours: Number(e.target.value) })}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Reason for Position Swap / Rotation</label>
                <input
                  type="text"
                  className="form-input"
                  value={rotateData.reason}
                  onChange={(e) => setRotateData({ ...rotateData, reason: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" disabled={loading || installedTyres.length === 0} className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
              {loading ? 'Processing Rotation...' : 'Execute Position Rotation'}
            </button>
          </form>
        )}

        {activeWorkflow === 'inspect' && (
          <form onSubmit={handleInspectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600 }}>
              Record Physical Tyre Inspection & Pressure Audit
            </h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Select Tyre Under Inspection *</label>
                <select
                  required
                  className="form-select"
                  value={inspectData.tyreId}
                  onChange={(e) => setInspectData({ ...inspectData, tyreId: e.target.value })}
                >
                  {tyres.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.tyreId} - {t.brand} {t.tyreSize} ({t.status} - {t.currentPosition || 'unassigned'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Measured Tread Depth (mm) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="form-input"
                  value={inspectData.treadDepth}
                  onChange={(e) => setInspectData({ ...inspectData, treadDepth: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Measured Pressure (PSI) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="form-input"
                  value={inspectData.pressure}
                  onChange={(e) => setInspectData({ ...inspectData, pressure: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tyre Temperature (°C)</label>
                <input
                  type="number"
                  className="form-input"
                  value={inspectData.temperature}
                  onChange={(e) => setInspectData({ ...inspectData, temperature: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Visual Condition Rating</label>
                <select
                  className="form-select"
                  value={inspectData.visualCondition}
                  onChange={(e) => setInspectData({ ...inspectData, visualCondition: e.target.value })}
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Observed Damage Category</label>
                <select
                  className="form-select"
                  value={inspectData.damageType}
                  onChange={(e) => setInspectData({ ...inspectData, damageType: e.target.value })}
                >
                  <option value="None">None</option>
                  <option value="Puncture">Puncture</option>
                  <option value="Sidewall Damage">Sidewall Damage</option>
                  <option value="Uneven Wear">Uneven Wear</option>
                  <option value="Cut">Cut</option>
                  <option value="Crack">Crack</option>
                  <option value="Heat Damage">Heat Damage</option>
                  <option value="Rim Damage">Rim Damage</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Engineering Recommendation</label>
                <select
                  className="form-select"
                  value={inspectData.recommendation}
                  onChange={(e) => setInspectData({ ...inspectData, recommendation: e.target.value })}
                >
                  <option value="Continue Service">Continue Service</option>
                  <option value="Rotate Position">Rotate Position</option>
                  <option value="Send for Repair">Send for Repair</option>
                  <option value="Send for Retread">Send for Retread</option>
                  <option value="Scrap Tyre">Scrap Tyre</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Inspection Notes & Findings</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  value={inspectData.notes}
                  onChange={(e) => setInspectData({ ...inspectData, notes: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
              {loading ? 'Saving Inspection...' : 'Log Inspection Record'}
            </button>
          </form>
        )}

        {activeWorkflow === 'remove' && (
          <form onSubmit={handleRemoveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600 }}>
              Dismount Tyre from Machine & Update Status
            </h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Select Mounted Tyre to Dismount *</label>
                <select
                  required
                  className="form-select"
                  value={removeData.tyreId}
                  onChange={(e) => setRemoveData({ ...removeData, tyreId: e.target.value })}
                >
                  {installedTyres.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.tyreId} - {t.brand} {t.tyreSize} (on {t.assignedEquipment?.equipmentId} at {t.currentPosition})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Removal Reason *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. End of life tread wear, sidewall impact cut..."
                  value={removeData.removalReason}
                  onChange={(e) => setRemoveData({ ...removeData, removalReason: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Remaining Tread Depth at Removal (mm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={removeData.currentTreadDepth}
                  onChange={(e) => setRemoveData({ ...removeData, currentTreadDepth: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Next Tyre Status</label>
                <select
                  className="form-select"
                  value={removeData.nextStatus}
                  onChange={(e) => setRemoveData({ ...removeData, nextStatus: e.target.value })}
                >
                  <option value="In Stock">Return to Stock (Reusable)</option>
                  <option value="Under Repair">Send to Tyre Repair Shop</option>
                  <option value="Retread">Send for Retreading</option>
                  <option value="Scrapped">Scrap Tyre (Condemned)</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading || installedTyres.length === 0} className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
              {loading ? 'Dismounting...' : 'Confirm Dismount & Update Lifecycle'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TyreWorkflows;
