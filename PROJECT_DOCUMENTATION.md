# MINING EQUIPMENT & TYRE MAINTENANCE MANAGEMENT PLATFORM
## Comprehensive System & Architecture Documentation

---

## 1. Executive Summary
The **Mining Equipment & Tyre Maintenance Management Platform** is a full-stack enterprise web application (MERN Stack: MongoDB, Express.js, React 18 + Vite, Node.js). It is designed to manage heavy mining fleet operations, Off-The-Road (OTR) tyre lifecycles, preventive & breakdown work orders, spare parts inventory control, downtime logs, and safety inspections.

---

## 2. Technology Stack & Environment
- **Frontend**: React 18, Vite, React Router v6, Axios, Chart.js / react-chartjs-2, Lucide React Icons, Custom Vanilla CSS Design Tokens (Dark Industrial UI).
- **Backend**: Node.js, Express.js REST API, Mongoose ODM, JWT Authentication, Bcryptjs, Helmet, CORS, Express Rate Limit, Morgan logging.
- **Database**: MongoDB (Remote Atlas / Local MongoDB fallback).
- **Deployment & Server Port**: 
  - Backend API: `http://localhost:5000/api/v1`
  - Frontend App: `http://localhost:5173`

---

## 3. Role-Based Access Control (RBAC) System
The platform supports **8 distinct user roles**, each with tailored navigation, permissions, and role-specific dashboard views:

1. **Super Admin**: Full unrestricted system access, user management, audit logs, system threshold configurations.
2. **Maintenance Manager**: Approves work orders, assigns engineers & technicians, monitors fleet MTBF/MTTR and compliance.
3. **Maintenance Engineer**: Diagnoses equipment issues, creates work order schedules, manages PM compliance, issues spare parts.
4. **Technician**: Views assigned work orders, completes checklist tasks, logs parts used & labor duration, closes work orders.
5. **Fleet Manager**: Tracks equipment availability, operational hours, location dispatch, and fleet utilization metrics.
6. **Store Manager**: Manages spare parts inventory, min/max reorder levels, stock movement logs, suppliers, purchase orders.
7. **Safety Officer**: Conducts OTR tyre inspections, logs damage types, tracks safety compliance & critical defects.
8. **Viewer**: Read-only access to equipment lists, work order summaries, and high-level platform reports.

---

## 4. Key Core Modules & Database Models

### A. Equipment Management (`Equipment` model)
- Tracks heavy mining assets (Haul Trucks, Hydraulic Excavators, Wheel Loaders, Track Dozers, Motor Graders, Drill Rigs).
- Fields: Equipment ID (e.g. `EQ-1001`), Asset Number, Model, Serial Number, Operating Hours, Status (`Active`, `Under Maintenance`, `Breakdown`, `Available`), Department, Location.

### B. Work Order & Maintenance Management (`WorkOrder` & `Downtime` models)
- Manages Preventive, Corrective, Breakdown, Inspection, and Emergency work orders.
- Lifecycle: Draft → Open → Assigned → In Progress → Completed / Cancelled.
- Features: Interactive checklists, assigned engineers & technicians, estimated vs actual labor/parts cost, automatic downtime calculation.

### C. OTR Tyre Lifecycle Management (`Tyre`, `TyreInspection`, `TyreHistory` models)
- Manages high-cost mining tyres (e.g. Michelin 59/80R63, Bridgestone MasterCore).
- Features: Wheel position mapping (FL, FR, RL-Outer, RL-Inner, etc.), tread depth tracking (mm), pressure & temp monitoring, inspections, mount/demount history, cost-per-hour calculation.

### D. Inventory & Procurement (`SparePart`, `InventoryMovement`, `PurchaseOrder`, `Supplier` models)
- Tracks spare parts stock levels, automated low-stock reorder alerts, movement logs (Stock-In, Stock-Out, WorkOrder Issue), purchase orders, and supplier directory.

### E. Security & Governance (`Alert`, `AuditLog`, `SystemSetting` models)
- Centralized alert notifications for critical breakdowns, low stock, and overdue inspections.
- Immutable audit log capturing user actions, timestamps, and IP addresses.
- System threshold settings for reorder levels, safety critical tread depth, and alert lead times.

---

## 5. API Routes Overview (`/api/v1`)
- `/api/v1/auth`: `POST /login`, `POST /register`, `GET /me`, `PUT /profile`, `PUT /change-password`
- `/api/v1/dashboard`: `GET /stats` (Aggregated parallel metrics for role-tailored dashboards)
- `/api/v1/equipment`: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`
- `/api/v1/maintenance`: `GET /work-orders`, `POST /work-orders`, `PUT /work-orders/:id`, `PATCH /work-orders/:id/status`
- `/api/v1/tyres`: `GET /`, `POST /`, `POST /mount`, `POST /dismount`, `POST /inspection`
- `/api/v1/inventory`: `GET /parts`, `POST /parts`, `POST /movements`, `GET /purchase-orders`
- `/api/v1/alerts`: `GET /`, `PATCH /:id/read`, `PATCH /read-all`
- `/api/v1/reports`: `GET /equipment`, `GET /maintenance`, `GET /tyre-lifecycle`, `GET /inventory`
- `/api/v1/audit`: `GET /`
- `/api/v1/settings`: `GET /`, `PUT /`

---

## 6. Seeded Demo Accounts
Default accounts for testing each role (Password for all: `Password@123`):
- Super Admin: `admin@miningplatform.com`
- Maintenance Manager: `manager@miningplatform.com`
- Maintenance Engineer: `engineer@miningplatform.com`
- Technician: `tech@miningplatform.com`
- Fleet Manager: `fleet@miningplatform.com`
- Store Manager: `store@miningplatform.com`
- Safety Officer: `safety@miningplatform.com`

---

## 7. How to Run the Project Locally
1. **Backend**:
   ```bash
   cd e:\FS_PT\backend
   npm run dev
   ```
2. **Frontend**:
   ```bash
   cd e:\FS_PT\frontend
   npm run dev
   ```
3. **Database Seeding**:
   ```bash
   cd e:\FS_PT\backend
   npm run seed
   ```

---
*Created & Maintained by MARI ESWARAN V*
