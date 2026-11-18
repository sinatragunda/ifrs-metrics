export type TokenGetter = () => Promise<string | null | undefined> | string | null | undefined;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpRequestOptions = Omit<RequestInit, 'method' | 'body'> & {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | boolean | null | undefined>;
};

export class HttpError extends Error {
  readonly name = 'HttpError';
  readonly status: number;
  readonly statusText: string;
  readonly data: unknown;
  readonly url: string;

  constructor(response: Response, data: unknown, url: string) {
    const detail =
      typeof data === 'string' && data.trim()
        ? data.trim()
        : data && typeof data === 'object' && 'message' in data && typeof (data as { message: unknown }).message === 'string'
          ? (data as { message: string }).message
          : `${response.status} ${response.statusText}`;
    super(`HTTP ${detail}`);
    this.status = response.status;
    this.statusText = response.statusText;
    this.data = data;
    this.url = url;
  }
}

function readApiUrl() {
  const configured = String(import.meta.env.IFFR_METRICS_API_URL ?? '').trim().replace(/\/+$/, '');
  return configured || 'http://localhost:8000';
}

function buildUrl(baseUrl: string, path: string, query?: HttpRequestOptions['query']) {
  const normalizedPath = path.startsWith('http://') || path.startsWith('https://')
    ? path
    : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const url = new URL(normalizedPath);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return null;
  const text = await response.text();
  if (!text) return null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json') || text.trimStart().startsWith('{') || text.trimStart().startsWith('[')) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }
  return text;
}

export class HttpService {
  private tokenGetter: TokenGetter | null = null;

  get apiUrl() {
    return readApiUrl();
  }

  setTokenGetter(getter: TokenGetter | null) {
    this.tokenGetter = getter;
  }

  async request<T = unknown>(path: string, options: HttpRequestOptions = {}): Promise<T> {
    const { method = 'GET', body, auth = true, query, headers: headersInit, ...init } = options;
    const url = buildUrl(this.apiUrl, path, query);
    const headers = new Headers(headersInit);

    headers.set('Access-Control-Allow-Origin', '*');

    if (auth && this.tokenGetter && !headers.has('Authorization')) {
      const token = await this.tokenGetter();
      console.log("token:", token);

      if (token) headers.set('Authorization', `Bearer ${token}`);
    }

    let requestBody: BodyInit | undefined;
    if (body !== undefined && body !== null) {
      if (body instanceof FormData || body instanceof Blob || typeof body === 'string') {
        requestBody = body;
      } else {
        if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
        requestBody = JSON.stringify(body);
      }
    }

    if (!headers.has('Accept')) headers.set('Accept', 'application/json');

    const response = await fetch(url, {
      ...init,
      method,
      headers,
      body: requestBody,
    });

    const data = await parseBody(response);
    if (!response.ok) throw new HttpError(response, data, url);
    return data as T;
  }

  get<T = unknown>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'body'>) {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T = unknown>(path: string, body?: unknown, options?: Omit<HttpRequestOptions, 'method' | 'body'>) {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  put<T = unknown>(path: string, body?: unknown, options?: Omit<HttpRequestOptions, 'method' | 'body'>) {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  patch<T = unknown>(path: string, body?: unknown, options?: Omit<HttpRequestOptions, 'method' | 'body'>) {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  delete<T = unknown>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'body'>) {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const httpService = new HttpService();
