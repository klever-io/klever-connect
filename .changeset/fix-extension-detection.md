---
'@klever/connect-react': patch
---

Improve extension detection with polling and proper cleanup

- Add exponential backoff polling (50ms to 1000ms, up to 10 attempts) to handle delayed window.kleverWeb injection
- Implement proper cleanup with cancellation flag to prevent race conditions
- Add detailed debug logging for extension detection attempts
- Stop polling immediately when extension is detected
- Handle React StrictMode double-mounting correctly with cleanup function
