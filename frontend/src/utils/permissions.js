export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  MAINTENANCE_MANAGER: 'Maintenance Manager',
  MAINTENANCE_ENGINEER: 'Maintenance Engineer',
  TECHNICIAN: 'Technician',
  FLEET_MANAGER: 'Fleet Manager',
  STORE_MANAGER: 'Store Manager',
  SAFETY_OFFICER: 'Safety Officer',
  VIEWER: 'Viewer'
};

export const PERMISSIONS = {
  // Users & Admin
  USERS_MANAGE: 'users:manage',
  SETTINGS_MANAGE: 'settings:manage',
  AUDIT_VIEW: 'audit:view',

  // Equipment
  EQUIPMENT_VIEW: 'equipment:view',
  EQUIPMENT_CREATE: 'equipment:create',
  EQUIPMENT_EDIT: 'equipment:edit',
  EQUIPMENT_DELETE: 'equipment:delete',
  EQUIPMENT_STATUS: 'equipment:status',
  EQUIPMENT_ASSIGN: 'equipment:assign',

  // Work Orders
  WORKORDER_VIEW: 'workorder:view',
  WORKORDER_CREATE: 'workorder:create',
  WORKORDER_ASSIGN: 'workorder:assign',
  WORKORDER_UPDATE: 'workorder:update',
  WORKORDER_CHECKLIST: 'workorder:checklist',
  WORKORDER_COMPLETE: 'workorder:complete',

  // Preventive Maintenance
  PM_VIEW: 'pm:view',
  PM_MANAGE: 'pm:manage',

  // Tyres
  TYRE_VIEW: 'tyre:view',
  TYRE_CREATE: 'tyre:create',
  TYRE_OPERATIONS: 'tyre:operations',
  TYRE_INSPECT: 'tyre:inspect',

  // Inventory & Parts
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_MANAGE: 'inventory:manage',
  INVENTORY_MOVEMENT: 'inventory:movement',

  // Procurement & Suppliers
  PROCUREMENT_VIEW: 'procurement:view',
  PROCUREMENT_MANAGE: 'procurement:manage',
  SUPPLIERS_MANAGE: 'suppliers:manage',

  // Safety & Inspections
  SAFETY_VIEW: 'safety:view',
  SAFETY_MANAGE: 'safety:manage',

  // Reports & Alerts
  REPORTS_VIEW: 'reports:view',
  ALERTS_VIEW: 'alerts:view'
};

const ROLE_PERMISSIONS_MAP = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [ROLES.MAINTENANCE_MANAGER]: [
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.EQUIPMENT_CREATE,
    PERMISSIONS.EQUIPMENT_EDIT,
    PERMISSIONS.EQUIPMENT_STATUS,
    PERMISSIONS.EQUIPMENT_ASSIGN,
    PERMISSIONS.WORKORDER_VIEW,
    PERMISSIONS.WORKORDER_CREATE,
    PERMISSIONS.WORKORDER_ASSIGN,
    PERMISSIONS.WORKORDER_UPDATE,
    PERMISSIONS.WORKORDER_CHECKLIST,
    PERMISSIONS.WORKORDER_COMPLETE,
    PERMISSIONS.PM_VIEW,
    PERMISSIONS.PM_MANAGE,
    PERMISSIONS.TYRE_VIEW,
    PERMISSIONS.TYRE_OPERATIONS,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ALERTS_VIEW
  ],

  [ROLES.MAINTENANCE_ENGINEER]: [
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.EQUIPMENT_EDIT,
    PERMISSIONS.EQUIPMENT_STATUS,
    PERMISSIONS.WORKORDER_VIEW,
    PERMISSIONS.WORKORDER_CREATE,
    PERMISSIONS.WORKORDER_ASSIGN,
    PERMISSIONS.WORKORDER_UPDATE,
    PERMISSIONS.WORKORDER_CHECKLIST,
    PERMISSIONS.WORKORDER_COMPLETE,
    PERMISSIONS.PM_VIEW,
    PERMISSIONS.TYRE_VIEW,
    PERMISSIONS.TYRE_OPERATIONS,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ALERTS_VIEW
  ],

  [ROLES.TECHNICIAN]: [
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.WORKORDER_VIEW,
    PERMISSIONS.WORKORDER_UPDATE,
    PERMISSIONS.WORKORDER_CHECKLIST,
    PERMISSIONS.TYRE_VIEW,
    PERMISSIONS.TYRE_INSPECT,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.ALERTS_VIEW
  ],

  [ROLES.FLEET_MANAGER]: [
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.EQUIPMENT_CREATE,
    PERMISSIONS.EQUIPMENT_EDIT,
    PERMISSIONS.EQUIPMENT_DELETE,
    PERMISSIONS.EQUIPMENT_STATUS,
    PERMISSIONS.EQUIPMENT_ASSIGN,
    PERMISSIONS.WORKORDER_VIEW,
    PERMISSIONS.WORKORDER_CREATE,
    PERMISSIONS.TYRE_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ALERTS_VIEW
  ],

  [ROLES.STORE_MANAGER]: [
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.INVENTORY_MOVEMENT,
    PERMISSIONS.PROCUREMENT_VIEW,
    PERMISSIONS.PROCUREMENT_MANAGE,
    PERMISSIONS.SUPPLIERS_MANAGE,
    PERMISSIONS.TYRE_VIEW,
    PERMISSIONS.TYRE_CREATE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ALERTS_VIEW
  ],

  [ROLES.SAFETY_OFFICER]: [
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.SAFETY_VIEW,
    PERMISSIONS.SAFETY_MANAGE,
    PERMISSIONS.TYRE_VIEW,
    PERMISSIONS.TYRE_INSPECT,
    PERMISSIONS.WORKORDER_VIEW,
    PERMISSIONS.WORKORDER_CREATE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ALERTS_VIEW
  ],

  [ROLES.VIEWER]: [
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.WORKORDER_VIEW,
    PERMISSIONS.TYRE_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ALERTS_VIEW
  ]
};

