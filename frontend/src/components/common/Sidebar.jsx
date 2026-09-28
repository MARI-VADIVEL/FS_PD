import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/permissions';
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
  HardHat,
  ShieldCheck,
  ClipboardList,
  History
} from 'lucide-react';

const Sidebar = ({ collapsed, isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || ROLES.VIEWER;

  const getRoleNav = () => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return [
          {
            title: 'Core System',
            links: [
              { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { to: '/users', label: 'User Management', icon: Users }
            ]
          },
          {
            title: 'Fleet & Work Orders',
            links: [
              { to: '/equipment', label: 'Mining Equipment', icon: Truck },
              { to: '/work-orders', label: 'Work Orders', icon: Wrench },
              { to: '/pm-schedules', label: 'PM Schedules', icon: CalendarClock }
            ]
          },
          {
            title: 'Tyre & Supply Chain',
            links: [
              { to: '/tyres', label: 'Tyre Inventory', icon: Disc },
              { to: '/tyre-workflows', label: 'Tyre Operations', icon: RotateCw },
              { to: '/inventory', label: 'Spare Parts', icon: Boxes },
              { to: '/purchase-orders', label: 'Procurement', icon: ShoppingCart }
            ]
          },
          {
            title: 'Analytics & Config',
            links: [
              { to: '/alerts', label: 'Alerts Center', icon: BellRing },
              { to: '/reports', label: 'Operational Reports', icon: FileBarChart2 },
              { to: '/audit-logs', label: 'Audit Logs', icon: ScrollText },
              { to: '/settings', label: 'System Settings', icon: Sliders }
            ]
          }
        ];

      case ROLES.MAINTENANCE_MANAGER:
        return [
          {
            title: 'Maintenance Operations',
            links: [
              { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { to: '/equipment', label: 'Mining Equipment', icon: Truck },
              { to: '/work-orders', label: 'Work Orders', icon: Wrench },
              { to: '/pm-schedules', label: 'PM Schedules', icon: CalendarClock },
              { to: '/tyre-workflows', label: 'Tyre Operations', icon: RotateCw }
            ]
          },
          {
            title: 'Analytics & Alerts',
            links: [
              { to: '/alerts', label: 'Alerts Center', icon: BellRing },
              { to: '/reports', label: 'Operational Reports', icon: FileBarChart2 }
            ]
          }
        ];

      case ROLES.MAINTENANCE_ENGINEER:
        return [
          {
            title: 'Engineering & Maintenance',
            links: [
              { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { to: '/equipment', label: 'Mining Equipment', icon: Truck },
              { to: '/work-orders', label: 'Work Orders', icon: Wrench },
              { to: '/pm-schedules', label: 'PM Schedules', icon: CalendarClock },
              { to: '/tyre-workflows', label: 'Tyre Operations', icon: RotateCw }
            ]
          },
          {
            title: 'Inventory & Reports',
            links: [
              { to: '/inventory', label: 'Spare Parts', icon: Boxes },
              { to: '/alerts', label: 'Alerts Center', icon: BellRing },
              { to: '/reports', label: 'Operational Reports', icon: FileBarChart2 }
            ]
          }
        ];

      case ROLES.TECHNICIAN:
        return [
          {
            title: 'My Daily Work',
            links: [
              { to: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
              { to: '/work-orders', label: 'My Work Orders', icon: Wrench },
              { to: '/tyre-workflows', label: 'My Inspections', icon: RotateCw },
              { to: '/equipment', label: 'Equipment', icon: Truck },
              { to: '/tyres', label: 'Tyre Inspection', icon: Disc },
              { to: '/inventory', label: 'Parts Required', icon: Boxes }
            ]
          }
        ];

      case ROLES.FLEET_MANAGER:
        return [
          {
            title: 'Fleet Operations',
            links: [
              { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { to: '/equipment', label: 'Mining Equipment', icon: Truck },
              { to: '/work-orders', label: 'Work Orders', icon: Wrench }
            ]
          },
          {
            title: 'Performance & Reports',
            links: [
              { to: '/alerts', label: 'Alerts Center', icon: BellRing },
              { to: '/reports', label: 'Operational Reports', icon: FileBarChart2 }
            ]
          }
        ];

      case ROLES.STORE_MANAGER:
        return [
          {
            title: 'Inventory & Procurement',
            links: [
              { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { to: '/inventory', label: 'Spare Parts', icon: Boxes },
              { to: '/purchase-orders', label: 'Procurement', icon: ShoppingCart },
              { to: '/tyres', label: 'Tyre Inventory', icon: Disc }
            ]
          },
          {
            title: 'Supply Chain Reports',
            links: [
              { to: '/alerts', label: 'Alerts Center', icon: BellRing },
              { to: '/reports', label: 'Inventory Reports', icon: FileBarChart2 }
            ]
          }
        ];

      case ROLES.SAFETY_OFFICER:
        return [
          {
            title: 'Safety & Compliance',
            links: [
              { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { to: '/tyre-workflows', label: 'Inspections', icon: ShieldCheck },
              { to: '/equipment', label: 'Mining Equipment', icon: Truck },
              { to: '/tyres', label: 'Tyre Inspections', icon: Disc },
              { to: '/work-orders', label: 'Safety Work Orders', icon: Wrench }
            ]
          },
          {
            title: 'Audit & Reports',
            links: [
              { to: '/alerts', label: 'Alerts Center', icon: BellRing },
              { to: '/audit-logs', label: 'Audit Trail', icon: ScrollText },
              { to: '/reports', label: 'Safety Reports', icon: FileBarChart2 }
            ]
          }
        ];

      case ROLES.VIEWER:
      default:
        return [
          {
            title: 'Read-Only Overview',
            links: [
              { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { to: '/equipment', label: 'Mining Equipment', icon: Truck },
              { to: '/tyres', label: 'Tyre Inventory', icon: Disc },
              { to: '/work-orders', label: 'Work Orders', icon: Wrench },
              { to: '/reports', label: 'Operational Reports', icon: FileBarChart2 },
              { to: '/alerts', label: 'Alerts Center', icon: BellRing }
            ]
          }
        ];
    }
  };

  const navSections = getRoleNav();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-icon">
          <HardHat size={22} />
        </div>
        {!collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="brand-title">MINING OPS</span>
            <span className="brand-badge">{role.toUpperCase()} ERP</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section, idx) => (
          <div key={section.title || idx} style={{ marginBottom: '0.75rem' }}>
            {!collapsed && <div className="nav-section-title">{section.title}</div>}
            {section.links.map((link) => {
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
        ))}

        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <NavLink
            to="/about"
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? 'About' : undefined}
          >
            <Info size={18} />
            {!collapsed && <span>About Platform</span>}
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
