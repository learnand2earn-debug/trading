# Production Deployment Guide

## Docker Compose Deployment

The entire system is containerized for production deployment:

```bash
docker-compose up -d --build
```

### Services Included:
1. `postgres`: PostgreSQL 16 Alpine with initialized schema (`5432:5432`).
2. `redis`: Redis 7 Alpine for event pub/sub caching (`6379:6379`).
3. `backend`: Node.js 24 Alpine production container (`4000:4000`).
4. `frontend`: Nginx Alpine serving optimized React production bundle with reverse proxy (`80:80`).

## Environment Variables (.env)

```env
PORT=4000
DATABASE_URL=postgresql://apex_admin:apex_secure_password_change_in_prod@postgres:5432/apex_trading
REDIS_URL=redis://redis:6379
ENCRYPTION_KEY=your_secure_32_character_key_here!
BINANCE_API_KEY=
BINANCE_API_SECRET=
COINGLASS_API_KEY=
```
