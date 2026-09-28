import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ROLES } from './utils/permissions';
import MainLayout from './layouts/MainLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

const Login = lazy(() => import('./pages/Login'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EquipmentList = lazy(() => import('./pages/EquipmentList'));
const EquipmentDetail = lazy(() => import('./pages/EquipmentDetail'));
const WorkOrdersList = lazy(() => import('./pages/WorkOrdersList'));
const WorkOrderDetail = lazy(() => import('./pages/WorkOrderDetail'));
const MaintenanceSchedules = lazy(() => import('./pages/MaintenanceSchedules'));
const TyreInventory = lazy(() => import('./pages/TyreInventory'));
const TyreDetail = lazy(() => import('./pages/TyreDetail'));
const TyreWorkflows = lazy(() => import('./pages/TyreWorkflows'));
const SparePartsInventory = lazy(() => import('./pages/SparePartsInventory'));
const SparePartDetail = lazy(() => import('./pages/SparePartDetail'));
const PurchaseOrders = lazy(() => import('./pages/PurchaseOrders'));
const AlertsCenter = lazy(() => import('./pages/AlertsCenter'));
const Reports = lazy(() => import('./pages/Reports'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const SystemSettings = lazy(() => import('./pages/SystemSettings'));
const About = lazy(() => import('./pages/About'));
const Forbidden = lazy(() => import('./pages/Forbidden'));

const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh'
  }}>
    <LoadingSpinner message="Loading module..." />
  </div>
);

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === ROLES.SUPER_ADMIN) return children;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Forbidden />;
  }

  return children;
};

const App = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/equipment" element={<EquipmentList />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />

          <Route path="/work-orders" element={<WorkOrdersList />} />
          <Route path="/work-orders/:id" element={<WorkOrderDetail />} />

          <Route
            path="/pm-schedules"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.MAINTENANCE_MANAGER, ROLES.MAINTENANCE_ENGINEER]}>
                <MaintenanceSchedules />
              </RoleRoute>
            }
          />

          <Route path="/tyres" element={<TyreInventory />} />
          <Route path="/tyres/:id" element={<TyreDetail />} />
          <Route path="/tyre-workflows" element={<TyreWorkflows />} />

          <Route path="/inventory" element={<SparePartsInventory />} />
          <Route path="/inventory/:id" element={<SparePartDetail />} />

          <Route
            path="/purchase-orders"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.STORE_MANAGER, ROLES.MAINTENANCE_MANAGER]}>
                <PurchaseOrders />
              </RoleRoute>
            }
          />

          <Route path="/alerts" element={<AlertsCenter />} />
          <Route path="/reports" element={<Reports />} />

          <Route
            path="/users"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <UserManagement />
              </RoleRoute>
            }
          />

          <Route
            path="/audit-logs"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SAFETY_OFFICER]}>
                <AuditLogs />
              </RoleRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <SystemSettings />
              </RoleRoute>
            }
          />

          <Route path="/profile" element={<UserProfile />} />
          <Route path="/about" element={<About />} />
          <Route path="/forbidden" element={<Forbidden />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
