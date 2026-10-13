# 🚀 Deploying ApexCrypto Pro to Render (Step-by-Step)

This guide covers deploying the full **ApexCrypto Pro / Trading with Dawood** platform to **[Render](https://render.com/)** with **zero errors**.

---

## ⚡ Option 1: 1-Click Blueprint Deploy (Recommended)

Render can automatically configure and deploy the complete stack using the included `render.yaml` file:

1. Push your repository to **GitHub** or **GitLab**.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** (top right) ➔ **Blueprint**.
4. Connect your repository.
5. Render will automatically detect `render.yaml`, generate secrets (`JWT_SECRET`, `ENCRYPTION_KEY`), and set:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
6. Click **Apply**.
7. Once deployed, open your Render URL (e.g., `https://apexcrypto-trading-platform.onrender.com`).
   - Both the React frontend terminal UI and the backend WebSocket/API endpoints run automatically together!

---

## 🛠️ Option 2: Manual Web Service Deploy

If you prefer to create a standard Web Service manually in Render:

1. Go to [Render Dashboard](https://dashboard.render.com/) ➔ **New +** ➔ **Web Service**.
2. Connect your Git repository.
3. Configure the following settings:
   - **Name**: `apexcrypto-platform` (or your preferred name)
   - **Region**: Any (e.g. `Oregon (US West)`)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or `Starter`)
4. Under **Advanced** ➔ **Health Check Path**:
   - Set to: `/api/health`
5. Under **Environment Variables**, add:
   | Key | Value | Description |
   |-----|-------|-------------|
   | `NODE_ENV` | `production` | Production mode |
   | `HOST` | `0.0.0.0` | Container host binding |
   | `JWT_SECRET` | *(Random 32-char string)* | Session encryption |
   | `ENCRYPTION_KEY` | *(Random 32-char string)* | API key AES-256 encryption |
   | `PERSIST_DB` | `false` (or `true`) | Set `true` if Render Disk is mounted |
6. Click **Create Web Service**.

---

## 🗄️ Optional: Connecting an External PostgreSQL Database

The platform includes an embedded **WASM PGlite PostgreSQL engine** by default, meaning **no external database is required** to run on Render!

If you wish to use a Render Managed PostgreSQL database instead:
1. In Render, create a **PostgreSQL Database** (`New +` ➔ `PostgreSQL`).
2. Copy the **Internal Database URL** (or External Database URL).
3. In your Web Service settings, add the environment variable:
   - `DATABASE_URL` = `<your-postgresql-connection-string>`
4. The backend automatically detects the `DATABASE_URL`, applies SSL certificates (`ssl: { rejectUnauthorized: false }`), and initializes all 44+ tables and 7 strategy seeds.

---

## 🔑 Optional External API Keys & Notifications

Add these in Render under **Environment Variables** when you are ready to enable them:

| Key | Example / Description |
|-----|----------------------|
| `BINANCE_API_KEY` | Binance Spot API key |
| `BINANCE_API_SECRET` | Binance Spot Secret key |
| `COINGLASS_API_KEY` | CoinGlass API key for liquidity heatmaps |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot token for trade alerts |
| `TELEGRAM_CHAT_ID` | Telegram Chat ID for trade alerts |

---

## 🔍 Pre-Deployment Verification Checklist

- [x] Root `package.json` has `npm start` pointing to `node backend/dist/server.js`.
- [x] Root `postinstall` uses cross-platform child process with `--include=dev`.
- [x] Backend build copies `schema.sql` into `dist/database/schema.sql`.
- [x] Backend server binds explicitly to `0.0.0.0` with dynamic `PORT`.
- [x] Backend Express serves optimized `frontend/dist` SPA fallback at root `/`.
- [x] PostgreSQL connection Pool includes Render SSL compatibility (`rejectUnauthorized: false`).
- [x] Frontend `services/api.ts` supports both unified origin and external `VITE_API_URL` / `VITE_WS_URL`.
- [x] `render.yaml` Blueprint spec ready for 1-click deployment.
