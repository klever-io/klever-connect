/**
 * Configuration options for HttpClient
 */
export interface HttpClientConfig {
  /** Base URL for all HTTP requests */
  baseUrl: string
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number
  /** Default headers to include in all requests */
  headers?: Record<string, string>
  /** Number of retry attempts for failed requests (default: 3) */
  retries?: number
}

/**
 * Options for individual HTTP requests
 */
export interface RequestOptions {
  /** HTTP method to use (default: GET) */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** Headers to include in this specific request */
  headers?: Record<string, string>
  /** Request body (will be JSON stringified) */
  body?: unknown
  /** Request timeout in milliseconds */
  timeout?: number
}

/**
 * HTTP client with built-in retry logic and timeout handling
 *
 * Features:
 * - Automatic retries with exponential backoff
 * - Configurable timeout per request
 * - Default JSON content type
 * - Proper error handling for HTTP status codes
 * - Does not retry client errors (4xx)
 *
 * @example
 * ```typescript
 * const client = new HttpClient({
 *   baseUrl: 'https://api.example.com',
 *   timeout: 10000,
 *   retries: 3
 * })
 *
 * // GET request
 * const data = await client.get<UserData>('/users/123')
 *
 * // POST request
 * const result = await client.post<CreateResult>('/users', {
 *   name: 'John',
 *   email: 'john@example.com'
 * })
 * ```
 */
export class HttpClient {
  private baseUrl: string
  private timeout: number
  private headers: Record<string, string>
  private retries: number

  /**
   * Creates a new HttpClient instance
   *
   * @param config - Client configuration
   */
  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl
    this.timeout = config.timeout ?? 30000
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    }
    this.retries = config.retries ?? 3
  }

  /**
   * Makes an HTTP request with automatic retries and timeout handling
   *
   * Implements exponential backoff for retries:
   * - 1st retry: wait 1 second
   * - 2nd retry: wait 2 seconds
   * - 3rd retry: wait 4 seconds
   *
   * Client errors (4xx) are not retried.
   *
   * @param path - API path to request (will be appended to baseUrl)
   * @param options - Request options (method, headers, body, timeout)
   * @returns Promise resolving to the parsed JSON response
   * @throws {Error} If all retry attempts fail or response is not ok
   *
   * @example
   * ```typescript
   * const response = await client.request<UserData>('/users/123', {
   *   method: 'GET',
   *   headers: { 'Authorization': 'Bearer token' }
   * })
   * ```
   */
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const method = options.method ?? 'GET'
    const headers = { ...this.headers, ...options.headers }
    const timeout = options.timeout ?? this.timeout

    let lastError: Error | undefined

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
          method,
          headers,
          body: options.body ? JSON.stringify(options.body) : null,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorBody = await response.text()
          throw new Error(`HTTP ${response.status}: ${errorBody}`)
        }

        const data = await response.json()
        return data as T
      } catch (error) {
        lastError = error as Error

        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          throw error
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.retries) {
          await this.sleep(Math.pow(2, attempt) * 1000)
        }
      }
    }

    throw lastError ?? new Error('Request failed')
  }

  /**
   * Makes a GET request
   *
   * @param path - API path to request
   * @param options - Optional request options
   * @returns Promise resolving to the parsed JSON response
   *
   * @example
   * ```typescript
   * const user = await client.get<User>('/users/123')
   * const users = await client.get<User[]>('/users', {
   *   headers: { 'X-Custom-Header': 'value' }
   * })
   * ```
   */
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  /**
   * Makes a POST request
   *
   * @param path - API path to request
   * @param body - Request body (will be JSON stringified)
   * @param options - Optional request options
   * @returns Promise resolving to the parsed JSON response
   *
   * @example
   * ```typescript
   * const result = await client.post<CreateResult>('/users', {
   *   name: 'John',
   *   email: 'john@example.com'
   * })
   *
   * const response = await client.post<Response>('/api/action', payload, {
   *   timeout: 5000
   * })
   * ```
   */
  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body })
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
