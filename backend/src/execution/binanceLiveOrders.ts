/**
 * Binance Live Order Execution Service
 *
 * Handles all authenticated Binance REST API calls for live trading:
 * - HMAC-SHA256 request signing (required by Binance Signed endpoints)
 * - API key permission validation (canTrade check, canWithdraw block)
 * - MARKET BUY / SELL order placement
 * - Real account balance querying
 * - Testnet / Live toggle via BINANCE_TESTNET env variable
 *
 * Safety guarantees:
 * - Zero withdrawal permission is asserted on connect — if canWithdraw is true, connection is rejected
 * - All orders use MARKET type for immediate fills at best price
 * - Quantity computed from USD position size / current market price
 */

import crypto from 'crypto';
import axios, { AxiosError } from 'axios';
import { decryptSecret } from '../security/encryption.js';
import { getDb } from '../database/db.js';

// Toggle between testnet and production via environment variable
const IS_TESTNET = process.env.BINANCE_TESTNET === 'true';

const BASE_URL = IS_TESTNET
  ? 'https://testnet.binance.vision'
  : 'https://api.binance.com';

export interface BinancePermissions {
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  accountType: string;
  ipRestricted: boolean;
}

export interface BinanceBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface BinanceAccountInfo {
  permissions: BinancePermissions;
  balances: BinanceBalance[];
  makerCommission: number;
  takerCommission: number;
  updateTime: number;
  isTestnet: boolean;
}

export interface BinanceOrderResult {
  orderId: number;
  clientOrderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET';
  status: string;
  executedQty: number;
  cummulativeQuoteQty: number;
  fills: Array<{
    price: number;
    qty: number;
    commission: number;
    commissionAsset: string;
  }>;
  avgFillPrice: number;
  transactTime: number;
}

export interface LiveCredentials {
  apiKey: string;
  apiSecret: string;
}

/**
 * Create HMAC-SHA256 signature for Binance signed endpoints
 */
function signQuery(queryString: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(queryString)
    .digest('hex');
}

/**
 * Build a signed query string with timestamp and signature
 */
function buildSignedParams(params: Record<string, string | number>, secret: string): string {
  const timestamp = Date.now();
  const paramStr = Object.entries({ ...params, timestamp })
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  const signature = signQuery(paramStr, secret);
  return `${paramStr}&signature=${signature}`;
}

/**
 * Load stored encrypted credentials from DB and decrypt them
 */
export async function loadStoredCredentials(userId?: string): Promise<LiveCredentials | null> {
  try {
    const db = await getDb();
    let query = `SELECT encrypted_api_key, encrypted_api_secret 
                 FROM api_credentials 
                 WHERE status = 'active'`;
    const params: any[] = [];
    if (userId) {
      query += ` AND user_id = $1`;
      params.push(userId);
    }
    query += ` ORDER BY last_validated_at DESC LIMIT 1`;

    const res = await db.query(query, params);
    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    const apiKey = decryptSecret(row.encrypted_api_key);
    const apiSecret = decryptSecret(row.encrypted_api_secret);

    if (!apiKey || !apiSecret) return null;
    return { apiKey, apiSecret };
  } catch (err: any) {
    console.warn('[BinanceLive] Failed to load credentials from DB:', err.message);
    return null;
  }
}

/**
 * Load all active user credentials for multi-account operations
 */
export async function loadAllActiveUserCredentials(): Promise<Array<{ userId: string; creds: LiveCredentials }>> {
  try {
    const db = await getDb();
    const res = await db.query(
      `SELECT user_id, encrypted_api_key, encrypted_api_secret 
       FROM api_credentials 
       WHERE status = 'active'`
    );
    const results: Array<{ userId: string; creds: LiveCredentials }> = [];
    for (const row of res.rows) {
      const apiKey = decryptSecret(row.encrypted_api_key);
      const apiSecret = decryptSecret(row.encrypted_api_secret);
      if (apiKey && apiSecret) {
        results.push({ userId: row.user_id, creds: { apiKey, apiSecret } });
      }
    }
    return results;
  } catch (err: any) {
    console.warn('[BinanceLive] Failed to load multi-user credentials:', err.message);
    return [];
  }
}

