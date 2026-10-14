import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import { hashPassword } from '../security/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface QueryResult<T = any> {
  rows: T[];
  rowCount?: number;
}

export interface IDatabase {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  exec?(sql: string): Promise<void>;
  close(): Promise<void>;
}

class PostgresDatabase implements IDatabase {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    this.pool = new pg.Pool({
      connectionString,
      ssl: isLocalhost ? false : { rejectUnauthorized: false }
    });
  }

  async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    const res = await this.pool.query(sql, params);
    return { rows: res.rows, rowCount: res.rowCount ?? 0 };
  }

  async exec(sql: string): Promise<void> {
    await this.pool.query(sql);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

class PGliteDatabase implements IDatabase {
  private pglite: PGlite;

  constructor(dataDir?: string) {
    this.pglite = new PGlite(dataDir);
  }

  async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    const res = await this.pglite.query<T>(sql, params);
    return { rows: res.rows as T[], rowCount: res.rows.length };
  }

  async exec(sql: string): Promise<void> {
    await this.pglite.exec(sql);
  }

  async close(): Promise<void> {
    await this.pglite.close();
  }
}

const g = globalThis as any;

export async function getDb(): Promise<IDatabase> {
  if (g.__apex_db_instance) return g.__apex_db_instance;
  if (g.__apex_db_promise) return g.__apex_db_promise;

  g.__apex_db_promise = (async () => {
    const databaseUrl = process.env.DATABASE_URL;
    let instance: IDatabase;
    if (databaseUrl && !databaseUrl.includes('pglite')) {
      console.log('[Database] Connecting to PostgreSQL via pg Pool (with SSL)...');
      instance = new PostgresDatabase(databaseUrl);
    } else {
      console.log('[Database] Initializing in-process PostgreSQL engine via PGlite (WASM)...');
      const dataDir = process.env.DATABASE_DIR || (process.env.PERSIST_DB === 'true' ? path.resolve(process.cwd(), 'data/pglite') : undefined);
      if (dataDir && !fs.existsSync(dataDir)) {
        try {
          fs.mkdirSync(dataDir, { recursive: true });
        } catch (e) {}
      }
      instance = new PGliteDatabase(dataDir);
    }

    await initializeSchemaAndSeeds(instance);
    g.__apex_db_instance = instance;
    return instance;
  })();

  return g.__apex_db_promise;
}

