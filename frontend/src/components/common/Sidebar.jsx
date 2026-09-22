import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Truck,
  Wrench,
  CalendarClock,
  Disc,
  RotateCw,
  Boxes,
  ShoppingCart,
  BellRing,
  FileBarChart2,
  ScrollText,
  Users,
  Sliders,
  Info,
  HardHat
} from 'lucide-react';

const Sidebar = ({ collapsed, isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'Viewer';

  const hasAccess = (allowedRoles) => {
    if (role === 'Super Admin') return true;
    return allowedRoles.includes(role);
  };

  const navSections = [
    {
      title: 'Operations',
      links: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, access: true },
        { to: '/equipment', label: 'Mining Equipment', icon: Truck, access: true },
        { to: '/work-orders', label: 'Work Orders', icon: Wrench, access: true },
        { to: '/maintenance', label: 'PM Schedules', icon: CalendarClock, access: true }
      ]
    },
    {
      title: 'Assets & Supply',
      links: [
        { to: '/tyres', label: 'Tyre Inventory', icon: Disc, access: true },
        {
          to: '/tyre-workflows',
          label: 'Tyre Operations',
          icon: RotateCw,
          access: hasAccess(['Super Admin', 'Maintenance Manager', 'Maintenance Engineer', 'Technician', 'Safety Officer'])
        },
        { to: '/inventory', label: 'Spare Parts', icon: Boxes, access: true },
        {
          to: '/purchase-orders',
          label: 'Procurement',
          icon: ShoppingCart,
          access: hasAccess(['Super Admin', 'Store Manager', 'Maintenance Manager'])
        }
      ]
    },
    {
      title: 'Analytics & Audits',
      links: [
        { to: '/alerts', label: 'Alerts Center', icon: BellRing, access: true },
        { to: '/reports', label: 'Operational Reports', icon: FileBarChart2, access: true },
        {
          to: '/audit-logs',
          label: 'Audit Trail',
          icon: ScrollText,
          access: hasAccess(['Super Admin', 'Safety Officer'])
        }
      ]
    },
    {
      title: 'Administration',
      links: [
        {
          to: '/users',
          label: 'User Management',
          icon: Users,
          access: hasAccess(['Super Admin'])
        },
        {
          to: '/settings',
          label: 'System Settings',
          icon: Sliders,
          access: hasAccess(['Super Admin', 'Maintenance Manager'])
        },
        { to: '/about', label: 'About Platform', icon: Info, access: true }
      ]
    }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-icon">
          <HardHat size={22} />
        </div>
        {!collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="brand-title">MINING OPS</span>
            <span className="brand-badge">FLEET & TYRE ERP</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section, idx) => {
          const visibleLinks = section.links.filter((l) => l.access);
          if (visibleLinks.length === 0) return null;

          return (
            <div key={section.title || idx} style={{ marginBottom: '0.5rem' }}>
              {!collapsed && <div className="nav-section-title">{section.title}</div>}
              {visibleLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    title={collapsed ? link.label : undefined}
                  >
                    <Icon size={18} />
                    {!collapsed && <span>{link.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