/**
 * Validate API key permissions against Binance.
 * CRITICAL: Rejects any key that has canWithdraw = true.
 */
export async function validateApiPermissions(creds: LiveCredentials): Promise<{
  valid: boolean;
  error?: string;
  accountInfo?: BinanceAccountInfo;
}> {
  try {
    const queryString = buildSignedParams({}, creds.apiSecret);

    const response = await axios.get(`${BASE_URL}/api/v3/account?${queryString}`, {
      headers: { 'X-MBX-APIKEY': creds.apiKey },
      timeout: 8000
    });

    const data = response.data;

    const permissions: BinancePermissions = {
      canTrade: Boolean(data.canTrade),
      canWithdraw: Boolean(data.canWithdraw),
      canDeposit: Boolean(data.canDeposit),
      accountType: data.accountType || 'SPOT',
      ipRestricted: Boolean(data.requireSelfTradePrevention)
    };

    // SAFETY: Reject any key with withdrawal permission enabled
    if (permissions.canWithdraw) {
      return {
        valid: false,
        error: 'WITHDRAWAL_PERMISSION_DETECTED: This API key has withdrawal permission enabled. ApexCrypto Pro strictly prohibits withdrawal-enabled keys. Create a new API key with only SPOT TRADING permission.'
      };
    }

    if (!permissions.canTrade) {
      return {
        valid: false,
        error: 'TRADE_PERMISSION_MISSING: This API key does not have trading permission enabled. Enable SPOT TRADING in your Binance API key settings.'
      };
    }

    // Parse balances — filter to significant holdings only
    const balances: BinanceBalance[] = (data.balances || [])
      .map((b: any) => ({
        asset: b.asset,
        free: parseFloat(b.free),
        locked: parseFloat(b.locked),
        total: parseFloat(b.free) + parseFloat(b.locked)
      }))
      .filter((b: BinanceBalance) => b.total > 0.00001)
      .sort((a: BinanceBalance, b: BinanceBalance) => {
        // USDT first, then by total descending
        if (a.asset === 'USDT') return -1;
        if (b.asset === 'USDT') return 1;
        return b.total - a.total;
      })
      .slice(0, 20);

    const accountInfo: BinanceAccountInfo = {
      permissions,
      balances,
      makerCommission: data.makerCommission / 10000,
      takerCommission: data.takerCommission / 10000,
      updateTime: data.updateTime,
      isTestnet: IS_TESTNET
    };

    return { valid: true, accountInfo };
  } catch (err: any) {
    const axiosErr = err as AxiosError<any>;
    if (axiosErr.response?.data?.msg) {
      return { valid: false, error: `Binance API error: ${axiosErr.response.data.msg}` };
    }
    return { valid: false, error: `Connection failed: ${err.message}` };
  }
}

/**
 * Get current account balances (for live dashboard)
 */
export async function getLiveAccountBalance(creds: LiveCredentials): Promise<BinanceBalance[]> {
  try {
    const queryString = buildSignedParams({}, creds.apiSecret);
    const response = await axios.get(`${BASE_URL}/api/v3/account?${queryString}`, {
      headers: { 'X-MBX-APIKEY': creds.apiKey },
      timeout: 8000
    });

    return (response.data.balances || [])
      .map((b: any) => ({
        asset: b.asset,
        free: parseFloat(b.free),
        locked: parseFloat(b.locked),
        total: parseFloat(b.free) + parseFloat(b.locked)
      }))
      .filter((b: BinanceBalance) => b.total > 0.00001)
      .sort((a: BinanceBalance, b: BinanceBalance) => {
        if (a.asset === 'USDT') return -1;
        if (b.asset === 'USDT') return 1;
        return b.total - a.total;
      })
      .slice(0, 20);
  } catch (err: any) {
    console.warn('[BinanceLive] Balance fetch failed:', err.message);
    return [];
  }
}

