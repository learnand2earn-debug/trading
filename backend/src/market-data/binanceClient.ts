import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Binance Public Market Data Endpoints.
 * 'https://data-api.binance.vision' is Binance's official public market data mirror
 * specifically hosted on global CloudFront CDN without datacenter IP restrictions (HTTP 418).
 * Datacenter IPs (Render, AWS, GCP, etc.) must route strictly through this CDN endpoint.
 */
export const BINANCE_PUBLIC_ENDPOINTS = [
  'https://data-api.binance.vision'
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
 * Perform a resilient, rate-limited GET request to Binance public REST API.
 * Uses Binance CloudFront CDN ('https://data-api.binance.vision') exclusively
 * to eliminate cloud provider HTTP 418 IP bans.
 */
export async function binanceGet<T = any>(
  pathOrUrl: string,
  config: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> {
  // If circuit breaker is engaged, abort immediately to allow rate limit to cool down
  if (Date.now() < circuitBreakerUntil) {
    const remaining = Math.ceil((circuitBreakerUntil - Date.now()) / 1000);
    const err: any = new Error(`Binance circuit breaker active (${circuitBreakerReason}). Cooldown in progress (${remaining}s remaining).`);
    err.status = 429;
    err.code = 'CIRCUIT_BREAKER_ACTIVE';
    throw err;
  }

  // Enforce gentle spacing between requests
  await throttleRequest();

  // If a full URL is provided (e.g. api.binance.com), strip hostname and route to CloudFront CDN
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

  const primaryBase = BINANCE_PUBLIC_ENDPOINTS[0];
  const fullUrl = `${primaryBase}${path}`;
  const maxRetries = 2;
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      // Backoff pause before retry
      await new Promise(r => setTimeout(r, 600 * attempt));
    }

    try {
      const response = await axios.get<T>(fullUrl, {
        ...config,
        headers: mergedHeaders,
        timeout: config.timeout || 12000
      });

      return response;
    } catch (err: any) {
      lastError = err;
      const status = err.response?.status || err.status;

      // Handle 429 (Rate limited) by engaging temporary circuit breaker
      if (status === 429) {
        const retryHeader = err.response?.headers?.['retry-after'];
        const retrySec = parseInt(retryHeader || '15', 10);
        const cooldown = Math.min(30, Math.max(10, isNaN(retrySec) ? 15 : retrySec));
        circuitBreakerUntil = Date.now() + (cooldown * 1000);
        circuitBreakerReason = `HTTP 429 Rate Limit (Cooldown: ${cooldown}s)`;
        console.warn(`[BinanceClient] Throttled by Binance (${circuitBreakerReason}). Pausing outbound calls until ${new Date(circuitBreakerUntil).toLocaleTimeString()}.`);
        throw err;
      }

      // If HTTP 418 was encountered (legacy IP ban), bypass circuit breaker since data-api.binance.vision is CDN-backed
      if (status === 418) {
        console.warn(`[BinanceClient] Notice: HTTP 418 bypassed on CloudFront CDN endpoint.`);
        continue;
      }

      // Client errors (400, 404, invalid symbol) should not retry
      if (status && status < 429) {
        throw err;
      }

      // Network abort or 5xx: log and retry
      const errDetail = err.code || (status ? `HTTP ${status}` : err.message);
      if (attempt < maxRetries) {
        console.warn(`[BinanceClient] ${primaryBase} returned ${errDetail}, retrying (attempt ${attempt + 1}/${maxRetries})...`);
      }
    }
  }

  throw lastError;
}

export function getActiveBinanceEndpoint(): string {
  return BINANCE_PUBLIC_ENDPOINTS[0];
}
