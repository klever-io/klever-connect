/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KLEVER_LOG_LEVEL?: string
  readonly KLEVER_LOG_LEVEL?: string
  // Add more env vars as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