/**
 * Get current symbol price from Binance
 */
async function getCurrentPrice(symbol: string): Promise<number> {
  try {
    const response = await axios.get(`${BASE_URL}/api/v3/ticker/price`, {
      params: { symbol },
      timeout: 5000
    });
    return parseFloat(response.data.price);
  } catch {
    return 0;
  }
}

/**
 * Get symbol trading filters (min notional, lot size, tick size)
 */
async function getSymbolFilters(symbol: string): Promise<{
  minQty: number;
  stepSize: number;
  minNotional: number;
}> {
  try {
    const response = await axios.get(`${BASE_URL}/api/v3/exchangeInfo`, {
      params: { symbol },
      timeout: 6000
    });
    const symbolInfo = response.data.symbols?.[0];
    if (!symbolInfo) return { minQty: 0.001, stepSize: 0.001, minNotional: 10 };

    let minQty = 0.001;
    let stepSize = 0.001;
    let minNotional = 10;

    for (const filter of (symbolInfo.filters || [])) {
      if (filter.filterType === 'LOT_SIZE') {
        minQty = parseFloat(filter.minQty);
        stepSize = parseFloat(filter.stepSize);
      }
      if (filter.filterType === 'MIN_NOTIONAL' || filter.filterType === 'NOTIONAL') {
        minNotional = parseFloat(filter.minNotional || filter.minNotionalValue || 10);
      }
    }
    return { minQty, stepSize, minNotional };
  } catch {
    return { minQty: 0.001, stepSize: 0.001, minNotional: 10 };
  }
}

/**
 * Round quantity to step size precision required by Binance
 */
function roundToStepSize(qty: number, stepSize: number): number {
  const precision = Math.max(0, -Math.floor(Math.log10(stepSize)));
  return parseFloat(qty.toFixed(precision));
}

/**
 * Place a MARKET BUY order on Binance
 * Quantity is calculated as: positionSizeUSD / currentPrice
 */
export async function placeLiveMarketBuy(
  creds: LiveCredentials,
  symbol: string,
  positionSizeUSD: number,
  clientOrderId: string
): Promise<BinanceOrderResult> {
  const currentPrice = await getCurrentPrice(symbol);
  if (currentPrice <= 0) {
    throw new Error(`[BinanceLive] Could not fetch current price for ${symbol}`);
  }

  const filters = await getSymbolFilters(symbol);
  const rawQty = positionSizeUSD / currentPrice;
  const qty = roundToStepSize(rawQty, filters.stepSize);

  // Enforce minimum notional value
  if (qty * currentPrice < filters.minNotional) {
    throw new Error(
      `[BinanceLive] Order notional $${(qty * currentPrice).toFixed(2)} < minNotional $${filters.minNotional} for ${symbol}`
    );
  }

  const params: Record<string, string | number> = {
    symbol,
    side: 'BUY',
    type: 'MARKET',
    quantity: qty,
    newClientOrderId: clientOrderId
  };

  const queryString = buildSignedParams(params, creds.apiSecret);

  console.log(`[BinanceLive] Placing MARKET BUY: ${symbol} qty=${qty} (~$${positionSizeUSD}) @ ~${currentPrice} [${IS_TESTNET ? 'TESTNET' : 'LIVE'}]`);

  try {
    const response = await axios.post(
      `${BASE_URL}/api/v3/order`,
      null,
      {
        params: Object.fromEntries(
          (queryString + '').split('&').map(p => p.split('=').map(decodeURIComponent))
        ),
        headers: { 'X-MBX-APIKEY': creds.apiKey },
        timeout: 10000
      }
    );

    const d = response.data;
    const fills = d.fills || [];
    const totalQty = fills.reduce((s: number, f: any) => s + parseFloat(f.qty), 0);
    const totalQuote = fills.reduce((s: number, f: any) => s + parseFloat(f.qty) * parseFloat(f.price), 0);
    const avgFillPrice = totalQty > 0 ? totalQuote / totalQty : currentPrice;

    return {
      orderId: d.orderId,
      clientOrderId: d.clientOrderId,
      symbol: d.symbol,
      side: 'BUY',
      type: 'MARKET',
      status: d.status,
      executedQty: parseFloat(d.executedQty),
      cummulativeQuoteQty: parseFloat(d.cummulativeQuoteQty),
      fills,
      avgFillPrice,
      transactTime: d.transactTime
    };
  } catch (err: any) {
    const axiosErr = err as AxiosError<any>;
    const msg = axiosErr.response?.data?.msg || err.message;
    throw new Error(`[BinanceLive] BUY order failed for ${symbol}: ${msg}`);
  }
}

