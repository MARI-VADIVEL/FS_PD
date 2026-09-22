# Mining Equipment & Tyre Maintenance Management Platform

A complete, production-grade MERN stack enterprise web application for mining fleet equipment reliability, heavy-duty tyre lifecycle management, maintenance work order operations, and spare parts inventory control.

**Project Owner / Student**: MARI ESWARAN V  
**Tech Stack**: MongoDB, Express.js, React.js (Vite), Node.js, REST APIs  
**Storage & Drive Constraint**: Strictly ZERO memory/disk usage on C: drive. All files, builds, npm cache (`E:\npm_cache`), npm temp files (`E:\temp`), npm global prefix (`E:\npm_global`), database cache, and project directories are configured strictly on the `E:\` drive (`E:\FS_PT`).

---

## User Review Required

> [!IMPORTANT]
> - **Database Strategy**: The platform uses Mongoose to connect to MongoDB. For local development, it supports standard local MongoDB (`mongodb://127.0.0.1:27017/mining_platform`), MongoDB Atlas URIs via `.env`, and includes an optional embedded MongoDB fallback configured strictly on the `E:\` drive so that the platform runs out of the box.
> - **Source Code Comment Rule**: Strictly following the prompt instructions, **all generated production source code files will contain no comments** (clean, self-documenting code with descriptive names and structured error handling).
> - **Demo Credentials**: Seed data will generate standard accounts for all 8 roles (Super Admin, Maintenance Manager, Maintenance Engineer, Technician, Fleet Manager, Store Manager, Safety Officer, Viewer) with documented passwords for testing.

---

## Proposed Changes

### Backend Architecture (`e:\FS_PT\backend`)

Complete Express.js REST API with security middleware (Helmet, CORS, rate limiting, centralized error handling), JWT authentication, role-based authorization, Mongoose models with validation & indexing, controllers, services, and database seeding.

#### [NEW] [package.json](file:///e:/FS_PT/backend/package.json)
- Dependencies: `express`, `mongoose`, `dotenv`, `cors`, `helmet`, `bcryptjs`, `jsonwebtoken`, `express-rate-limit`, `mongodb-memory-server` (dev fallback), `morgan`.
- Scripts: `start`, `dev`, `seed`, `test`.

#### [NEW] [server.js](file:///e:/FS_PT/backend/server.js)
- Express initialization, security headers via Helmet, JSON body parsing with limits, CORS configuration, rate limiter for auth routes, API route mounting (`/api/v1/...`), centralized 404 and global error handlers.

