// =============================================================================
// App.tsx — Vote yes/no on an active governance proposal.
// =============================================================================
// `useTransaction.sendTransaction({ contractType: 14, ...VoteRequest })`:
//   - proposalId : uint id of the proposal (from the explorer or
//                  provider.call('/v1.0/proposal/list')).
//   - amount     : the voting power to commit (smallest units of KFI).
//   - type       : VoteType (0 = Yes, 1 = No).
//
// We render the proposal id provided via VITE_KLV_PROPOSAL_ID and offer
// Yes / No buttons. Real apps would also fetch the proposal text and quorum
// state via provider.call; we keep the example short.
// =============================================================================

import { useState } from 'react'
import { useKlever, useTransaction } from '@klever/connect-react'
import { TXType, parseUnits } from '@klever/connect'

const PROPOSAL_ID_RAW = (import.meta.env.VITE_KLV_PROPOSAL_ID ?? '0') as string

export function App(): React.ReactElement {
  const { isConnected, address, connect } = useKlever()
  const { sendTransaction, isLoading, error, data, reset } = useTransaction()

  const [proposalId, setProposalId] = useState(PROPOSAL_ID_RAW)
  const [amount, setAmount] = useState('100') // KFI (6 decimals)

  const proposalIdNum = Number(proposalId)
  const validProposal = Number.isInteger(proposalIdNum) && proposalIdNum >= 0
  const validAmount = /^\d+(\.\d+)?$/.test(amount) && Number(amount) > 0
  const canVote = isConnected && validProposal && validAmount && !isLoading

  const handleVote = async (voteType: 0 | 1): Promise<void> => {
    if (!canVote) return
    try {
      await sendTransaction({
        // contractType 14 = Vote
        contractType: TXType.Vote,
        proposalId: proposalIdNum,
        amount: parseUnits(amount, 6),
        type: voteType,
      } as never)
    } catch {
      /* surfaced via error */
    }
  }

  if (!isConnected) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>Klever Connect — Governance Vote</h1>
        <button data-testid="connect-btn" onClick={() => void connect()} style={styles.btn}>
          Connect Wallet
        </button>
      </main>
    )
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Klever Connect — Governance Vote</h1>
      <p style={styles.lede}>
        Connected as <code>{address}</code>. Vote on proposal{' '}
        <strong data-testid="proposal-id">{proposalId}</strong>. Voting power
        is committed in KFI (6 decimals).
      </p>

      <section style={styles.card}>
        <label style={styles.label}>
          Proposal id
          <input
            data-testid="proposal-input"
            value={proposalId}
            onChange={(e) => setProposalId(e.target.value.trim())}
            inputMode="numeric"
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Voting power (KFI)
          <input
            data-testid="amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value.trim())}
            inputMode="decimal"
            style={styles.input}
          />
        </label>

        <div style={styles.btnRow}>
          <button
            data-testid="vote-yes"
            onClick={() => void handleVote(0)}
            disabled={!canVote}
            style={{ ...styles.btn, background: '#e8ffe8', borderColor: '#383' }}
          >
            {isLoading ? 'Voting…' : 'Vote YES'}
          </button>
          <button
            data-testid="vote-no"
            onClick={() => void handleVote(1)}
            disabled={!canVote}
            style={{ ...styles.btn, background: '#ffeded', borderColor: '#a33' }}
          >
            {isLoading ? 'Voting…' : 'Vote NO'}
          </button>
        </div>
      </section>

      {data ? (
        <p data-testid="success" style={styles.success}>
          ✓ Vote submitted. Hash: <code>{(data as { hash: string }).hash}</code>
        </p>
      ) : null}
      {error && (
        <p data-testid="error" style={styles.err}>
          ✗ {error.message}
        </p>
      )}
      {(data || error) && (
        <button onClick={reset} style={styles.btnSmall}>
          Reset
        </button>
      )}
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: { fontFamily: 'system-ui, sans-serif', maxWidth: 640, margin: '2rem auto', padding: '0 1rem' },
  h1: { fontSize: '1.5rem' },
  lede: { color: '#444', lineHeight: 1.5 },
  card: { border: '1px solid #ddd', borderRadius: 8, padding: '1rem 1.25rem', marginTop: '1rem', background: '#fafafa' },
  label: { display: 'block', marginTop: '0.75rem' },
  input: { display: 'block', width: '100%', padding: '0.4rem 0.6rem', marginTop: '0.25rem', boxSizing: 'border-box', fontFamily: 'monospace' },
  btnRow: { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  btn: { fontSize: '1rem', padding: '0.5rem 1rem', border: '1px solid #333', borderRadius: 6, background: '#fff', cursor: 'pointer', flex: 1 },
  btnSmall: { fontSize: '0.85rem', padding: '0.3rem 0.7rem', marginTop: '0.5rem', border: '1px solid #999', borderRadius: 4, background: '#fff', cursor: 'pointer' },
  success: { color: '#0a4', marginTop: '0.75rem' },
  err: { color: '#c00', marginTop: '0.5rem' },
}
