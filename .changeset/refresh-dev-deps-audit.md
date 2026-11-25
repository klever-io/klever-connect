---
'@klever/connect': patch
'@klever/connect-contracts': patch
'@klever/connect-core': patch
'@klever/connect-crypto': patch
'@klever/connect-encoding': patch
'@klever/connect-provider': patch
'@klever/connect-react': patch
'@klever/connect-transactions': patch
'@klever/connect-wallet': patch
---

chore(deps): refresh dev dependencies to clear audit advisories

Published bundles are now built with tsup 8.5.1 and its updated esbuild. Vite,
Vitest, ESLint and typescript-eslint were refreshed to clear dependency audit
advisories. Runtime dependencies and public APIs are unchanged.
