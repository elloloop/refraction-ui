export interface RequestOptions extends Omit<RequestInit, 'body'> {
  timeout?: number;
  body?: any;
}

export type GetTokenFunction = () => string | null | Promise<string | null>;

export interface HttpConfig {
  baseUrl?: string;
  getToken?: GetTokenFunction;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export class HttpError extends Error {
  status: number;
  statusText: string;
  data: any;

  constructor(message: string, status: number, statusText: string, data: any) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

export class HttpClient {
  private config: HttpConfig;

  constructor(config: HttpConfig = {}) {
    this.config = {
      timeout: 10000,
      ...config,
    };
  }

  private async getAuthHeader(): Promise<Record<string, string>> {
    if (!this.config.getToken) return {};
    const token = await this.config.getToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  private async fetchWithTimeout(url: string, options: RequestInit & { timeout?: number }): Promise<Response> {
    const { timeout = this.config.timeout, ...fetchOptions } = options;

    if (!timeout) {
      return fetch(url, fetchOptions);
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(id);
    }
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    const url = this.config.baseUrl ? `${this.config.baseUrl}${endpoint}` : endpoint;
    const authHeaders = await this.getAuthHeader();

    // Check if body is FormData or URLSearchParams. If so, don't set Content-Type so the browser sets it automatically with the boundary
    const isFormDataOrSearchParams =
      options.body instanceof FormData || options.body instanceof URLSearchParams;

    const baseHeaders = {
      ...this.config.headers,
      ...authHeaders,
      ...(options.headers as Record<string, string>),
    };

    if (!isFormDataOrSearchParams && !baseHeaders['Content-Type']) {
      baseHeaders['Content-Type'] = 'application/json';
    }

    const finalOptions: RequestInit & { timeout?: number } = {
      ...options,
      headers: baseHeaders,
      body:
        options.body && !isFormDataOrSearchParams && typeof options.body !== 'string'
          ? JSON.stringify(options.body)
          : (options.body as BodyInit),
    };

    const response = await this.fetchWithTimeout(url, finalOptions);

    let data: any = null;
    const contentType = response.headers.get('content-type');
    
    // Attempt to parse response
    if (response.status !== 204) { // No content
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
      } catch (e) {
        // Ignored, might be empty body or unparseable text
      }
    }

    if (!response.ok) {
      throw new HttpError(
        `HTTP Error: ${response.status} ${response.statusText}`,
        response.status,
        response.statusText,
        data
      );
    }

    return {
      data: data as T,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  get<T>(endpoint: string, options?: Omit<RequestOptions, 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  put<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  patch<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const createHttpClient = (config?: HttpConfig) => new HttpClient(config);