async function initializeSchemaAndSeeds(db: IDatabase) {
  const possiblePaths = [
    path.resolve(__dirname, 'schema.sql'),
    path.resolve(__dirname, '../database/schema.sql'),
    path.resolve(__dirname, '../../src/database/schema.sql'),
    path.resolve(process.cwd(), 'src/database/schema.sql'),
    path.resolve(process.cwd(), 'backend/src/database/schema.sql'),
    path.resolve(process.cwd(), 'dist/database/schema.sql'),
    path.resolve(process.cwd(), 'backend/dist/database/schema.sql')
  ];
  const schemaPath = possiblePaths.find(p => fs.existsSync(p));
  if (schemaPath) {
    console.log(`[Database] Applying schema migrations from: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    if (db.exec) {
      try {
        await db.exec(schemaSql);
      } catch (err: any) {
        console.warn('[Database] Batch exec notice, falling back to statement loop:', err.message);
        const statements = schemaSql
          .split(';')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);

        for (const stmt of statements) {
          try {
            await db.query(stmt);
          } catch (e: any) {
            console.warn(`[Database] Schema notice on stmt (${stmt.slice(0, 30)}...):`, e.message);
          }
        }
      }
    } else {
      const statements = schemaSql
        .split(';')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      for (const stmt of statements) {
        try {
          await db.query(stmt);
        } catch (err: any) {
          console.warn(`[Database] Schema notice on stmt (${stmt.slice(0, 30)}...):`, err.message);
        }
      }
    }
    console.log('[Database] Schema migrations applied successfully.');
  }

  // Ensure status and active_session_id columns exist in users
  try {
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS active_session_id TEXT`);
  } catch (e) {
    // Ignore if table/column already exists
  }

  // Ensure licenses table exists
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS licenses (
        id TEXT PRIMARY KEY,
        license_key TEXT UNIQUE NOT NULL,
        assigned_username TEXT,
        assigned_user_id TEXT,
        note TEXT,
        duration_days INTEGER NOT NULL DEFAULT 30,
        status TEXT NOT NULL DEFAULT 'active',
        active_session_id TEXT,
        active_device_info TEXT,
        last_active_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key)`);
  } catch (e) {
    // Ignore if table/index already exists
  }

  // Seed default VIP license if none exists
  try {
    const licCheck = await db.query('SELECT id FROM licenses WHERE license_key = $1', ['SCALP-PRO-2026-VIP1']);
    if (licCheck.rows.length === 0) {
      await db.query(
        `INSERT INTO licenses (id, license_key, note, duration_days, status, expires_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP + INTERVAL '365 days')`,
        ['lic-demo-vip1', 'SCALP-PRO-2026-VIP1', 'VIP ScalpPro Master Trader License', 365, 'active']
      );
    }
  } catch (e) {
    // Ignore if already seeded
  }

  // Seed Dawood main license
  try {
    const dawoodLicCheck = await db.query('SELECT id FROM licenses WHERE license_key = $1', ['SP-031300-DA5B9B-D2D427-FFF0E6-49D3E5']);
    if (dawoodLicCheck.rows.length === 0) {
      await db.query(
        `INSERT INTO licenses (id, license_key, assigned_username, note, duration_days, status, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP + INTERVAL '365 days')`,
        ['lic-dawood-001', 'SP-031300-DA5B9B-D2D427-FFF0E6-49D3E5', 'Dawood', 'Trading with Dawood — Owner License', 365, 'active']
      );
    }
  } catch (e) {
    // Ignore if already seeded
  }


  // Seed default admin user (admin / admin123)
  const adminHash = hashPassword('admin123');
  const adminCheck = await db.query('SELECT id FROM users WHERE username = $1', ['admin']);
  if (adminCheck.rows.length === 0) {
    await db.query(
      `INSERT INTO users (id, username, email, password_hash, role, status) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['usr-admin-1', 'admin', 'admin@apex-trading.io', adminHash, 'ADMIN', 'active']
    );
  } else {
    await db.query(
      `UPDATE users SET password_hash = $1, role = 'ADMIN' WHERE username = 'admin'`,
      [adminHash]
    );
  }

  // Seed demo client trader1 (trader1 / trader123)
  const trader1Check = await db.query('SELECT id FROM users WHERE username = $1', ['trader1']);
  if (trader1Check.rows.length === 0) {
    const traderHash = hashPassword('trader123');
    await db.query(
      `INSERT INTO users (id, username, email, password_hash, role, status) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['usr-trader-1', 'trader1', 'trader1@apex-trading.io', traderHash, 'USER', 'active']
    );
  }

  // Seed Dawood main user (Dawood / dawood12345) with license
  const dawoodCheck = await db.query('SELECT id FROM users WHERE username = $1', ['Dawood']);
  if (dawoodCheck.rows.length === 0) {
    const dawoodHash = hashPassword('dawood12345');
    await db.query(
      `INSERT INTO users (id, username, email, password_hash, role, status) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['usr-dawood-001', 'Dawood', 'dawood@trading-dawood.io', dawoodHash, 'USER', 'active']
    );
    // Link the license to Dawood
    await db.query(
      `UPDATE licenses SET assigned_username = $1, assigned_user_id = $2 WHERE license_key = $3`,
      ['Dawood', 'usr-dawood-001', 'SP-031300-DA5B9B-D2D427-FFF0E6-49D3E5']
    );
  }

  // Seed the 7 Core Strategies with exact source rules
  const seedStrategies = [
    {
      id: 'strat-pa-1',
      code: 'PRICE_ACTION',
      name: 'Price Action',
      desc: '1D Uptrend/Sideways, 1H Support/Resistance, CoinGlass Liquidity, 1H RSI 25-40 with 30M RSI positive leadership, +1% Target'
    },
    {
      id: 'strat-v1-1',
      code: 'V1_METHOD',
      name: 'V1 Method',
      desc: '1D Up, 1H Up/Sideways, RSI cross 54 from below, Smoothed Heiken Ashi V1 (Green/Transparent), 30M RSI leadership, +1% Target'
    },
    {
      id: 'strat-gainers-1',
      code: 'GAINERS_METHOD',
      name: 'Gainers Method',
      desc: 'Binance Top 7 Gainers, 3 quote pairs (USDT/USDC/FDUSD), ~40% pump, post-pump health, not new/delisting/monitoring, +1% Target'
    },
    {
      id: 'strat-hb-1',
      code: 'HIDDEN_BULLISH',
      name: 'Hidden Bullish',
      desc: 'Source 1H 10-candle downward movement structure, upward reaction, RSI 25-40, 30M leadership (NOT textbook divergence), +1% Target'
    },
    {
      id: 'strat-v1ema-1',
      code: 'V1_EMA',
      name: 'V1 + EMA',
      desc: 'V1 methodology + EMA 9 (blue) / EMA 33 (yellow) bullish cross, EMA 9 retest/touch, bullish reaction, +1% Target'
    },
    {
      id: 'strat-ob-1',
      code: 'OB_METHOD',
      name: 'OB Method',
      desc: 'Valid Bullish Order Block (3+ green pump preceded by red candle), 1H zone, 15M confirmation, retest & bullish close, +1% Target'
    },
    {
      id: 'strat-ict-1',
      code: 'ICT_METHOD',
      name: 'ICT Method',
      desc: '1H RSI 30-40, curr green / prev red, 2-3 green candles, ~1% pump pattern, trendline rule, 1H not sideways, +1% Target'
    }
  ];

  for (const s of seedStrategies) {
    const check = await db.query('SELECT id FROM strategies WHERE code = $1', [s.code]);
    if (check.rows.length === 0) {
      await db.query(
        'INSERT INTO strategies (id, code, name, description, is_enabled, target_pct) VALUES ($1, $2, $3, $4, true, 1.0)',
        [s.id, s.code, s.name, s.desc]
      );

      // Create v1.0 version
      const versionId = `ver-${s.code.toLowerCase()}-1.0`;
      await db.query(
        `INSERT INTO strategy_versions (id, strategy_id, version, source_rule_version, config_version, is_current, change_summary)
         VALUES ($1, $2, 'v1.0', '1.0', '1.0', true, 'Initial source implementation from handwritten trading methodology')`,
        [versionId, s.id]
      );
    }
  }

  // Seed default system risk settings
  const defaultSettings = [
    { key: 'RISK_MAX_POSITION_USD', val: { value: 500, label: 'Max Position Size USD' } },
    { key: 'RISK_MAX_SIMULTANEOUS_TRADES', val: { value: 3, label: 'Max Concurrent Positions' } },
    { key: 'RISK_DAILY_LOSS_LIMIT_PCT', val: { value: 3.0, label: 'Max Daily Loss Limit %' } },
    { key: 'RISK_COOLDOWN_MINUTES', val: { value: 15, label: 'Per-Symbol Cooldown Minutes' } },
    { key: 'TRADING_MODE', val: { value: 'ANALYSIS', label: 'Current Trading Mode (ANALYSIS, PAPER, LIVE)' } },
    { key: 'EMERGENCY_KILL_SWITCH', val: { value: false, label: 'Emergency Trading Kill Switch Active' } },
    { key: 'TARGET_PROFIT_PCT', val: { value: 1.0, label: 'Default Source Target Profit %' } },
    { key: 'TARGET_MODE', val: { value: 'NET', label: 'Profit Target Mode (GROSS or NET after fees)' } },
    { key: 'MAX_DATA_STALENESS_SECONDS', val: { value: 60, label: 'Max Allowed Data Age in Seconds' } }
  ];

  for (const set of defaultSettings) {
    const sCheck = await db.query('SELECT key FROM system_settings WHERE key = $1', [set.key]);
    if (sCheck.rows.length === 0) {
      await db.query(
        'INSERT INTO system_settings (key, value, description) VALUES ($1, $2, $3)',
        [set.key, JSON.stringify(set.val), set.val.label]
      );
    }
  }

  // Seed 34 Agents
  const agentsList = [
    { id: 'agt-1', name: 'Binance Data Agent', cat: 'DATA' },
    { id: 'agt-2', name: 'CoinGlass Data Agent', cat: 'DATA' },
    { id: 'agt-3', name: 'Data Validation Agent', cat: 'DATA' },
    { id: 'agt-4', name: 'Trend Agent', cat: 'ANALYSIS' },
    { id: 'agt-5', name: 'Market Structure Agent', cat: 'ANALYSIS' },
    { id: 'agt-6', name: 'RSI Agent', cat: 'ANALYSIS' },
    { id: 'agt-7', name: 'EMA Agent', cat: 'ANALYSIS' },
    { id: 'agt-8', name: 'V1 Agent', cat: 'ANALYSIS' },
    { id: 'agt-9', name: 'Liquidity Agent', cat: 'ANALYSIS' },
    { id: 'agt-10', name: 'Order Block Agent', cat: 'ANALYSIS' },
    { id: 'agt-11', name: 'ICT Structure Agent', cat: 'ANALYSIS' },
    { id: 'agt-12', name: 'Price Action Agent', cat: 'STRATEGY' },
    { id: 'agt-13', name: 'V1 Strategy Agent', cat: 'STRATEGY' },
    { id: 'agt-14', name: 'Gainers Strategy Agent', cat: 'STRATEGY' },
    { id: 'agt-15', name: 'Hidden Bullish Agent', cat: 'STRATEGY' },
    { id: 'agt-16', name: 'V1 + EMA Agent', cat: 'STRATEGY' },
    { id: 'agt-17', name: 'OB Strategy Agent', cat: 'STRATEGY' },
    { id: 'agt-18', name: 'ICT Strategy Agent', cat: 'STRATEGY' },
    { id: 'agt-19', name: 'Confluence Agent', cat: 'DECISION' },
    { id: 'agt-20', name: 'Risk Agent', cat: 'DECISION' },
    { id: 'agt-21', name: 'Signal Agent', cat: 'DECISION' },
    { id: 'agt-22', name: 'Paper Trading Agent', cat: 'EXECUTION' },
    { id: 'agt-23', name: 'Binance Execution Agent', cat: 'EXECUTION' },
    { id: 'agt-24', name: 'Position Monitor Agent', cat: 'EXECUTION' },
    { id: 'agt-25', name: 'Exit Agent', cat: 'EXECUTION' },
    { id: 'agt-26', name: 'Research Agent', cat: 'INTELLIGENCE' },
    { id: 'agt-27', name: 'Command Agent', cat: 'INTELLIGENCE' },
    { id: 'agt-28', name: 'Explanation Agent', cat: 'INTELLIGENCE' },
    { id: 'agt-29', name: 'Notification Agent', cat: 'OPERATIONS' },
    { id: 'agt-30', name: 'Journal Agent', cat: 'OPERATIONS' },
    { id: 'agt-31', name: 'Backtest Agent', cat: 'OPERATIONS' },
    { id: 'agt-32', name: 'Replay Agent', cat: 'OPERATIONS' },
    { id: 'agt-33', name: 'Performance Agent', cat: 'OPERATIONS' },
    { id: 'agt-34', name: 'Health Monitoring Agent', cat: 'OPERATIONS' }
  ];

  for (const ag of agentsList) {
    const aCheck = await db.query('SELECT id FROM agents WHERE id = $1', [ag.id]);
    if (aCheck.rows.length === 0) {
      await db.query(
        `INSERT INTO agents (id, name, category, status, is_enabled, version, current_task)
         VALUES ($1, $2, $3, 'RUNNING', true, '1.0.0', 'Active monitoring')`,
        [ag.id, ag.name, ag.cat]
      );
    }
  }

  console.log('[Database] Core seeds (admin, 7 strategies, settings, 34 agents) initialized.');
}
