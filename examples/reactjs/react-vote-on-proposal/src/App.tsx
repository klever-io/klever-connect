// react-vote-on-proposal
//
// Vote yes/no on a governance proposal. Uses the Vote contract (TXType.Vote = 14).
//
// Vote payload:
//   { proposalId, type, amount }
//
// `type` is the VoteType enum: 0 = Yes, 1 = No (per connect-encoding's enum).
// `amount` is the voting power in KLV smallest-units.

import { useEffect, useMemo, useState } from 'react'
import { useKlever, useTransaction, parseKLV, TXType } from '@klever/connect'

type Proposal = {
  proposalId: number | string
  description?: string
  endTime?: number
  status?: string
}

export function App() {
  const { isConnected, address, connect, disconnect, extensionInstalled, provider } = useKlever()
  const { sendTransaction, isLoading, error, data } = useTransaction()

  const proposalIdEnv = (import.meta.env.VITE_PROPOSAL_ID as string) ?? ''
  const [proposalId, setProposalId] = useState<string>(proposalIdEnv)
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loadingProposal, setLoadingProposal] = useState(false)
  const [proposalError, setProposalError] = useState<string | null>(null)

  const [voteAmountKLV, setVoteAmountKLV] = useState('1')

  // Fetch proposal metadata via provider.call. The actual API path depends
  // on the network — this is a safe-ish stub that demonstrates the pattern.
  useEffect(() => {
    if (!proposalId) {
      setProposal(null)
      return
    }
    setLoadingProposal(true)
    setProposalError(null)
    void provider
      .call(`proposal/${proposalId}`, undefined)
      .then((res: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (res as any)?.data?.proposal ?? (res as any)?.proposal ?? res
        setProposal(data as Proposal)
      })
      .catch((e: Error) => setProposalError(e.message))
      .finally(() => setLoadingProposal(false))
  }, [proposalId, provider])

  const validation = useMemo(() => {
    if (!proposalId) return 'Proposal id required'
    try {
      if (parseKLV(voteAmountKLV) <= 0n) return 'Vote amount must be > 0'
    } catch {
      return 'Invalid amount'
    }
    return null
  }, [proposalId, voteAmountKLV])

  const handleVote = async (voteType: 0 | 1) => {
    if (validation || !isConnected) return
    await sendTransaction({
      contractType: TXType.Vote,
      payload: {
        proposalId: Number(proposalId),
        type: voteType,
        amount: parseKLV(voteAmountKLV).toString(),
      },
    })
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>Vote on Proposal</h1>

      {!extensionInstalled && (
        <p data-testid="no-extension" style={{ color: 'crimson' }}>
          Klever Web Extension not detected.
        </p>
      )}

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

      <fieldset disabled={!isConnected || isLoading}>
        <label>
          Proposal ID:
          <input
            data-testid="proposal-id"
            value={proposalId}
            onChange={(e) => setProposalId(e.target.value)}
          />
        </label>
        {loadingProposal && <small data-testid="loading-proposal">Loading proposal…</small>}
        {proposalError && (
          <small data-testid="proposal-error" style={{ color: 'crimson' }}>
            {proposalError}
          </small>
        )}
        {proposal && (
          <article data-testid="proposal-card" style={{ background: '#eef', padding: 12 }}>
            <strong>#{proposal.proposalId}</strong>
            <p>{proposal.description ?? '(no description)'}</p>
            <small>Status: {proposal.status ?? 'unknown'}</small>
          </article>
        )}

        <label>
          Vote weight (KLV):
          <input
            data-testid="amount"
            value={voteAmountKLV}
            onChange={(e) => setVoteAmountKLV(e.target.value)}
          />
        </label>

        {validation && (
          <p data-testid="validation" style={{ color: 'crimson' }}>
            {validation}
          </p>
        )}

        <button
          data-testid="vote-yes"
          onClick={() => void handleVote(0)}
          disabled={!!validation}
        >
          {isLoading ? 'Voting…' : 'Vote Yes'}
        </button>
        <button
          data-testid="vote-no"
          onClick={() => void handleVote(1)}
          disabled={!!validation}
          style={{ marginLeft: 8 }}
        >
          {isLoading ? 'Voting…' : 'Vote No'}
        </button>
      </fieldset>

      {error && (
        <p data-testid="error" role="alert" style={{ color: 'crimson' }}>
          {error.message}
        </p>
      )}
      {data && (
        <p data-testid="success" style={{ color: 'green' }}>
          Voted! Tx: <code>{data.hash}</code>
        </p>
      )}
    </main>
  )
}