#### [NEW] [config/db.js](file:///e:/FS_PT/backend/config/db.js)
- MongoDB connection manager supporting URI connection with automatic fallback to embedded in-memory MongoDB on `E:\` drive if local MongoDB daemon is not running, ensuring immediate execution.

#### [NEW] Backend Models (`backend/models/`)
- [User.js](file:///e:/FS_PT/backend/models/User.js): Name, email (unique, indexed), passwordHash, role (enum: 8 roles), department, phone, status, lastLogin, timestamps.
- [Equipment.js](file:///e:/FS_PT/backend/models/Equipment.js): Equipment ID (unique, indexed), assetNumber, type (Haul Truck, Hydraulic Excavator, Wheel Loader, Track Dozer, Motor Grader, Drill Rig), manufacturer, model, serialNumber, yearOfManufacture, purchaseDate, commissioningDate, operatingHours, mileage, location, department, assignedOperator, status (Active, Inactive, Under Maintenance, Breakdown, Retired, Available), fuelType, capacity, maintenanceIntervalHours, lastServiceDate, nextServiceDate, isDeleted.
- [WorkOrder.js](file:///e:/FS_PT/backend/models/WorkOrder.js): Work order number (WO-XXXX, unique), equipment reference, maintenanceType (Preventive, Corrective, Breakdown, Inspection, Emergency), priority (Low, Medium, High, Critical), problemDescription, reportedDate, scheduledDate, assignedEngineer, assignedTechnician, estimatedHours, actualHours, estimatedCost, actualLaborCost, actualPartsCost, totalCost, requiredParts, partsUsed (item, quantity, unitCost), checklist items (task, status: Pending/Passed/Failed/NA, notes), status (Draft, Open, Assigned, In Progress, On Hold, Completed, Cancelled), completionNotes, completedBy, completedAt.
- [MaintenanceSchedule.js](file:///e:/FS_PT/backend/models/MaintenanceSchedule.js): Schedule name, equipment, intervalType (Hours, Calendar, Mileage), intervalValue, lastTriggerValue, nextDueValue, templateReference, checklistTemplate.
- [Tyre.js](file:///e:/FS_PT/backend/models/Tyre.js): Tyre ID (TY-XXXX, unique), serialNumber, brand (Michelin, Bridgestone, Goodyear, Titan), model, tyreSize (e.g. 59/80R63, 53/80R63), tyreType, purchaseDate, purchaseCost, status (In Stock, Installed, Under Inspection, Under Repair, Retread, Retired, Scrapped), condition (Excellent, Good, Fair, Poor, Critical), currentPosition (FL, FR, RL-Outer, RL-Inner, RR-Outer, RR-Inner, Spare), assignedEquipment, installationDate, installationHours, currentOperatingHours, initialTreadDepth, currentTreadDepth, recommendedPressure, currentPressure, currentTemperature, totalHoursRun, costPerHour.
- [TyreInspection.js](file:///e:/FS_PT/backend/models/TyreInspection.js): Tyre reference, equipment reference, inspectionDate, inspector, treadDepth, pressure, temperature, visualCondition, damageType (Puncture, Sidewall Damage, Uneven Wear, Cut, Crack, Heat Damage, Rim Damage, None), recommendation (Continue Service, Rotate, Repair, Retread, Scrap), notes.
- [TyreHistory.js](file:///e:/FS_PT/backend/models/TyreHistory.js): Tyre reference, equipment reference, eventType (Purchase, Installation, Removal, Rotation, Inspection, Repair, Retread, Retirement), fromPosition, toPosition, equipmentHours, tyreHours, treadDepth, reason, performedBy, date.
- [SparePart.js](file:///e:/FS_PT/backend/models/SparePart.js): Part number (PN-XXXX, unique), name, category, manufacturer, supplier, unit, quantityInStock, minStockLevel, maxStockLevel, unitCost, storageLocation, compatibleModels, status.
- [InventoryMovement.js](file:///e:/FS_PT/backend/models/InventoryMovement.js): Part reference, movementType (Stock-In, Stock-Out, Adjustment, WorkOrder-Issue, WorkOrder-Return), quantity, unitCost, totalCost, referenceType, referenceId, user, notes.
- [Supplier.js](file:///e:/FS_PT/backend/models/Supplier.js): Name, contactPerson, email, phone, address, productsSupplied, status.
- [PurchaseOrder.js](file:///e:/FS_PT/backend/models/PurchaseOrder.js): PO number (PO-XXXX), supplier, orderDate, expectedDeliveryDate, items (part, quantity, unitCost), totalAmount, status (Draft, Ordered, Partially Received, Received, Cancelled).
- [Downtime.js](file:///e:/FS_PT/backend/models/Downtime.js): Equipment reference, workOrder reference, startTime, endTime, durationHours, category (Mechanical, Electrical, Hydraulic, Tyre, Engine, Transmission, Other), reason, impactLevel.
- [Alert.js](file:///e:/FS_PT/backend/models/Alert.js): Alert type (Maintenance Due, Overdue Maintenance, Critical Equipment Breakdown, Low Stock, Tyre Inspection Due, Tyre Replacement Due, Abnormal Pressure, Safety), title, message, severity (Info, Warning, Critical), relatedEntity (entityType, entityId), isRead, readAt, readBy.
- [AuditLog.js](file:///e:/FS_PT/backend/models/AuditLog.js): User, action, module, recordId, details, ipAddress, userAgent, timestamp.
- [SystemSetting.js](file:///e:/FS_PT/backend/models/SystemSetting.js): Maintenance warning lead time (days/hours), tyre tread critical threshold (mm), tyre pressure tolerance (%), currency symbol (INR / USD), alert rules, locations, departments.

#### [NEW] Backend Middleware (`backend/middleware/`)
- `authMiddleware.js`: Verify JWT bearer token, attach sanitized user object to `req.user`.
- `roleMiddleware.js`: RBAC permission gate accepting allowed roles, returning 403 Forbidden for unauthorized roles.
- `auditMiddleware.js`: Helper function to log administrative actions to the database.
- `errorHandler.js`: Structured centralized error response handler returning `{ success: false, message, errors }` with proper HTTP status codes.

#### [NEW] Backend Controllers & Routes (`backend/controllers/` & `backend/routes/`)
- `authController.js` & `authRoutes.js`: Login, register, get current profile, update profile, change password, password reset token flow.
- `equipmentController.js` & `equipmentRoutes.js`: List with filters/pagination/sorting, get by ID with populated history, create, update, soft delete, status transition workflow.
- `maintenanceController.js` & `maintenanceRoutes.js`: Work order CRUD, assign technicians, checklist updates, close work order with cost & inventory decrement, schedule management, downtime logs.
- `tyreController.js` & `tyreRoutes.js`: Tyre inventory, details with lifecycle history, tyre installation workflow, tyre removal workflow, tyre rotation workflow, tyre inspection recording.
- `inventoryController.js` & `inventoryRoutes.js`: Spare parts CRUD, stock-in, stock-out, stock adjustment, purchase order management, supplier CRUD.
- `dashboardController.js` & `dashboardRoutes.js`: Aggregated analytics (equipment counts by status, tyre health stats, monthly maintenance spend, availability %, MTBF/MTTR, work order completion rates, low stock alerts).
- `alertController.js` & `alertRoutes.js`: List alerts, unread count, mark single read, mark all read.
- `reportController.js` & `reportRoutes.js`: Equipment report, maintenance cost report, tyre lifecycle report, inventory valuation report, downtime analysis report, CSV export endpoints.
- `auditController.js` & `auditRoutes.js`: Audit log list with filtering by module, user, date range.
- `settingController.js` & `settingRoutes.js`: Get and update system threshold configurations.

#### [NEW] Database Seed Script (`backend/seed/seedData.js`)
- Realistic mining data: 8 role-based users, heavy mining haul trucks (CAT 797F, Komatsu 930E, BelAZ 75710), excavators (Liebherr R9800), OTR tyres (Michelin 59/80R63, Bridgestone MasterCore), realistic work orders, checklists, downtime records, spare parts, suppliers, alerts, and audit logs.
- Executable via `npm run seed`.

---

### Frontend Architecture (`e:\FS_PT\frontend`)

Modern React application built with Vite, styled with a custom high-contrast industrial mining theme (charcoal, slate, warning amber, safety green, industrial steel), responsive sidebar navigation, mobile drawer, data tables, analytics charts, modals, toast system, and strict role guards.

#### [NEW] [package.json](file:///e:/FS_PT/frontend/package.json) & [vite.config.js](file:///e:/FS_PT/frontend/vite.config.js)
- Dependencies: `react`, `react-dom`, `react-router-dom`, `lucide-react` (icons), `chart.js`, `react-chartjs-2`, `axios`.
- Vite configured with port 5173 and proxy to backend API at port 5000.

#### [NEW] Styling System (`frontend/src/styles/index.css`)
- Professional industrial visual tokens: colors (`--bg-primary: #0f172a`, `--bg-secondary: #1e293b`, `--accent-amber: #f59e0b`, `--accent-blue: #3b82f6`, `--status-green: #10b981`, `--status-red: #ef4444`, `--text-main: #f8fafc`, `--text-muted: #94a3b8`), responsive container classes, clean table layouts, badge designs, modal backdrops, KPI cards, form controls.

