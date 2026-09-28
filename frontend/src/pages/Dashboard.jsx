import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/permissions';
import api from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';

import SuperAdminDashboard from '../components/dashboard/SuperAdminDashboard';
import MaintenanceManagerDashboard from '../components/dashboard/MaintenanceManagerDashboard';
import MaintenanceEngineerDashboard from '../components/dashboard/MaintenanceEngineerDashboard';
import TechnicianDashboard from '../components/dashboard/TechnicianDashboard';
import FleetManagerDashboard from '../components/dashboard/FleetManagerDashboard';
import StoreManagerDashboard from '../components/dashboard/StoreManagerDashboard';
import SafetyOfficerDashboard from '../components/dashboard/SafetyOfficerDashboard';
import ViewerDashboard from '../components/dashboard/ViewerDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role || ROLES.VIEWER;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data);
      } else {
        setError(res.data.message || 'Failed to fetch dashboard metrics.');
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
      setError(err.response?.data?.message || 'Failed to load dashboard metrics. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  if (loading && !data) {
    return <LoadingSpinner message="Fetching role-tailored dashboard metrics..." />;
  }

  if (error && !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#f87171', padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: '#ef4444' }}>Unable to Load Dashboard</h3>
        <p style={{ color: '#9ca3af', marginBottom: '1.5rem', maxWidth: '400px' }}>{error}</p>
        <button
          onClick={fetchStats}
          style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', background: '#eab308', color: '#000', fontWeight: 600, border: 'none', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const {
    stats,
    charts,
    myAssignedList,
    recentWorkOrders,
    recentAlerts,
    recentAudits,
    lowStockParts,
    recentPurchaseOrders,
    recentInspections
  } = data;

  switch (role) {
    case ROLES.SUPER_ADMIN:
      return (
        <SuperAdminDashboard
          stats={stats}
          charts={charts}
          recentWorkOrders={recentWorkOrders}
          recentAlerts={recentAlerts}
          recentAudits={recentAudits}
        />
      );

    case ROLES.MAINTENANCE_MANAGER:
      return (
        <MaintenanceManagerDashboard
          stats={stats}
          charts={charts}
          recentWorkOrders={recentWorkOrders}
        />
      );

    case ROLES.MAINTENANCE_ENGINEER:
      return (
        <MaintenanceEngineerDashboard
          stats={stats}
          charts={charts}
          recentWorkOrders={recentWorkOrders}
          lowStockParts={lowStockParts}
        />
      );

    case ROLES.TECHNICIAN:
      return (
        <TechnicianDashboard
          stats={stats}
          myAssignedList={myAssignedList}
          recentWorkOrders={recentWorkOrders}
        />
      );

    case ROLES.FLEET_MANAGER:
      return (
        <FleetManagerDashboard
          stats={stats}
          charts={charts}
          recentWorkOrders={recentWorkOrders}
        />
      );

    case ROLES.STORE_MANAGER:
      return (
        <StoreManagerDashboard
          stats={stats}
          lowStockParts={lowStockParts}
          recentPurchaseOrders={recentPurchaseOrders}
        />
      );

    case ROLES.SAFETY_OFFICER:
      return (
        <SafetyOfficerDashboard
          stats={stats}
          recentAlerts={recentAlerts}
          recentInspections={recentInspections}
        />
      );

    case ROLES.VIEWER:
    default:
      return (
        <ViewerDashboard
          stats={stats}
          charts={charts}
          recentWorkOrders={recentWorkOrders}
        />
      );
  }
};

export default Dashboard;