/**
 * Place a MARKET SELL order on Binance
 * Closes out the full quantity of the position
 */
export async function placeLiveMarketSell(
  creds: LiveCredentials,
  symbol: string,
  quantity: number,
  clientOrderId: string
): Promise<BinanceOrderResult> {
  const filters = await getSymbolFilters(symbol);
  const qty = roundToStepSize(quantity, filters.stepSize);

  const params: Record<string, string | number> = {
    symbol,
    side: 'SELL',
    type: 'MARKET',
    quantity: qty,
    newClientOrderId: clientOrderId
  };

  const queryString = buildSignedParams(params, creds.apiSecret);

  console.log(`[BinanceLive] Placing MARKET SELL: ${symbol} qty=${qty} [${IS_TESTNET ? 'TESTNET' : 'LIVE'}]`);

  try {
    const response = await axios.post(
      `${BASE_URL}/api/v3/order`,
      null,
      {
        params: Object.fromEntries(
          (queryString + '').split('&').map(p => p.split('=').map(decodeURIComponent))
        ),
        headers: { 'X-MBX-APIKEY': creds.apiKey },
        timeout: 10000
      }
    );

    const d = response.data;
    const fills = d.fills || [];
    const totalQty = fills.reduce((s: number, f: any) => s + parseFloat(f.qty), 0);
    const totalQuote = fills.reduce((s: number, f: any) => s + parseFloat(f.qty) * parseFloat(f.price), 0);
    const avgFillPrice = totalQty > 0 ? totalQuote / totalQty : 0;

    return {
      orderId: d.orderId,
      clientOrderId: d.clientOrderId,
      symbol: d.symbol,
      side: 'SELL',
      type: 'MARKET',
      status: d.status,
      executedQty: parseFloat(d.executedQty),
      cummulativeQuoteQty: parseFloat(d.cummulativeQuoteQty),
      fills,
      avgFillPrice,
      transactTime: d.transactTime
    };
  } catch (err: any) {
    const axiosErr = err as AxiosError<any>;
    const msg = axiosErr.response?.data?.msg || err.message;
    throw new Error(`[BinanceLive] SELL order failed for ${symbol}: ${msg}`);
  }
}

/**
 * Cancel all open orders for a symbol (used during emergency halt)
 */
export async function cancelAllOpenOrders(
  creds: LiveCredentials,
  symbol: string
): Promise<number> {
  try {
    const params: Record<string, string | number> = { symbol };
    const queryString = buildSignedParams(params, creds.apiSecret);

    const response = await axios.delete(
      `${BASE_URL}/api/v3/openOrders`,
      {
        params: Object.fromEntries(
          (queryString + '').split('&').map(p => p.split('=').map(decodeURIComponent))
        ),
        headers: { 'X-MBX-APIKEY': creds.apiKey },
        timeout: 8000
      }
    );

    const cancelled = Array.isArray(response.data) ? response.data.length : 0;
    console.log(`[BinanceLive] Cancelled ${cancelled} open orders for ${symbol}`);
    return cancelled;
  } catch (err: any) {
    console.warn(`[BinanceLive] Cancel orders failed for ${symbol}:`, err.message);
    return 0;
  }
}

export const isTestnet = IS_TESTNET;
