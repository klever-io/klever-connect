export interface HttpClientConfig {
  baseUrl: string
  timeout?: number
  headers?: Record<string, string>
  retries?: number
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
}

export class HttpClient {
  private baseUrl: string
  private timeout: number
  private headers: Record<string, string>
  private retries: number

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl
    this.timeout = config.timeout ?? 30000
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    }
    this.retries = config.retries ?? 3
  }

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

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body })
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
