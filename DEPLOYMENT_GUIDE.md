# 🚀 Deployment Guide: Mining Equipment & Tyre Maintenance Management Platform

This full-stack application is configured for **unified cloud deployment** (React Frontend + Express Backend + MongoDB Atlas Database) so anyone in the world with internet access and valid credentials can use it.

---

## 🌟 Quickest & Free Deployment Method (Render.com)

[Render.com](https://render.com) provides **free hosting with 24/7 public HTTPS URLs**.

### Step 1: Push your project to GitHub
1. Make sure your latest code is pushed to your GitHub repository:
   ```bash
   git add .
   git commit -m "Configure production deployment"
   git push origin main
   ```

### Step 2: Deploy on Render
1. Go to [dashboard.render.com](https://dashboard.render.com) and log in with your GitHub account.
2. Click **"New +"** and select **"Web Service"**.
3. Select your repository `FS_PT` (or your repository name).
4. Fill in the following settings:
   - **Name**: `mining-platform` (or any custom name)
   - **Language**: `Node`
   - **Branch**: `main`
   - **Root Directory**: *(leave blank / default)*
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Under **Environment Variables**, add the following:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | `mongodb+srv://marieswaranv07_db_user:Mathi_Vel%402007@cluster0.eedgrgq.mongodb.net/mining_platform?retryWrites=true&w=majority&appName=Cluster0` |
   | `JWT_SECRET` | `mining_platform_jwt_secret_key_2026_super_secure_enterprise` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `DEFAULT_CURRENCY` | `INR` |

6. Click **"Create Web Service"**.
7. In ~2 minutes, Render will build and deploy your app, giving you a live URL:
   `https://mining-platform-xxxx.onrender.com`

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
