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

export const BINANCE_BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache'
};

/**
 * Perform a resilient GET request to Binance public REST API with automatic mirror failover
 * and browser user-agent headers to prevent HTTP 418/451 datacenter blocks.
 */
export async function binanceGet<T = any>(
  pathOrUrl: string,
  config: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> {
  // If a full URL is provided, strip base if it's binance.com to allow mirror rotation
  let path = pathOrUrl;
  if (path.startsWith('http')) {
    try {
      const parsed = new URL(pathOrUrl);
      path = `${parsed.pathname}${parsed.search}`;
    } catch (e) {
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
        timeout: config.timeout || 5000
      });

      // Update active endpoint to the working one
      activeEndpointIndex = idx;
      return response;
    } catch (err: any) {
      lastError = err;
      const status = err.response?.status;

      // Failover for geographic blocks (451), bans (418), rate limits (429), forbidden (403),
      // gateway/server errors (5xx), connection aborts, DNS, timeouts:
      if (!status || status >= 403 || err.code === 'ECONNABORTED' || err.code === 'ENOTFOUND' || err.code === 'ECONNRESET') {
        console.warn(`[BinanceClient] ${base} returned ${status || err.code || err.message}, failing over to next mirror...`);
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
