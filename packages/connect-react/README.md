# @klever/connect-react

React hooks and components for Klever Connect SDK

## Installation

```bash
pnpm add @klever/connect-react
```

## Hooks

### `useStaking()`

Complete staking workflow hook with freeze, unfreeze, delegate, claim, and withdraw operations.

**Staking Flow:**

1. **Freeze** - Stake assets to create bucket
   - KLV: Creates bucket with 32-byte hash bucketID (max 100 buckets/user)
   - Other KDA: Accumulates frozen amount (no bucket limit)
2. **Delegate** - Delegate KLV bucket to validator (KLV only)
3. **Claim** - Claim rewards (APR or FPR based)
4. **Undelegate** - Undelegate from validator
5. **Unfreeze** - Start cooldown period
6. **Withdraw** - Withdraw after cooldown

```tsx
import { useStaking } from '@klever/connect-react'
import { parseReceipt } from '@klever/connect-provider'
import { KLV_ASSET_ID } from '@klever/connect-core'
import { useState } from 'react'

function StakingComponent() {
  const [bucketId, setBucketId] = useState<string>('')
  const { freeze, unfreeze, delegate, claim, withdraw, isLoading, error } = useStaking()

  const handleFreeze = async () => {
    // Returns TransactionSubmitResult with hash, status, transaction, and wait()
    const result = await freeze(100000, KLV_ASSET_ID)
    console.log('Transaction submitted:', result.hash)

    // Wait for confirmation and parse receipt
    const receipt = await result.wait()

    // Type-safe parsing using parseReceipt utility
    const { bucketId, amount, kda } = parseReceipt.freeze(receipt)
    console.log(`Created bucket ${bucketId} with ${amount} ${kda}`)
    setBucketId(bucketId)
  }

  return (
    <div>
      {/* Step 1: Freeze KLV to create bucket */}
      <button onClick={handleFreeze} disabled={isLoading}>
        Stake 100K KLV
      </button>

      {/* Step 2: Delegate to validator (use bucketId from freeze) */}
      <button
        onClick={() => delegate('klv1validator...', bucketId)}
        disabled={isLoading || !bucketId}
      >
        Delegate
      </button>

      {/* Step 3: Claim rewards */}
      <button onClick={() => claim(0)} disabled={isLoading}>
        Claim Rewards
      </button>

      {/* Step 4: Unfreeze KLV (requires both KDA and bucketId) */}
      <button onClick={() => unfreeze(KLV_ASSET_ID, bucketId)} disabled={isLoading || !bucketId}>
        Unfreeze KLV
      </button>

      {/* Step 4b: Unfreeze other KDA (only KDA needed, no bucketId) */}
      <button onClick={() => unfreeze('MY-TOKEN-ID')} disabled={isLoading}>
        Unfreeze MY-TOKEN
      </button>

      {/* Step 5: Withdraw */}
      <button onClick={() => withdraw(0)} disabled={isLoading}>
        Withdraw
      </button>

      {bucketId && <p>Bucket ID: {bucketId}</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  )
}
```

### Parsing Transaction Receipts

All transaction methods return `TransactionSubmitResult` with a `wait()` method. Use the `parseReceipt` utility from `@klever/connect-provider` for type-safe parsing:

```tsx
import { parseReceipt } from '@klever/connect-provider'

// Parse freeze receipt to get bucketId
const result = await freeze(100000, 'KLV')
const receipt = await result.wait()
const { bucketId, amount, kda } = parseReceipt.freeze(receipt)

// Parse claim receipt to get rewards
const claimResult = await claim(0)
const claimReceipt = await claimResult.wait()
const { rewards, totalClaimed, claimType } = parseReceipt.claim(claimReceipt)
console.log(`Claimed ${totalClaimed} in ${rewards.length} assets`)

// Parse delegate receipt
const delegateResult = await delegate('klv1validator...', bucketId)
const delegateReceipt = await delegateResult.wait()
const { validator, bucketId: delegatedBucket } = parseReceipt.delegate(delegateReceipt)

// Handle multiple transfers in one transaction
const transferResult = await sendTransaction(multiTransferContract)
const transferReceipt = await transferResult.wait()
const { sender, receiver, amount, kda, transfers } = parseReceipt.transfer(transferReceipt)
console.log(`Primary transfer: ${sender} → ${receiver}: ${amount} ${kda}`)
if (transfers) {
  console.log(`Total ${transfers.length} transfers:`)
  transfers.forEach((t) => console.log(`  ${t.sender} → ${t.receiver}: ${t.amount} ${t.kda}`))
}
```

Available parsers (hybrid API - simple fields + optional arrays for multiple operations):

- `parseReceipt.freeze(receipt)` → `{ bucketId, amount, kda, freezes? }`
- `parseReceipt.unfreeze(receipt)` → `{ bucketId, kda, availableAt? }`
- `parseReceipt.claim(receipt)` → `{ rewards[], totalClaimed, claimType? }`
- `parseReceipt.withdraw(receipt)` → `{ amount, kda, withdrawType?, withdrawals? }`
- `parseReceipt.delegate(receipt)` → `{ validator, bucketId }`
- `parseReceipt.undelegate(receipt)` → `{ bucketId, availableAt? }`
- `parseReceipt.transfer(receipt)` → `{ sender, receiver, amount, kda, transfers? }`

**Hybrid approach**: Each parser returns the primary/first operation in simple fields, plus optional arrays when multiple receipts exist. This keeps the API simple for common cases while supporting complex multi-operation transactions.

### `useTransaction()`

Generic transaction sending hook with callbacks and state management.

**Important:** `sendKLV` and `sendKDA` expect amounts in **smallest units** (no automatic precision conversion).

```tsx
import { useTransaction } from '@klever/connect-react'
import { parseKLV, parseUnits } from '@klever/connect-core'

function TransferComponent() {
  const { sendKLV, sendKDA, isLoading } = useTransaction()

  // Send KLV (use parseKLV for human-readable amounts)
  const handleSendKLV = async () => {
    // Correct: parseKLV converts "100" to 100000000 (smallest units)
    await sendKLV('klv1receiver...', parseKLV('100'))

    // Also correct: using bigint directly
    await sendKLV('klv1receiver...', 100000000n)
  }

  // Send KDA (use parseUnits with correct precision)
  const handleSendKDA = async () => {
    // For token with 6 decimals
    await sendKDA('klv1receiver...', parseUnits('50', 6), 'MY-TOKEN')

    // For token with 18 decimals
    await sendKDA('klv1receiver...', parseUnits('50', 18), 'OTHER-TOKEN')
  }

  return (
    <div>
      <button onClick={handleSendKLV} disabled={isLoading}>
        Send 100 KLV
      </button>
      <button onClick={handleSendKDA} disabled={isLoading}>
        Send 50 Tokens
      </button>
    </div>
  )
}
```

**Why no auto-conversion?**

- Prevents accidental 1000x transfers
- Consistent with other hooks (freeze, unfreeze, etc.)
- Explicit is better than implicit
- Different tokens have different precisions (6, 8, 18, etc.)

### `useBalance()`

Account balance management hook.

### `useTransactionMonitor()`

Real-time transaction monitoring hook.

## License

MIT
