// react-staking-flow-end-to-end
//
// This example is a TUTORIAL/walkthrough that links to the 6 individual
// staking-stage examples (built by the other reactjs agent in this sprint):
//
//   1. freeze              - lock KLV into a bucket
//   2. delegate            - delegate the bucket to a validator
//   3. claim-staking-rewards - collect APR / FPR rewards
//   4. unfreeze            - start the cooldown
//   5. (wait — cooldown is enforced on-chain)
//   6. withdraw-after-cooldown - finalize the unstake
//
// Why a tutorial-only example? The full chain takes hours/epochs in real
// time because of the cooldown window — there's no way to run it linearly
// in CI. So the README and the in-page state-machine diagram do the heavy
// lifting.

import { useEffect, useMemo, useState } from 'react'
import { useKlever } from '@klever/connect'

type Stage = 'idle' | 'frozen' | 'delegated' | 'claimed' | 'unfrozen-pending' | 'withdrawn'

const STAGES: { id: Stage; label: string; sibling: string; description: string }[] = [
  {
    id: 'idle',
    label: 'Idle',
    sibling: '—',
    description: 'No active buckets. Begin by freezing some KLV.',
  },
  {
    id: 'frozen',
    label: 'Frozen',
    sibling: 'examples/reactjs/freeze-for-staking',
    description:
      'KLV is locked in a "bucket". Read the bucketId from the receipt — you need it for delegate/unfreeze.',
  },
  {
    id: 'delegated',
    label: 'Delegated',
    sibling: 'examples/reactjs/delegate-to-validator',
    description:
      'The bucket is now earning rewards from a chosen validator. Delegation is reversible without cooldown.',
  },
  {
    id: 'claimed',
    label: 'Claimed',
    sibling: 'examples/reactjs/claim-staking-rewards',
    description: 'APR (claimType 0) or FPR (claimType 3) rewards collected. Re-claim periodically.',
  },
  {
    id: 'unfrozen-pending',
    label: 'Unfrozen (cooldown)',
    sibling: 'examples/reactjs/unfreeze',
    description:
      'Bucket is in cooldown. The chain enforces an epoch-based wait; in testnet this can be hours.',
  },
  {
    id: 'withdrawn',
    label: 'Withdrawn',
    sibling: 'examples/reactjs/withdraw-after-cooldown',
    description: 'Stake fully released. KLV back in your account.',
  },
]

export function App() {
  const { isConnected, address, connect, disconnect } = useKlever()
  // We store the user's "logical" stage in localStorage so they can navigate
  // away and come back. This isn't on-chain state — it's just "where did the
  // user say they are in the walkthrough".
  const [stage, setStage] = useState<Stage>(() => {
    const persisted = typeof localStorage !== 'undefined' && localStorage.getItem('staking-stage')
    return (persisted as Stage) ?? 'idle'
  })
  useEffect(() => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('staking-stage', stage)
  }, [stage])

  const current = useMemo(() => STAGES.findIndex((s) => s.id === stage), [stage])
  const currentMeta = STAGES[current]
  const next = STAGES[current + 1]

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>Staking — End-to-End Walkthrough</h1>
      <p>
        This is a tutorial-style example that links the six staking stages in <code>examples/reactjs/</code>.
        Real cooldowns prevent a single CI-friendly script from completing the chain — the README
        explains why.
      </p>

      {isConnected ? (
        <p>
          Connected as <code data-testid="address">{address}</code>{' '}
          <button data-testid="disconnect" onClick={disconnect}>
            Disconnect
          </button>
        </p>
      ) : (
        <button data-testid="connect" onClick={() => void connect()}>
          Connect Klever Extension
        </button>
      )}

      <ol data-testid="stages">
        {STAGES.map((s, i) => (
          <li
            key={s.id}
            data-testid={`stage-${s.id}`}
            style={{
              opacity: i <= current ? 1 : 0.4,
              fontWeight: i === current ? 'bold' : 'normal',
            }}
          >
            <strong>{s.label}</strong> — <code>{s.sibling}</code>
            <br />
            <small>{s.description}</small>
          </li>
        ))}
      </ol>

      <fieldset>
        <legend>Mark your stage</legend>
        <p>
          Current: <code data-testid="current-stage">{currentMeta?.label}</code>
        </p>
        {next && (
          <button data-testid="advance" onClick={() => setStage(next.id)}>
            I just completed "{currentMeta.label}" → mark "{next.label}"
          </button>
        )}
        <button data-testid="reset" onClick={() => setStage('idle')}>
          Reset walkthrough
        </button>
      </fieldset>
    </main>
  )
}
