# 🚀 Railway Deployment Guide for ApexCrypto Pro

A complete guide to deploying the ApexCrypto Pro trading platform on [Railway](https://railway.app) with 100% automated build, zero-configuration database, and persistent live market streaming.

---

## ⚡ Quick Deploy (1-Click Steps)

### Step 1: Push Changes to GitHub
Make sure all recent fixes are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "fix(railway): configure automated docker & nixpacks deployment with resilient postgres & healthcheck"
git push origin main
```

---

### Step 2: Create a New Project on Railway
1. Go to [railway.app](https://railway.app) and log in with your GitHub account.
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select your repository: `learnand2earn-debug/trading`.
4. Railway will automatically detect the root [`railway.json`](file:///c:/Users/Admin/Desktop/traning/railway.json) and [`Dockerfile`](file:///c:/Users/Admin/Desktop/traning/Dockerfile).

---

### Step 3: Configure Environment Variables (Railway Dashboard)
In your Railway service, open the **Variables** tab and set the following:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production mode |
| `JWT_SECRET` | *(Random 32+ char string)* | Session & authentication signing |
| `ENCRYPTION_KEY` | *(Random 32+ char string)* | API keys encryption |
| `PERSIST_DB` | `false` (or `true` if volume added) | Embedded PGlite DB persistence |

> [!NOTE]
> Railway automatically sets and injects `PORT`. The server is configured to dynamically bind to `${PORT}` on `0.0.0.0`.

---

### Step 4: (Optional) Add Managed PostgreSQL
ApexCrypto Pro works out of the box with zero external databases using its built-in **PGlite WASM engine**.

If you want managed PostgreSQL persistence:
1. In your Railway project, click **"New"** -> **"Database"** -> **"Add PostgreSQL"**.
2. Railway will automatically inject the `DATABASE_URL` variable into your service.
3. The platform will automatically connect to Railway PostgreSQL, create all 44 tables, seed default strategies and agents, and fall back safely if the connection is ever interrupted.

---

### Step 5: Generate Public Domain & Access Terminal
1. In your Railway service settings, go to the **Networking** section.
2. Click **"Generate Domain"** (e.g., `trading-production-xxxx.up.railway.app`).
3. Open the URL in your browser!
   - Frontend financial terminal is served directly at `/`
   - Real-time WebSockets connect automatically via `wss://your-app.up.railway.app/ws`
   - REST API is live at `/api`
   - Healthcheck is verified at `/health` and `/api/health`

---

## 🛡️ What Was Fixed for Railway

1. **Unified Single-Port Deployment**: Both backend and frontend are built and served by the unified Node server, eliminating CORS and domain mismatch errors.
2. **WebSocket Auto-Detection**: Frontend dynamically connects to `wss://` on `window.location.host` when deployed.
3. **Resilient Database Layer**: Automatic detection of Railway internal URLs (`.railway.internal`), automatic SSL adjustment, and graceful fallback to PGlite WASM if external DB is ever unreachable.
4. **Binance CloudFront CDN**: Bypasses datacenter IP blocking (HTTP 418 / 451) by streaming through `data-api.binance.vision` and `data-stream.binance.vision`.
5. **Clean Multi-Stage Dockerfile & Nixpacks**: Resolved hoisted workspace dependencies, removed redundant nested `npm install` steps, and enabled automated container caching.