export const hasPermission = (userRole, permission) => {
  if (!userRole) return false;
  if (userRole === ROLES.SUPER_ADMIN) return true;
  const allowed = ROLE_PERMISSIONS_MAP[userRole] || [];
  return allowed.includes(permission);
};

export const getRoleAllowedRoutes = (userRole) => {
  if (!userRole || userRole === ROLES.SUPER_ADMIN) {
    return [
      '/',
      '/users',
      '/equipment',
      '/equipment/:id',
      '/work-orders',
      '/work-orders/:id',
      '/pm-schedules',
      '/tyres',
      '/tyres/:id',
      '/tyre-workflows',
      '/inventory',
      '/inventory/:id',
      '/purchase-orders',
      '/alerts',
      '/reports',
      '/audit-logs',
      '/settings',
      '/profile',
      '/about'
    ];
  }

  const routeMap = {
    [ROLES.MAINTENANCE_MANAGER]: [
      '/',
      '/equipment',
      '/equipment/:id',
      '/work-orders',
      '/work-orders/:id',
      '/pm-schedules',
      '/tyre-workflows',
      '/alerts',
      '/reports',
      '/profile',
      '/about'
    ],
    [ROLES.MAINTENANCE_ENGINEER]: [
      '/',
      '/equipment',
      '/equipment/:id',
      '/work-orders',
      '/work-orders/:id',
      '/pm-schedules',
      '/tyre-workflows',
      '/inventory',
      '/inventory/:id',
      '/alerts',
      '/reports',
      '/profile',
      '/about'
    ],
    [ROLES.TECHNICIAN]: [
      '/',
      '/work-orders',
      '/work-orders/:id',
      '/equipment',
      '/equipment/:id',
      '/tyre-workflows',
      '/inventory',
      '/alerts',
      '/profile',
      '/about'
    ],
    [ROLES.FLEET_MANAGER]: [
      '/',
      '/equipment',
      '/equipment/:id',
      '/work-orders',
      '/work-orders/:id',
      '/alerts',
      '/reports',
      '/profile',
      '/about'
    ],
    [ROLES.STORE_MANAGER]: [
      '/',
      '/inventory',
      '/inventory/:id',
      '/purchase-orders',
      '/tyres',
      '/tyres/:id',
      '/alerts',
      '/reports',
      '/profile',
      '/about'
    ],
    [ROLES.SAFETY_OFFICER]: [
      '/',
      '/equipment',
      '/equipment/:id',
      '/tyre-workflows',
      '/work-orders',
      '/alerts',
      '/reports',
      '/profile',
      '/about'
    ],
    [ROLES.VIEWER]: [
      '/',
      '/equipment',
      '/equipment/:id',
      '/tyres',
      '/tyres/:id',
      '/work-orders',
      '/work-orders/:id',
      '/reports',
      '/alerts',
      '/profile',
      '/about'
    ]
  };

  return routeMap[userRole] || ['/', '/profile', '/about'];
};
