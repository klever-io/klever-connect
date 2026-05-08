// =============================================================================
// react-provider-setup.testnet.test.tsx — LIVE testnet variant (skipped from CI).
// =============================================================================
// This file exercises the REAL <KleverProvider> against the public testnet so
// you can verify the example end-to-end on your local machine. It is excluded
// from CI by repo policy (see CLAUDE.md — `*.testnet.test.*` pattern).
//
// To run only this file:
//   npm run test:testnet
//
// What it checks:
//   - <KleverProvider> mounts without errors against a real testnet endpoint.
//   - The network reported by useKlever() matches the env-configured value.
//   - The Klever Web Extension presence flag flips to `false` in jsdom (no
//     extension is installed in a Node test runner). This is just a smoke test
//     to confirm the detection loop terminates rather than hanging.
// =============================================================================

import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { KleverProvider } from '@klever/connect-react'
import { App } from '../App'

describe('react-provider-setup — testnet smoke test', () => {
  it('mounts against the real testnet KleverProvider', async () => {
    render(
      <KleverProvider config={{ network: 'testnet', autoConnect: false }}>
        <App />
      </KleverProvider>,
    )

    // The provider takes a tick to resolve initial state.
    await waitFor(() => {
      expect(screen.getByTestId('network')).toHaveTextContent('testnet')
    })

    // No extension in jsdom — should resolve to "not installed" eventually.
    await waitFor(
      () => {
        expect(screen.getByTestId('extension-status')).not.toHaveTextContent(/detecting/i)
      },
      { timeout: 8000 },
    )
  }, 15_000)
})
