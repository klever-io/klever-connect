/**
 * Global type augmentations for cross-platform compatibility
 * Augments ImportMeta to support env properties from Vite and other bundlers
 *
 * Note: This is a library, so we don't reference vite/client.
 * Consumers using Vite will get these types merged with Vite's types automatically.
 */

declare global {
  interface ImportMetaEnv {
    /**
     * Log level for Klever SDK (Vite convention)
     * @example 'debug' | 'info' | 'warn' | 'error' | 'silent'
     */
    readonly VITE_KLEVER_LOG_LEVEL?: string

    /**
     * Log level for Klever SDK (non-Vite environments)
     * @example 'debug' | 'info' | 'warn' | 'error' | 'silent'
     */
    readonly KLEVER_LOG_LEVEL?: string

    // Allow any other env variables
    [key: string]: string | undefined
  }

  interface ImportMeta {
    /**
     * Environment variables (available in Vite and other modern bundlers)
     */
    readonly env?: ImportMetaEnv
  }
}

// This export {} makes TypeScript treat this file as a module
// which is required for declare global to work properly
export {}
