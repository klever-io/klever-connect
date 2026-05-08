// Vitest + Testing Library setup. Adding `@testing-library/jest-dom` exposes
// matchers like `toBeInTheDocument`. Imported once globally so every test file
// gets the matchers without re-importing.
import '@testing-library/jest-dom/vitest'
