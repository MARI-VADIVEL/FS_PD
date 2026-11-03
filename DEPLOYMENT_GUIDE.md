# 🚀 Deployment Guide: Mining Equipment & Tyre Maintenance Management Platform

This full-stack application is configured for **unified cloud deployment** (React Frontend + Express Backend + MongoDB Atlas Database) so anyone in the world with internet access and valid credentials can use it.

---

## 🌟 Live Deployed Links (Render.com)

- **Frontend Application URL**: [https://fs-pd-frontend.onrender.com](https://fs-pd-frontend.onrender.com)
  *(Or unified fullstack link: [https://fs-pd-backend.onrender.com](https://fs-pd-backend.onrender.com))*
- **Backend API Base URL**: [https://fs-pd-backend.onrender.com/api/v1](https://fs-pd-backend.onrender.com/api/v1)
- **API Health Check**: [https://fs-pd-backend.onrender.com/api/health](https://fs-pd-backend.onrender.com/api/health)

---

## 🌟 Quickest & Free Deployment Method (Render.com)

[Render.com](https://render.com) provides **free hosting with 24/7 public HTTPS URLs**.

### Option A: Two-Service Deployment (Frontend Static Site + Backend Web Service)

#### 1. Backend Web Service (`fs-pd-backend`)
- **Type**: Web Service
- **Name**: `fs-pd-backend`
- **Language**: `Node`
- **Branch**: `main`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `MONGODB_URI`: `mongodb+srv://marieswaranv07_db_user:Mathi_Vel%402007@cluster0.eedgrgq.mongodb.net/mining_platform?retryWrites=true&w=majority&appName=Cluster0`
  - `JWT_SECRET`: `mining_platform_jwt_secret_key_2026_super_secure_enterprise`
  - `JWT_EXPIRES_IN`: `7d`
  - `DEFAULT_CURRENCY`: `INR`
  - `CLIENT_URL`: `https://fs-pd-frontend.onrender.com`

#### 2. Frontend Static Site (`fs-pd-frontend`)
- **Type**: Static Site
- **Name**: `fs-pd-frontend`
- **Branch**: `main`
- **Build Command**: `npm install --prefix frontend && npm run build --prefix frontend`
- **Publish Directory**: `frontend/dist`
- **Rewrite / Redirect Rules** (for React Router client-side routing):
  - **Source**: `/*`
  - **Destination**: `/index.html`
  - **Action**: `Rewrite`
  *(Pre-configured via `frontend/public/_redirects`)*
- **Environment Variables**:
  - `VITE_API_URL`: `https://fs-pd-backend.onrender.com/api/v1`

---

### Option B: Unified Fullstack Single Service
Because `backend/server.js` automatically serves the compiled `frontend/dist` folder, deploying `fs-pd-backend` as a single Web Service will serve both the backend API and the entire frontend application at:
`https://fs-pd-backend.onrender.com`

---

## 🚂 Alternative: Deploy on Railway.app

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select your repository.
4. Add the environment variables from the table above in the Railway Settings panel.
5. In **Networking**, click **"Generate Domain"** to get your public HTTPS URL.

---

## 🐳 Alternative: Deploy with Docker / VPS / Cloud Server

If you have a Linux VPS (AWS EC2, DigitalOcean Droplet, GCP Compute Engine, Oracle Cloud):
```bash
# Clone the repository
git clone <your-repo-url>
cd FS_PT

# Run using Docker Compose
docker compose up -d --build
```
Your app will be live on `http://<your-server-ip>:5000`.

---

## 👥 Demo Accounts & Valid Credentials

Anyone with the live URL can log in using any of the following pre-configured user credentials:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Super Admin** | `admin@miningplatform.com` | `Password@123` | Full system access & user management |
| **Maintenance Manager** | `manager@miningplatform.com` | `Password@123` | Work orders, equipment, schedules, reports |
| **Maintenance Engineer** | `engineer@miningplatform.com` | `Password@123` | Inspections, repair logs, work orders |
| **Technician** | `tech@miningplatform.com` | `Password@123` | Assigned tasks, tyre fitments, inspection entries |
| **Fleet Manager** | `fleet@miningplatform.com` | `Password@123` | Fleet telematics, equipment tracking |
| **Store Manager** | `store@miningplatform.com` | `Password@123` | Spare parts, inventory movements, POs |
| **Safety Officer** | `safety@miningplatform.com` | `Password@123` | Safety incidents, inspections, compliance audit |
| **Viewer** | `viewer@miningplatform.com` | `Password@123` | Read-only analytics & reporting |

---

## ⚙️ How It Works Under the Hood
1. When deployed, the Express server serves the compiled React Single Page Application (`frontend/dist`) directly.
2. All API requests route directly to `/api/v1/*` on the same domain without any CORS restrictions.
3. The platform automatically connects to MongoDB Atlas and auto-seeds initial data on the first start.
