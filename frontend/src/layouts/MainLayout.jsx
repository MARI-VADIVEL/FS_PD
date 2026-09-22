import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import ErrorBoundary from '../components/common/ErrorBoundary';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MainLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-dark)' }}>
        <LoadingSpinner message="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar
        collapsed={collapsed}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="main-content">
        <Navbar
          onToggleSidebar={() => {
            if (window.innerWidth <= 768) {
              setMobileOpen(!mobileOpen);
            } else {
              setCollapsed(!collapsed);
            }
          }}
        />
        <main className="content-body">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
        <footer style={{ padding: '1rem 1.75rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', fontSize: '0.75rem', color: 'var(--text-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>Mining Equipment & Tyre Maintenance Management Platform &copy; 2026</span>
          <span>Developed by <strong>MARI ESWARAN V</strong></span>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
