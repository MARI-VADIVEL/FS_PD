import React, { useState, useEffect } from 'react';
import api from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { Sliders, Save, MapPin, Building } from 'lucide-react';

const SystemSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      addToast('Failed to load system settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/settings', settings);
      if (res.data.success) {
        addToast('System operational settings saved successfully', 'success');
        setSettings(res.data.settings);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <LoadingSpinner message="Loading enterprise threshold configurations..." />;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Enterprise System Parameters & Thresholds</h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Configure maintenance alert lead times, tyre critical wear limits, and pit locations
        </p>
      </div>

      <form onSubmit={handleSave} style={{ maxWidth: '820px' }}>
        <div className="table-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={18} color="var(--brand-amber)" /> Maintenance & Tyre Thresholds
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">PM Advance Warning Lead Time (Hours)</label>
              <input
                type="number"
                className="form-input"
                value={settings.maintenanceLeadHours}
                onChange={(e) => setSettings({ ...settings, maintenanceLeadHours: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Calendar Service Warning Lead Time (Days)</label>
              <input
                type="number"
                className="form-input"
                value={settings.maintenanceLeadDays}
                onChange={(e) => setSettings({ ...settings, maintenanceLeadDays: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tyre Critical Tread Limit (mm)</label>
              <input
                type="number"
                className="form-input"
                value={settings.tyreTreadCriticalMm}
                onChange={(e) => setSettings({ ...settings, tyreTreadCriticalMm: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tyre Min Pressure Tolerance (PSI)</label>
              <input
                type="number"
                className="form-input"
                value={settings.tyrePressureMinPsi}
                onChange={(e) => setSettings({ ...settings, tyrePressureMinPsi: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tyre Max Pressure Tolerance (PSI)</label>
              <input
                type="number"
                className="form-input"
                value={settings.tyrePressureMaxPsi}
                onChange={(e) => setSettings({ ...settings, tyrePressureMaxPsi: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Default Low Stock Reorder Level (Units)</label>
              <input
                type="number"
                className="form-input"
                value={settings.lowStockThresholdDefault}
                onChange={(e) => setSettings({ ...settings, lowStockThresholdDefault: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reporting Currency</label>
              <select
                className="form-select"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              >
                <option value="INR">Indian Rupee (INR - ₹)</option>
                <option value="USD">US Dollar (USD - $)</option>
                <option value="AUD">Australian Dollar (AUD - A$)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} color="var(--status-info)" /> Active Mine Sites, Pits & Workshop Bays
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {settings.locations?.map((loc, idx) => (
              <span
                key={idx}
                className="badge"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
              >
                {loc.name} ({loc.type})
              </span>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
};

export default SystemSettings;
