import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  Bell,
  Menu,
  LogOut,
  User,
  ShieldCheck,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/alerts?limit=5&isRead=false');
        if (res.data.success) {
          setUnreadCount(res.data.unreadCount || 0);
          setRecentAlerts(res.data.alerts || []);
        }
      } catch (err) {}
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button
          onClick={onToggleSidebar}
          style={{ color: 'var(--text-muted)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
        >
          <Menu size={22} />
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: 500 }}>
          MARI ESWARAN V / Enterprise Maintenance Platform
        </span>
      </div>

      <div className="navbar-right">
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowAlertMenu(!showAlertMenu)}
            style={{ position: 'relative', padding: '0.4rem', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)' }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: 'var(--status-danger)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showAlertMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                width: '320px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
                padding: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Recent Alerts</span>
                <Link
                  to="/alerts"
                  onClick={() => setShowAlertMenu(false)}
                  style={{ fontSize: '0.75rem', color: 'var(--brand-amber)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  View all <ExternalLink size={12} />
                </Link>
              </div>
              {recentAlerts.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                  No unread alerts
                </div>
              ) : (
                recentAlerts.map((alert) => (
                  <div
                    key={alert._id}
                    onClick={() => {
                      setShowAlertMenu(false);
                      navigate('/alerts');
                    }}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      borderBottom: '1px solid var(--border-light)'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: alert.severity === 'Critical' ? 'var(--status-danger)' : 'var(--status-warning)' }}>
                      {alert.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {alert.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="role-tag">
          <ShieldCheck size={14} />
          <span>{user?.role || 'Viewer'}</span>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--brand-amber)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                width: '180px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
                padding: '0.4rem'
              }}
            >
              <Link
                to="/profile"
                onClick={() => setShowProfileMenu(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
                className="nav-item"
              >
                <User size={16} /> My Profile
              </Link>
              <button
                onClick={handleLogout}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--status-danger)' }}
                className="nav-item"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