#### [NEW] Core Services & Context (`frontend/src/api/`, `frontend/src/context/`)
- `api/client.js`: Axios instance with token interceptor, centralized 401 handling, structured error parsing.
- `context/AuthContext.jsx`: Centralized user state, login, logout, profile update, token storage in localStorage.
- `context/ToastContext.jsx`: Non-intrusive toast notifications (success, error, warning, info).

#### [NEW] Reusable UI Components (`frontend/src/components/common/`)
- `Navbar.jsx`: Top navigation, branding, alert badge indicator with quick dropdown, active user role pill, profile menu, logout.
- `Sidebar.jsx`: Collapsible navigation grouped logically (Dashboard, Operations, Equipment, Maintenance, Tyres, Inventory, Reports, Alerts, Admin, Settings), role-filtered links, mobile responsive drawer toggle.
- `DataTable.jsx`: Reusable table with column definitions, search bar, sort indicators, pagination controls, empty state, loading skeleton.
- `StatCard.jsx`: Metric card with icon, title, value, change indicator, clickable navigation.
- `Modal.jsx` & `ConfirmDialog.jsx`: Accessible modal dialogs with escape key, backdrop dismissal, destructive confirmation states.
- `StatusBadge.jsx`: Standardized status badges with appropriate semantic colors and icons.
- `Toast.jsx`: Floating notification stack.
- `ErrorBoundary.jsx`: React error boundary preventing UI crash cascades.

#### [NEW] Chart Components (`frontend/src/components/charts/`)
- `EquipmentStatusChart.jsx`: Doughnut chart of fleet availability (Active, In Maintenance, Breakdown, Standby).
- `CostTrendChart.jsx`: Bar/Line chart of monthly maintenance costs broken down by labor and parts.
- `TyreHealthChart.jsx`: Bar chart of tyre condition distribution and wear status.
- `DowntimeChart.jsx`: Categorized downtime hours chart (Mechanical, Electrical, Hydraulic, Tyre, etc.).

