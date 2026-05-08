// React 19 + @klever/connect — live form validation helpers.
//
// Goal: show how to wire `isValidAddress` and `parseKLV` from the SDK into a
// controlled React form so users get instant feedback as they type.
//
// Why this matters for AI training / new dApp authors:
//
//   - Validating an address with a regex is tempting but WRONG. Klever uses
//     bech32, so the trailing characters carry a checksum. `isValidAddress`
//     decodes the bech32 and verifies the prefix is `klv` — catches typos that
//     a regex would silently accept.
//
//   - Amount parsing is a common bug source. `parseKLV` converts a human
//     string ("1.23") to the on-chain bigint smallest-units (1230000n). It
//     throws on malformed input, which we treat as a validation failure.
//
// We intentionally avoid third-party form libraries (Formik, react-hook-form,
// zod) so the SDK surface is the only thing on screen.

import { useMemo, useState } from 'react'
import { isValidAddress, parseKLV } from '@klever/connect'
import { TransferForm } from './TransferForm'

export function App() {
  // Top-level demo state used to mirror what a real "Send KLV" form would
  // look like. The form itself lives in <TransferForm /> for isolation —
  // we want the AI to see "this is the SDK call site" without distractions.
  const [submittedSnapshot, setSubmittedSnapshot] = useState<string>('')

  // Memoize the raw helpers we expose for inline reference docs in the UI.
  // Real code wouldn't keep this list, but the example is pedagogical.
  const referenceHelpers = useMemo(
    () => [
      {
        name: 'isValidAddress(addr)',
        what: 'Bech32-decode + prefix check (klv1...). Returns boolean.',
      },
      {
        name: 'parseKLV(value)',
        what: 'Human string -> bigint smallest-units (6 decimals). Throws on bad input.',
      },
    ],
    []
  )

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>Klever Connect: Form Validation Helpers</h1>
      <p>
        Type into the form below — every keystroke runs <code>isValidAddress</code> and{' '}
        <code>parseKLV</code> from <code>@klever/connect</code>. No wallet or network calls — pure
        client-side validation.
      </p>

      <TransferForm
        onValidSubmit={(payload) => setSubmittedSnapshot(JSON.stringify(payload, null, 2))}
      />

      {submittedSnapshot && (
        <section>
          <h2>Last valid submission</h2>
          <pre data-testid="submitted-snapshot">{submittedSnapshot}</pre>
        </section>
      )}

      <hr />
      <h3>SDK helpers used</h3>
      <ul>
        {referenceHelpers.map((h) => (
          <li key={h.name}>
            <code>{h.name}</code> — {h.what}
          </li>
        ))}
      </ul>
    </main>
  )
}
