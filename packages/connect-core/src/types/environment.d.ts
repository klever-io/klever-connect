/**
 * Global type augmentations for cross-platform compatibility
 */

declare global {
  interface ImportMeta {
    /**
     * Environment variables (available in Vite and other modern bundlers)
     */
    env?: Record<string, string | undefined>
  }
}

export {}