#### [NEW] Application Pages (`frontend/src/pages/`)
- `Login.jsx`: Industrial login portal with demo account quick-fill selectors for all 8 roles.
- `ResetPassword.jsx`: Password recovery flow.
- `Dashboard.jsx`: Executive overview with KPI cards, operational charts, upcoming maintenance widget, low stock widget, recent audit activity.
- `EquipmentList.jsx`: Equipment table with search, status filters, type filters, pagination, create equipment modal.
- `EquipmentDetail.jsx`: Tabbed view: overview specs, maintenance history, work orders, assigned tyres, downtime logs, operating hour tracking.
- `WorkOrdersList.jsx`: Work order management table, filters by priority, status, maintenance type.
- `WorkOrderDetail.jsx`: Work order lifecycle manager: assigned crew, interactive checklist (Pending, Passed, Failed, N/A), spare parts issue, labor hours, completion workflow.
- `MaintenanceSchedules.jsx`: Preventive maintenance schedules, intervals (hours/days), due dates, trigger generator.
- `TyreInventory.jsx`: Tyre inventory with search by ID/serial, filters by status/condition/size, action modals.
- `TyreDetail.jsx`: Tyre lifecycle timeline, historical equipment fitments, tread depth degradation history, cost per hour metrics.
- `TyreWorkflows.jsx`: Dedicated workflows for Installation (select equipment, position, hours, initial tread), Removal (record reason, remaining tread), Rotation (swap positions), Inspection (log pressure, depth, damage flags).
- `SparePartsInventory.jsx`: Inventory list, stock levels, min/max thresholds, stock-in/stock-out dialogs.
- `SparePartDetail.jsx`: Part movements history, work order allocations, compatibility.
- `PurchaseOrders.jsx`: Procurement orders, supplier linking, receiving workflow.
- `AlertsCenter.jsx`: Interactive notification center, filtering by severity and read status, direct record navigation.
- `Reports.jsx`: Multi-tab operational reports (Equipment, Cost, Tyre Lifecycle, Downtime, Inventory), date range selectors, CSV export download.
- `AuditLogs.jsx`: Administrative audit trail with module and action filters.
- `SystemSettings.jsx`: Threshold configuration (maintenance intervals, tyre tread minimums, currency, departments, locations).
- `UserManagement.jsx`: Admin user list, role assignment, account activation.
- `UserProfile.jsx`: Current user details, role badge, password change form.
- `About.jsx`: System information, student name **MARI ESWARAN V**, project purpose, architecture overview.
- `NotFound.jsx` & `Forbidden.jsx`: Accessible 404 and 403 error pages.

---

### Root Orchestration & Documentation

#### [NEW] [package.json](file:///e:/FS_PT/package.json)
- Top-level npm script to run both backend and frontend concurrently: `npm run dev`, `npm run seed`, `npm run build`.

#### [NEW] [.gitignore](file:///e:/FS_PT/.gitignore)
- Standard exclusion for `node_modules`, `.env`, build dist, logs, cache.

#### [NEW] [README.md](file:///e:/FS_PT/README.md)
- Complete documentation: project title, student name (MARI ESWARAN V), features, architecture diagram, installation steps, demo login credentials for each role, API endpoint catalog, database schema diagrams, deployment guidelines.

---

## Verification Plan

### Automated Tests
- Backend API tests using Supertest/Jest:
  - Auth flow (login, token validation, forbidden access).
  - Equipment CRUD and status change API.
  - Tyre installation and lifecycle history API.
  - Work order checklist and inventory consumption API.
- Frontend build validation:
  - Run `npm run build` in `frontend/` to verify Vite bundle compilation with zero syntax or import errors.

### Manual & Integration Verification
- Launch backend and frontend development servers.
- Verify MongoDB connectivity and database seeding (`npm run seed`).
- Test login with Super Admin, Maintenance Engineer, Technician, and Viewer accounts to verify role-based access control.
- Verify end-to-end workflows:
  1. Add equipment and change status.
  2. Create a work order, check off maintenance tasks, issue spare parts, and mark it complete.
  3. Install a tyre onto equipment, inspect it with tread/pressure readings, rotate it, and remove it to verify lifecycle preservation.
  4. Perform stock-in and stock-out on spare parts; trigger a low-stock alert.
  5. Inspect the Dashboard KPIs and charts to ensure live recalculations.
  6. Export operational reports to CSV.
