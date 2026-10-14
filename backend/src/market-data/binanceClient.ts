import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Binance Public Market Data Endpoints in order of reliability.
 * 'https://data-api.binance.vision' is Binance's official public market data mirror
 * specifically hosted on global CloudFront CDN without datacenter IP restrictions (HTTP 418).
 */
export const BINANCE_PUBLIC_ENDPOINTS = [
  'https://data-api.binance.vision',
  'https://api.binance.com',
  'https://api1.binance.com',
  'https://api2.binance.com',
  'https://api3.binance.com'
];

let activeEndpointIndex = 0;
let circuitBreakerUntil = 0;
let circuitBreakerReason = '';

export function isBinanceCircuitBreakerActive(): boolean {
  return Date.now() < circuitBreakerUntil;
}

export function getBinanceCircuitBreakerRemainingSec(): number {
  return Math.max(0, Math.ceil((circuitBreakerUntil - Date.now()) / 1000));
}

// Global pacer: enforces at least 200ms gap between outgoing requests (~5 req/sec max)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 200;
let requestQueue = Promise.resolve();

function throttleRequest(): Promise<void> {
  const next = requestQueue.then(async () => {
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL_MS - elapsed));
    }
    lastRequestTime = Date.now();
  });
  requestQueue = next.catch(() => {});
  return next;
}

export const BINANCE_BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache'
};

/**
 * Perform a resilient, rate-limited GET request to Binance public REST API with:
 * 1. Circuit breaker on HTTP 418 / 429
 * 2. Token-bucket pacer to avoid hitting IP rate limits
 * 3. Automatic failover to public CloudFront mirror
 */
export async function binanceGet<T = any>(
  pathOrUrl: string,
  config: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> {
  // If circuit breaker is engaged, abort immediately to allow Binance IP ban to expire
  if (Date.now() < circuitBreakerUntil) {
    const remaining = Math.ceil((circuitBreakerUntil - Date.now()) / 1000);
    const err: any = new Error(`Binance circuit breaker active (${circuitBreakerReason}). Cooldown in progress (${remaining}s remaining).`);
    err.status = 418;
    err.code = 'CIRCUIT_BREAKER_ACTIVE';
    throw err;
  }

  // Enforce gentle spacing between requests
  await throttleRequest();

  // If a full URL is provided, strip base if it's binance.com to allow mirror rotation
  let path = pathOrUrl;
  if (path.startsWith('http')) {
    try {
      const parsed = new URL(pathOrUrl);
      path = `${parsed.pathname}${parsed.search}`;
    } catch {
      // keep as is
    }
  }

  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  const mergedHeaders = {
    ...BINANCE_BROWSER_HEADERS,
    ...(config.headers || {})
  };

  let lastError: any = null;
  const attempts = (config.timeout && config.timeout <= 2500) ? 2 : BINANCE_PUBLIC_ENDPOINTS.length;

  for (let i = 0; i < attempts; i++) {
    const idx = (activeEndpointIndex + i) % BINANCE_PUBLIC_ENDPOINTS.length;
    const base = BINANCE_PUBLIC_ENDPOINTS[idx];
    const fullUrl = `${base}${path}`;

    try {
      const response = await axios.get<T>(fullUrl, {
        ...config,
        headers: mergedHeaders,
        timeout: config.timeout || 6000
      });

      // Update active endpoint to the working one
      activeEndpointIndex = idx;
      return response;
    } catch (err: any) {
      lastError = err;
      const status = err.response?.status || err.status || (String(err.message).includes('418') ? 418 : undefined);

      // Handle 418 (IP auto-ban) or 429 (Rate limited) by engaging circuit breaker and stopping retries
      if (status === 418 || status === 429) {
        const retryHeader = err.response?.headers?.['retry-after'];
        const retrySec = parseInt(retryHeader || '30', 10);
        // Use shorter cooldown on cloud deployments — Binance data-api.binance.vision CDN bypasses most bans
        const cooldown = Math.min(60, Math.max(30, isNaN(retrySec) ? 30 : retrySec));
        circuitBreakerUntil = Date.now() + (cooldown * 1000);
        circuitBreakerReason = `HTTP ${status} (Cooldown: ${cooldown}s)`;
        console.warn(`[BinanceClient] Throttled by Binance (${circuitBreakerReason}). Pausing outbound calls until ${new Date(circuitBreakerUntil).toLocaleTimeString()}.`);
        // Rotate to next mirror before giving up — data-api.binance.vision often bypasses IP bans
        activeEndpointIndex = (activeEndpointIndex + 1) % BINANCE_PUBLIC_ENDPOINTS.length;
        throw err; // Stop trying other mirrors immediately; ban applies to IP across all mirrors!
      }

      // Failover for geographic blocks (451), forbidden (403), gateway/server errors (5xx), connection aborts, DNS, timeouts:
      if (!status || status >= 403 || err.code === 'ECONNABORTED' || err.code === 'ENOTFOUND' || err.code === 'ECONNRESET') {
        const errDetail = err.code || (status ? `HTTP ${status}` : err.message);
        console.warn(`[BinanceClient] ${base} returned ${errDetail}, failing over to next mirror...`);
        continue;
      }

      // Re-throw if it's a client bad request (e.g., invalid symbol 400, 404)
      if (status && status < 403) {
        throw err;
      }
    }
  }

  throw lastError;
}

export function getActiveBinanceEndpoint(): string {
  return BINANCE_PUBLIC_ENDPOINTS[activeEndpointIndex];
}
