import express from '../backend/node_modules/express/index.js';
import http from 'http';
import { apiRouter } from '../backend/src/routes/api.js';
import { getDb } from '../backend/src/database/db.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedTests++;
  }
}

async function runApiTests() {
  console.log('===============================================================');
  console.log(' APEXCRYPTO REST API ENDPOINTS VERIFICATION SUITE');
  console.log('===============================================================');

  // Pre-initialize DB
  await getDb();

  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    // 1. GET /api/health
    console.log('\n[1] Testing GET /api/health...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint returns HTTP 200');
    assert(healthData.status === 'HEALTHY', 'Health status is HEALTHY');
    assert(healthData.database === 'HEALTHY', 'Database connection status is HEALTHY');

    // 2. GET /api/strategies
    console.log('\n[2] Testing GET /api/strategies...');
    const stratRes = await fetch(`${baseUrl}/strategies`);
    const stratData = await stratRes.json();
    assert(stratRes.status === 200, 'Strategies endpoint returns HTTP 200');
    assert(Array.isArray(stratData) && stratData.length === 7, `Returns exactly 7 core strategies, got ${stratData.length}`);
    const stratCodes = stratData.map((s: any) => s.code);
    assert(stratCodes.includes('PRICE_ACTION'), 'Includes PRICE_ACTION');
    assert(stratCodes.includes('V1_METHOD'), 'Includes V1_METHOD');
    assert(stratCodes.includes('GAINERS_METHOD'), 'Includes GAINERS_METHOD');
    assert(stratCodes.includes('HIDDEN_BULLISH'), 'Includes HIDDEN_BULLISH');
    assert(stratCodes.includes('V1_EMA'), 'Includes V1_EMA');
    assert(stratCodes.includes('OB_METHOD'), 'Includes OB_METHOD');
    assert(stratCodes.includes('ICT_METHOD'), 'Includes ICT_METHOD');

    // 3. GET /api/agents
    console.log('\n[3] Testing GET /api/agents...');
    const agentsRes = await fetch(`${baseUrl}/agents`);
    const agentsData = await agentsRes.json();
    const agentList = Array.isArray(agentsData) ? agentsData : (agentsData.agents || []);
    assert(agentsRes.status === 200, 'Agents endpoint returns HTTP 200');
    assert(Array.isArray(agentList) && agentList.length === 34, `Returns exactly 34 system agents, got ${agentList.length}`);

    // 4. GET /api/risk/status
    console.log('\n[4] Testing GET /api/risk/status...');
    const riskRes = await fetch(`${baseUrl}/risk/status`);
    const riskData = await riskRes.json();
    assert(riskRes.status === 200, 'Risk status returns HTTP 200');
    assert(typeof riskData.emergencyHaltActive === 'boolean', 'Contains emergencyHaltActive boolean');
    assert(riskData.config?.maxSimultaneousTrades === 3, 'Enforces max 3 simultaneous trades');

    // 5. GET /api/admin/rules
    console.log('\n[5] Testing GET /api/admin/rules...');
    const rulesRes = await fetch(`${baseUrl}/admin/rules`);
    const rulesData = await rulesRes.json();
    assert(rulesRes.status === 200, 'Admin rules endpoint returns HTTP 200');
    assert(Array.isArray(rulesData) && rulesData.length >= 4, `Returns at least 4 configurable ambiguous rules, got ${rulesData.length}`);

    // 6. POST /api/risk/emergency-stop and POST /api/risk/reset-emergency
    console.log('\n[6] Testing Emergency Stop & Reset...');
    const killRes = await fetch(`${baseUrl}/risk/emergency-stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor: 'api_test_runner' })
    });
    const killData = await killRes.json();
    assert(killRes.status === 200, 'Emergency stop returns HTTP 200');
    assert(killData.emergencyHaltActive === true, 'Emergency stop activates kill switch');

    const resetRes = await fetch(`${baseUrl}/risk/reset-emergency`, { method: 'POST' });
    const resetData = await resetRes.json();
    assert(resetRes.status === 200, 'Reset emergency returns HTTP 200');
    assert(resetData.emergencyHaltActive === false, 'Reset emergency deactivates kill switch');

    // 7. POST /api/command
    console.log('\n[7] Testing POST /api/command...');
    const cmdRes = await fetch(`${baseUrl}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Emergency stop trading now' })
    });
    const cmdData = await cmdRes.json();
    assert(cmdRes.status === 200, 'Command endpoint returns HTTP 200');
    assert(cmdData.command?.action_type === 'EMERGENCY_STOP', 'Command endpoint parsed emergency stop action');

    // 8. GET /api/positions and GET /api/trades
    console.log('\n[8] Testing GET /api/positions & GET /api/trades...');
    const posRes = await fetch(`${baseUrl}/positions`);
    const posData = await posRes.json();
    assert(posRes.status === 200 && Array.isArray(posData), 'Positions endpoint returns array');

    const trdRes = await fetch(`${baseUrl}/trades`);
    const trdData = await trdRes.json();
    assert(trdRes.status === 200 && Array.isArray(trdData), 'Trades endpoint returns array');

    // 9. Multi-User Authentication & Portal Endpoints
    console.log('\n[9] Testing Multi-User Auth & Access Management...');
    // Admin login
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200, 'Admin login returns HTTP 200');
    assert(typeof adminLoginData.token === 'string', 'Admin login returns auth token');
    assert(adminLoginData.user?.role === 'ADMIN', 'Admin user has ADMIN role');

    // Client login
    const traderLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'trader1', password: 'trader123' })
    });
    const traderLoginData = await traderLoginRes.json();
    assert(traderLoginRes.status === 200, 'Trader1 login returns HTTP 200');
    assert(typeof traderLoginData.token === 'string', 'Trader1 login returns auth token');
    assert(traderLoginData.user?.role === 'USER', 'Trader1 user has USER role');

    // GET /api/auth/me for trader1
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${traderLoginData.token}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'GET /api/auth/me returns HTTP 200');
    assert(meData.user?.username === 'trader1', 'Profile returns correct username');
    assert(typeof meData.binance?.isConnected === 'boolean', 'Profile returns binance connection status');

    // Admin creates new client user
    const newUserRes = await fetch(`${baseUrl}/auth/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminLoginData.token}`
      },
      body: JSON.stringify({
        username: 'client_vip',
        email: 'vip@trading.io',
        password: 'vipPassword123',
        role: 'USER'
      })
    });
    const newUserData = await newUserRes.json();
    assert(newUserRes.status === 200, 'Admin user creation returns HTTP 200');
    assert(newUserData.user?.username === 'client_vip', 'Created user has correct username');

    // Admin lists all users
    const usersListRes = await fetch(`${baseUrl}/auth/users`, {
      headers: { Authorization: `Bearer ${adminLoginData.token}` }
    });
    const usersListData = await usersListRes.json();
    assert(usersListRes.status === 200, 'GET /api/auth/users returns HTTP 200');
    assert(Array.isArray(usersListData.users) && usersListData.users.length >= 3, 'User list includes admin, trader1, and new client');

    console.log('\n===============================================================');
    console.log(` API TEST RUN COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('===============================================================');

  } finally {
    server.closeAllConnections?.();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  if (failedTests > 0) {
    process.exit(1);
  }
}

runApiTests()
  .then(() => {
    setTimeout(() => process.exit(0), 100);
  })
  .catch((err) => {
    console.error('Fatal API test error:', err);
    process.exit(1);
  });
