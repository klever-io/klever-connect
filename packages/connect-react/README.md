# @klever/connect-react

React hooks and components for Klever Connect SDK

## Installation

```bash
pnpm add @klever/connect-react
```

## Overview

`@klever/connect-react` provides React hooks for seamless integration with the Klever blockchain. Built with TypeScript for complete type safety and designed following React best practices.

**Available Hooks:**

- **`useKlever()`** - Main context hook for wallet connection and network management
- **`useTransaction()`** - Generic transaction sending with full lifecycle control
- **`useTransfer()`** - Convenience hook for KLV/KDA transfers
- **`useFreeze()`** - Freeze (stake) assets to create buckets
- **`useUnfreeze()`** - Unfreeze (unstake) assets and start cooldown
- **`useDelegate()`** - Delegate KLV buckets to validators (via `useStaking`)
- **`useUndelegate()`** - Undelegate from validators (via `useStaking`)
- **`useClaim()`** - Claim staking or FPR rewards
- **`useStaking()`** - Complete staking workflow in one hook
- **`useBalance()`** - Monitor token balances with auto-polling
- **`useTransactionMonitor()`** - Real-time transaction status monitoring

**Key Features:**

- Type-safe hooks with full TypeScript support
- Automatic state management (loading, error, data)
- Built-in polling and real-time updates
- Extension wallet integration (Klever Web Extension)
- Network switching without disconnecting
- Transaction lifecycle callbacks
- React 18+ compatible

## Quick Start

### 1. Wrap your app with KleverProvider

```tsx
import { KleverProvider } from '@klever/connect-react'

function App() {
  return (
    <KleverProvider config={{ network: 'testnet' }}>
      <YourApp />
    </KleverProvider>
  )
}
```

### 2. Connect wallet and send transactions

```tsx
import { useKlever, useTransaction } from '@klever/connect-react'
import { parseKLV } from '@klever/connect-core'

function TransferButton() {
  const { connect, isConnected, address } = useKlever()
  const { sendKLV, isLoading } = useTransaction()

  const handleTransfer = async () => {
    if (!isConnected) {
      await connect()
    } else {
      await sendKLV('klv1receiver...', parseKLV('10'))
    }
  }

  return (
    <button onClick={handleTransfer} disabled={isLoading}>
      {!isConnected ? 'Connect Wallet' : 'Send 10 KLV'}
    </button>
  )
}
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

### `useKlever()`

Main context hook for accessing Klever blockchain functionality. Provides wallet connection, network management, and blockchain provider access.

**Must be used within a KleverProvider component.**

```tsx
import { useKlever } from '@klever/connect-react'

function WalletButton() {
  const {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    address,
    currentNetwork,
    switchNetwork,
    extensionInstalled,
    error,
  } = useKlever()

  if (!extensionInstalled) {
    return (
      <div>
        Please install{' '}
        <a href="https://klever.io/extension" target="_blank">
          Klever Extension
        </a>
      </div>
    )
  }

  return (
    <div>
      {!isConnected ? (
        <button onClick={connect} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div>
          <p>
            Connected: {address?.slice(0, 10)}...{address?.slice(-8)}
          </p>
          <p>Network: {currentNetwork}</p>
          <button onClick={() => switchNetwork('mainnet')}>Switch to Mainnet</button>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
    </div>
  )
}
```

**Return value:**

- `wallet` - Wallet instance (undefined if not connected)
- `provider` - KleverProvider for blockchain queries
- `address` - Connected wallet address
- `isConnected` - Boolean indicating connection status
- `isConnecting` - Boolean indicating connection in progress
- `error` - Error object if any operation failed
- `extensionInstalled` - Boolean indicating extension availability
- `searchingExtension` - Boolean indicating extension check in progress
- `currentNetwork` - Current network name
- `connect()` - Async function to initiate wallet connection
- `disconnect()` - Function to disconnect wallet
- `switchNetwork(network)` - Async function to switch networks

### `useTransaction()`

Core hook for sending any type of transaction with full lifecycle control.

```tsx
import { useTransaction } from '@klever/connect-react'
import { parseKLV, parseUnits, TXType } from '@klever/connect-core'

function TransactionDemo() {
  const { sendTransaction, sendKLV, sendKDA, isLoading, error, data, reset } = useTransaction({
    onSuccess: (receipt) => {
      console.log('Transaction successful:', receipt.hash)
    },
    onError: (err) => {
      console.error('Transaction failed:', err.message)
    },
  })

  // Send KLV using convenience method
  const handleSendKLV = async () => {
    const result = await sendKLV('klv1receiver...', parseKLV('100'))
    console.log('Transaction hash:', result.hash)

    // Wait for confirmation
    const receipt = await result.wait()
    console.log('Confirmed in block:', receipt.blockNumber)
  }

  // Send KDA tokens
  const handleSendKDA = async () => {
    await sendKDA('klv1receiver...', parseUnits('50', 6), 'MY-KDA-TOKEN')
  }

  // Send custom transaction
  const handleCustomTx = async () => {
    await sendTransaction({
      contractType: TXType.Transfer,
      receiver: 'klv1receiver...',
      amount: 1000000,
      kda: 'MY-TOKEN',
    })
  }

  return (
    <div>
      <button onClick={handleSendKLV} disabled={isLoading}>
        Send 100 KLV
      </button>
      <button onClick={handleSendKDA} disabled={isLoading}>
        Send 50 KDA
      </button>
      <button onClick={handleCustomTx} disabled={isLoading}>
        Custom Transaction
      </button>

      {isLoading && <p>Transaction in progress...</p>}
      {error && (
        <div>
          <p style={{ color: 'red' }}>Error: {error.message}</p>
          <button onClick={reset}>Try Again</button>
        </div>
      )}
      {data && <p style={{ color: 'green' }}>Success! Hash: {data.hash}</p>}
    </div>
  )
}
```

**Important:** Amounts must be in smallest units. Use `parseKLV()` or `parseUnits()` for human-readable amounts.

### `useTransfer()`

Convenience hook specifically for KLV/KDA token transfers.

```tsx
import { useTransfer } from '@klever/connect-react'
import { parseKLV, parseUnits } from '@klever/connect-core'
import { useState } from 'react'

function TransferForm() {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const { transfer, isLoading, error } = useTransfer({
    onSuccess: () => {
      alert('Transfer successful!')
      setAmount('')
      setRecipient('')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await transfer({
      receiver: recipient,
      amount: parseKLV(amount),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient address"
        disabled={isLoading}
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in KLV"
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading || !recipient || !amount}>
        {isLoading ? 'Sending...' : 'Send KLV'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  )
}
```

### `useFreeze()`

Freeze (stake) assets to create staking buckets.

```tsx
import { useFreeze } from '@klever/connect-react'
import { parseKLV, KLV_ASSET_ID } from '@klever/connect-core'
import { parseReceipt } from '@klever/connect-provider'
import { useState } from 'react'

function FreezeComponent() {
  const [bucketId, setBucketId] = useState<string>('')
  const { freeze, isLoading, error } = useFreeze({
    onSuccess: async (receipt) => {
      console.log('Freeze successful!', receipt.hash)
    },
  })

  const handleFreeze = async () => {
    const result = await freeze({
      amount: parseKLV('1000'),
      kda: KLV_ASSET_ID,
    })

    // Wait for confirmation and get bucket ID
    const receipt = await result.wait()
    const { bucketId } = parseReceipt.freeze(receipt)
    setBucketId(bucketId)
    console.log('Created bucket:', bucketId)
  }

  return (
    <div>
      <button onClick={handleFreeze} disabled={isLoading}>
        {isLoading ? 'Freezing...' : 'Freeze 1000 KLV'}
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {bucketId && (
        <p>
          Bucket ID: {bucketId.slice(0, 10)}...{bucketId.slice(-8)}
        </p>
      )}
    </div>
  )
}
```

**Note:** For KLV, creates a bucket (max 100 per user). For KDA, accumulates frozen amount without bucket limit.

### `useUnfreeze()`

Unfreeze (unstake) assets and start the cooldown period.

```tsx
import { useUnfreeze } from '@klever/connect-react'
import { KLV_ASSET_ID } from '@klever/connect-core'
import { parseReceipt } from '@klever/connect-provider'

function UnfreezeComponent({ bucketId }: { bucketId: string }) {
  const { unfreeze, isLoading, error, data } = useUnfreeze({
    onSuccess: async (receipt) => {
      const result = await receipt.wait?.()
      if (result) {
        const { availableAt } = parseReceipt.unfreeze(result)
        if (availableAt) {
          const date = new Date(availableAt)
          console.log('Available for withdrawal at:', date.toLocaleString())
        }
      }
    },
  })

  const handleUnfreeze = async () => {
    await unfreeze({
      kda: KLV_ASSET_ID,
      bucketId: bucketId,
    })
  }

  return (
    <div>
      <button onClick={handleUnfreeze} disabled={isLoading || !bucketId}>
        {isLoading ? 'Unfreezing...' : 'Unfreeze KLV'}
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {data && <p style={{ color: 'green' }}>Cooldown started! Hash: {data.hash}</p>}
    </div>
  )
}
```

**Note:** Must wait for cooldown period before withdrawal. For KLV, bucketId is required. For KDA, bucketId is optional.

### `useClaim()`

Claim staking rewards (APR) or FPR rewards.

```tsx
import { useClaim } from '@klever/connect-react'
import { parseReceipt } from '@klever/connect-provider'
import { useState } from 'react'

function ClaimRewards() {
  const [totalClaimed, setTotalClaimed] = useState('')
  const { claim, isLoading, error } = useClaim({
    onSuccess: async (receipt) => {
      const result = await receipt.wait?.()
      if (result) {
        const { rewards, totalClaimed } = parseReceipt.claim(result)
        console.log(`Claimed ${totalClaimed} in ${rewards.length} assets`)
        setTotalClaimed(totalClaimed)
      }
    },
  })

  const handleClaimStaking = async () => {
    await claim({
      claimType: 0, // 0 = Staking (APR rewards)
      id: 'KLV',
    })
  }

  const handleClaimFPR = async () => {
    await claim({
      claimType: 3, // 3 = FPR rewards
      id: 'MY-KDA-TOKEN',
    })
  }

  return (
    <div>
      <button onClick={handleClaimStaking} disabled={isLoading}>
        {isLoading ? 'Claiming...' : 'Claim Staking Rewards'}
      </button>
      <button onClick={handleClaimFPR} disabled={isLoading}>
        Claim FPR Rewards
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {totalClaimed && <p style={{ color: 'green' }}>Total claimed: {totalClaimed}</p>}
    </div>
  )
}
```

**Claim Types:**

- `0` - Staking (APR-based rewards)
- `1` - Market (marketplace rewards)
- `2` - Allowance (allowance-based claims)
- `3` - FPR (dynamic rewards from KDA staking)

### `useBalance()`

Monitor token balances with automatic polling every 10 seconds.

```tsx
import { useBalance } from '@klever/connect-react'
import { useState } from 'react'

function BalanceDisplay() {
  const [token, setToken] = useState('KLV')
  const { balance, isLoading, error, refetch } = useBalance(token)

  return (
    <div>
      <select value={token} onChange={(e) => setToken(e.target.value)}>
        <option value="KLV">KLV</option>
        <option value="KDA-TOKEN-1">Token 1</option>
        <option value="KDA-TOKEN-2">Token 2</option>
      </select>

      {isLoading && <p>Loading balance...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {balance && (
        <div>
          <h3>
            {balance.formatted} {balance.token}
          </h3>
          <p>Raw amount: {balance.amount.toString()}</p>
          <p>Precision: {balance.precision} decimals</p>
          <button onClick={refetch}>Refresh</button>
        </div>
      )}
    </div>
  )
}

// Check balance of any address
function AddressBalanceChecker() {
  const [address, setAddress] = useState('')
  const { balance, isLoading } = useBalance('KLV', address)

  return (
    <div>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter Klever address..."
      />
      {isLoading && <p>Loading...</p>}
      {balance && <p>Balance: {balance.formatted} KLV</p>}
    </div>
  )
}
```

**Features:**

- Auto-polls every 10 seconds
- Manual refresh with `refetch()`
- Check any address (not just connected wallet)
- Returns formatted and raw amounts
- Network change triggers automatic refetch

### `useTransactionMonitor()`

Real-time transaction monitoring with automatic polling and status updates.

```tsx
import { useTransactionMonitor, useTransaction } from '@klever/connect-react'
import { useKlever } from '@klever/connect-react'
import { useState } from 'react'

function TransactionTracker() {
  const { provider } = useKlever()
  const { sendKLV } = useTransaction()
  const [txHash, setTxHash] = useState('')

  const { monitor, cancel, activeMonitors, isMonitoring, getStatus } = useTransactionMonitor({
    provider,
    initialDelay: 1500, // Wait 1.5s before first check
    pollInterval: 2000, // Poll every 2 seconds
    timeout: 60000, // 60 second timeout
    onStatusUpdate: (status) => {
      console.log(`Attempt ${status.attempts}: ${status.status}`)
      console.log(`Time elapsed: ${status.elapsedTime}ms`)
    },
    onComplete: (result) => {
      console.log('Final status:', result.status)
      if (result.transaction) {
        console.log('Block number:', result.transaction.blockNumber)
      }
    },
    onError: (error) => {
      console.error('Monitoring error:', error.message)
    },
  })

  const handleSendAndMonitor = async () => {
    try {
      // Send transaction
      const result = await sendKLV('klv1receiver...', 1000000n)
      setTxHash(result.hash)

      // Monitor the transaction
      const finalResult = await monitor(result.hash)
      console.log('Transaction confirmed:', finalResult.status)
    } catch (err) {
      console.error('Failed:', err)
    }
  }

  return (
    <div>
      <button onClick={handleSendAndMonitor}>Send & Monitor</button>

      <p>Active monitors: {activeMonitors.length}</p>
      {isMonitoring && <p>Monitoring transactions...</p>}

      {activeMonitors.map((hash) => {
        const status = getStatus(hash)
        return (
          <div key={hash} style={{ border: '1px solid #ccc', padding: '10px', margin: '5px' }}>
            <p>
              Hash: {hash.slice(0, 10)}...{hash.slice(-8)}
            </p>
            <p>Status: {status?.status}</p>
            <p>Attempts: {status?.attempts}</p>
            <p>Elapsed: {status?.elapsedTime}ms</p>
            <button onClick={() => cancel(hash)}>Cancel</button>
          </div>
        )
      })}

      {txHash && (
        <p>
          Latest TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
        </p>
      )}
    </div>
  )
}
```

**Features:**

- Monitor up to 10 concurrent transactions
- Exponential backoff to reduce API load
- Real-time status updates via callbacks
- Cancellable monitoring
- Custom polling intervals and timeouts
- Automatic cleanup on unmount

## Complete Examples

### Full Wallet Connection Component

```tsx
import { useKlever } from '@klever/connect-react'
import { useState } from 'react'

function WalletConnector() {
  const {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    address,
    currentNetwork,
    switchNetwork,
    extensionInstalled,
    searchingExtension,
    error,
  } = useKlever()

  const [showNetworks, setShowNetworks] = useState(false)

  if (searchingExtension) {
    return <div>Checking for Klever Extension...</div>
  }

  if (!extensionInstalled) {
    return (
      <div style={{ padding: '20px', border: '2px solid red', borderRadius: '8px' }}>
        <h3>Klever Extension Not Found</h3>
        <p>Please install the Klever Web Extension to continue.</p>
        <a
          href="https://klever.io/extension"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'blue', textDecoration: 'underline' }}
        >
          Download Extension
        </a>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      {!isConnected ? (
        <div>
          <h3>Connect Your Wallet</h3>
          <button
            onClick={connect}
            disabled={isConnecting}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
            }}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <div>
          <h3>Wallet Connected</h3>
          <p>
            <strong>Address:</strong> {address?.slice(0, 10)}...{address?.slice(-8)}
          </p>
          <p>
            <strong>Network:</strong> {currentNetwork}
          </p>

          <button
            onClick={() => setShowNetworks(!showNetworks)}
            style={{ marginRight: '10px', padding: '8px 16px' }}
          >
            {showNetworks ? 'Hide Networks' : 'Switch Network'}
          </button>

          {showNetworks && (
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => switchNetwork('mainnet')} style={{ margin: '5px' }}>
                Mainnet
              </button>
              <button onClick={() => switchNetwork('testnet')} style={{ margin: '5px' }}>
                Testnet
              </button>
              <button onClick={() => switchNetwork('devnet')} style={{ margin: '5px' }}>
                Devnet
              </button>
            </div>
          )}

          <button
            onClick={disconnect}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Disconnect
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
          }}
        >
          <strong>Error:</strong> {error.message}
        </div>
      )}
    </div>
  )
}
```

### Token Transfer Component

```tsx
import { useTransfer, useBalance, useKlever } from '@klever/connect-react'
import { parseKLV, formatUnits } from '@klever/connect-core'
import { useState } from 'react'

function TokenTransfer() {
  const { isConnected, address } = useKlever()
  const { balance } = useBalance('KLV')
  const { transfer, isLoading, error, data, reset } = useTransfer()

  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    reset()

    try {
      const result = await transfer({
        receiver: recipient,
        amount: parseKLV(amount),
      })

      console.log('Transaction submitted:', result.hash)
      const receipt = await result.wait()
      console.log('Transaction confirmed:', receipt.blockNumber)

      // Clear form
      setRecipient('')
      setAmount('')
    } catch (err) {
      console.error('Transfer failed:', err)
    }
  }

  if (!isConnected) {
    return <div>Please connect your wallet first</div>
  }

  return (
    <div style={{ maxWidth: '500px', padding: '20px' }}>
      <h2>Transfer KLV</h2>

      {balance && (
        <div style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '20px' }}>
          <p>
            <strong>Your Balance:</strong> {balance.formatted} KLV
          </p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Address: {address?.slice(0, 10)}...{address?.slice(-8)}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="klv1..."
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Amount (KLV)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.000001"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !recipient || !amount}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Sending...' : 'Send KLV'}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
          }}
        >
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {data && (
        <div
          style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '4px',
          }}
        >
          <strong>Success!</strong>
          <p style={{ fontSize: '12px', marginTop: '5px', wordBreak: 'break-all' }}>
            Transaction Hash: {data.hash}
          </p>
        </div>
      )}
    </div>
  )
}
```

### Staking Dashboard Component

```tsx
import { useStaking, useBalance, useKlever } from '@klever/connect-react'
import { parseKLV, KLV_ASSET_ID, formatUnits } from '@klever/connect-core'
import { parseReceipt } from '@klever/connect-provider'
import { useState } from 'react'

function StakingDashboard() {
  const { isConnected } = useKlever()
  const { balance } = useBalance(KLV_ASSET_ID)
  const { freeze, unfreeze, delegate, claim, isLoading, error } = useStaking()

  const [bucketId, setBucketId] = useState('')
  const [validatorAddress, setValidatorAddress] = useState('')
  const [stakeAmount, setStakeAmount] = useState('1000')

  const handleFreeze = async () => {
    try {
      const result = await freeze(parseKLV(stakeAmount), KLV_ASSET_ID)
      console.log('Freeze submitted:', result.hash)

      const receipt = await result.wait()
      const { bucketId: newBucketId } = parseReceipt.freeze(receipt)
      setBucketId(newBucketId)
      alert(`Bucket created: ${newBucketId}`)
    } catch (err) {
      console.error('Freeze failed:', err)
    }
  }

  const handleDelegate = async () => {
    if (!bucketId || !validatorAddress) {
      alert('Please provide bucket ID and validator address')
      return
    }

    try {
      const result = await delegate(validatorAddress, bucketId)
      const receipt = await result.wait()
      alert('Successfully delegated to validator!')
    } catch (err) {
      console.error('Delegate failed:', err)
    }
  }

  const handleClaim = async () => {
    try {
      const result = await claim(0) // 0 = Staking rewards
      const receipt = await result.wait()
      const { totalClaimed, rewards } = parseReceipt.claim(receipt)
      alert(`Claimed ${totalClaimed} in ${rewards.length} assets!`)
    } catch (err) {
      console.error('Claim failed:', err)
    }
  }

  const handleUnfreeze = async () => {
    if (!bucketId) {
      alert('Please provide bucket ID')
      return
    }

    try {
      const result = await unfreeze(KLV_ASSET_ID, bucketId)
      const receipt = await result.wait()
      const { availableAt } = parseReceipt.unfreeze(receipt)
      if (availableAt) {
        alert(`Cooldown started! Available at: ${new Date(availableAt).toLocaleString()}`)
      }
    } catch (err) {
      console.error('Unfreeze failed:', err)
    }
  }

  if (!isConnected) {
    return <div>Please connect your wallet to access staking features</div>
  }

  return (
    <div style={{ maxWidth: '600px', padding: '20px' }}>
      <h2>Staking Dashboard</h2>

      {balance && (
        <div style={{ padding: '15px', backgroundColor: '#f0f0f0', marginBottom: '20px' }}>
          <h3>Available Balance</h3>
          <p style={{ fontSize: '24px', margin: '10px 0' }}>
            <strong>{balance.formatted} KLV</strong>
          </p>
        </div>
      )}

      {/* Freeze Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
        <h3>1. Freeze (Stake) KLV</h3>
        <input
          type="number"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          placeholder="Amount to stake"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button
          onClick={handleFreeze}
          disabled={isLoading}
          style={{ width: '100%', padding: '10px' }}
        >
          {isLoading ? 'Processing...' : `Freeze ${stakeAmount} KLV`}
        </button>
        {bucketId && (
          <p style={{ marginTop: '10px', fontSize: '12px' }}>
            Bucket ID: {bucketId.slice(0, 10)}...{bucketId.slice(-8)}
          </p>
        )}
      </div>

      {/* Delegate Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
        <h3>2. Delegate to Validator</h3>
        <input
          type="text"
          value={validatorAddress}
          onChange={(e) => setValidatorAddress(e.target.value)}
          placeholder="Validator address"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <input
          type="text"
          value={bucketId}
          onChange={(e) => setBucketId(e.target.value)}
          placeholder="Bucket ID from freeze"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button
          onClick={handleDelegate}
          disabled={isLoading}
          style={{ width: '100%', padding: '10px' }}
        >
          {isLoading ? 'Processing...' : 'Delegate'}
        </button>
      </div>

      {/* Claim Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
        <h3>3. Claim Rewards</h3>
        <button
          onClick={handleClaim}
          disabled={isLoading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white' }}
        >
          {isLoading ? 'Processing...' : 'Claim Staking Rewards'}
        </button>
      </div>

      {/* Unfreeze Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
        <h3>4. Unfreeze (Unstake)</h3>
        <p style={{ fontSize: '12px', marginBottom: '10px' }}>
          Note: Starts cooldown period before withdrawal
        </p>
        <button
          onClick={handleUnfreeze}
          disabled={isLoading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#dc3545', color: 'white' }}
        >
          {isLoading ? 'Processing...' : 'Unfreeze KLV'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24' }}>
          <strong>Error:</strong> {error.message}
        </div>
      )}
    </div>
  )
}
```

### Transaction History Component

```tsx
import { useTransactionMonitor, useTransaction, useKlever } from '@klever/connect-react'
import { parseKLV } from '@klever/connect-core'
import { useState } from 'react'

interface TransactionHistoryItem {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  attempts: number
}

function TransactionHistory() {
  const { provider } = useKlever()
  const { sendKLV } = useTransaction()
  const [history, setHistory] = useState<TransactionHistoryItem[]>([])

  const { monitor, activeMonitors, getStatus } = useTransactionMonitor({
    provider,
    onStatusUpdate: (status) => {
      setHistory((prev) =>
        prev.map((item) =>
          item.hash === status.hash
            ? { ...item, status: status.status, attempts: status.attempts }
            : item,
        ),
      )
    },
    onComplete: (result) => {
      setHistory((prev) =>
        prev.map((item) => (item.hash === result.hash ? { ...item, status: result.status } : item)),
      )
    },
  })

  const handleSendTransaction = async () => {
    try {
      const result = await sendKLV('klv1receiver...', parseKLV('10'))

      // Add to history
      setHistory((prev) => [
        {
          hash: result.hash,
          status: 'pending',
          timestamp: Date.now(),
          attempts: 0,
        },
        ...prev,
      ])

      // Monitor transaction
      await monitor(result.hash)
    } catch (err) {
      console.error('Transaction failed:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#28a745'
      case 'pending':
        return '#ffc107'
      case 'failed':
        return '#dc3545'
      default:
        return '#6c757d'
    }
  }

  return (
    <div style={{ maxWidth: '800px', padding: '20px' }}>
      <h2>Transaction History</h2>

      <button
        onClick={handleSendTransaction}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        Send Test Transaction
      </button>

      <div style={{ marginBottom: '20px' }}>
        <strong>Active Monitors:</strong> {activeMonitors.length}
      </div>

      <div>
        {history.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          history.map((item) => {
            const liveStatus = getStatus(item.hash)
            const currentStatus = liveStatus?.status || item.status

            return (
              <div
                key={item.hash}
                style={{
                  padding: '15px',
                  marginBottom: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>
                      <strong>Hash:</strong> {item.hash.slice(0, 12)}...{item.hash.slice(-10)}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                    {liveStatus && (
                      <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                        Attempts: {liveStatus.attempts} | Elapsed: {liveStatus.elapsedTime}ms
                      </p>
                    )}
                  </div>
                  <div>
                    <span
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        backgroundColor: getStatusColor(currentStatus),
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      {currentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
```

### Multi-Step Workflow Component

```tsx
import { useStaking, useKlever, useBalance } from '@klever/connect-react'
import { parseKLV, KLV_ASSET_ID } from '@klever/connect-core'
import { parseReceipt } from '@klever/connect-provider'
import { useState } from 'react'

type Step = 'freeze' | 'delegate' | 'claim' | 'unfreeze' | 'complete'

function StakingWorkflow() {
  const { isConnected } = useKlever()
  const { balance, refetch } = useBalance(KLV_ASSET_ID)
  const { freeze, delegate, claim, unfreeze, isLoading } = useStaking()

  const [currentStep, setCurrentStep] = useState<Step>('freeze')
  const [bucketId, setBucketId] = useState('')
  const [validatorAddress] = useState('klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h7d5zjv5x9h4y') // Example
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev])
  }

  const handleFreeze = async () => {
    try {
      addLog('Starting freeze transaction...')
      const result = await freeze(parseKLV('1000'), KLV_ASSET_ID)
      addLog(`Transaction submitted: ${result.hash}`)

      const receipt = await result.wait()
      const { bucketId: newBucketId } = parseReceipt.freeze(receipt)
      setBucketId(newBucketId)

      addLog(`Bucket created: ${newBucketId}`)
      addLog('Freeze completed! Moving to delegation step.')
      setCurrentStep('delegate')
      refetch()
    } catch (err) {
      addLog(`Freeze failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleDelegate = async () => {
    try {
      addLog('Starting delegation...')
      const result = await delegate(validatorAddress, bucketId)
      addLog(`Transaction submitted: ${result.hash}`)

      await result.wait()
      addLog('Successfully delegated to validator!')
      addLog('You can now claim rewards. Moving to claim step.')
      setCurrentStep('claim')
    } catch (err) {
      addLog(`Delegation failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleClaim = async () => {
    try {
      addLog('Claiming rewards...')
      const result = await claim(0)
      addLog(`Transaction submitted: ${result.hash}`)

      const receipt = await result.wait()
      const { totalClaimed, rewards } = parseReceipt.claim(receipt)
      addLog(`Claimed ${totalClaimed} in ${rewards.length} assets!`)
      addLog('Rewards claimed! You can unfreeze now.')
      setCurrentStep('unfreeze')
      refetch()
    } catch (err) {
      addLog(`Claim failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleUnfreeze = async () => {
    try {
      addLog('Starting unfreeze...')
      const result = await unfreeze(KLV_ASSET_ID, bucketId)
      addLog(`Transaction submitted: ${result.hash}`)

      const receipt = await result.wait()
      const { availableAt } = parseReceipt.unfreeze(receipt)

      if (availableAt) {
        addLog(`Cooldown started! Available at: ${new Date(availableAt).toLocaleString()}`)
      }
      addLog('Workflow complete!')
      setCurrentStep('complete')
      refetch()
    } catch (err) {
      addLog(`Unfreeze failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'freeze':
        return (
          <div>
            <h3>Step 1: Freeze KLV</h3>
            <p>Stake 1000 KLV to create a staking bucket.</p>
            {balance && <p>Available: {balance.formatted} KLV</p>}
            <button onClick={handleFreeze} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Freeze 1000 KLV'}
            </button>
          </div>
        )

      case 'delegate':
        return (
          <div>
            <h3>Step 2: Delegate to Validator</h3>
            <p>Delegate your bucket to a validator to earn rewards.</p>
            <p style={{ fontSize: '12px' }}>Bucket ID: {bucketId}</p>
            <p style={{ fontSize: '12px' }}>Validator: {validatorAddress}</p>
            <button onClick={handleDelegate} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Delegate'}
            </button>
          </div>
        )

      case 'claim':
        return (
          <div>
            <h3>Step 3: Claim Rewards</h3>
            <p>Claim your staking rewards.</p>
            <button onClick={handleClaim} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Claim Rewards'}
            </button>
          </div>
        )

      case 'unfreeze':
        return (
          <div>
            <h3>Step 4: Unfreeze</h3>
            <p>Unfreeze your KLV to start the cooldown period.</p>
            <button onClick={handleUnfreeze} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Unfreeze KLV'}
            </button>
          </div>
        )

      case 'complete':
        return (
          <div>
            <h3>Workflow Complete!</h3>
            <p>You have successfully completed the full staking workflow.</p>
            <button onClick={() => window.location.reload()}>Start Over</button>
          </div>
        )
    }
  }

  if (!isConnected) {
    return <div>Please connect your wallet to start the workflow</div>
  }

  return (
    <div style={{ maxWidth: '600px', padding: '20px' }}>
      <h2>Complete Staking Workflow</h2>

      {/* Progress Indicator */}
      <div style={{ display: 'flex', marginBottom: '30px', justifyContent: 'space-between' }}>
        {['freeze', 'delegate', 'claim', 'unfreeze', 'complete'].map((step, index) => {
          const stepOrder = ['freeze', 'delegate', 'claim', 'unfreeze', 'complete']
          const currentIndex = stepOrder.indexOf(currentStep)
          const isActive = index === currentIndex
          const isComplete = index < currentIndex

          return (
            <div
              key={step}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '10px',
                backgroundColor: isActive ? '#007bff' : isComplete ? '#28a745' : '#e9ecef',
                color: isActive || isComplete ? 'white' : '#6c757d',
                borderRadius: '4px',
                margin: '0 5px',
                fontSize: '12px',
              }}
            >
              {step.toUpperCase()}
            </div>
          )
        })}
      </div>

      {/* Current Step */}
      <div
        style={{
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        {renderStep()}
      </div>

      {/* Logs */}
      <div>
        <h4>Activity Log</h4>
        <div
          style={{
            maxHeight: '200px',
            overflowY: 'auto',
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}
        >
          {logs.length === 0 ? (
            <p>No activity yet</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
```

## React Best Practices

### Handling Re-renders

```tsx
import { useKlever, useBalance } from '@klever/connect-react'
import { useMemo, useCallback } from 'react'

function OptimizedComponent() {
  const { address, provider } = useKlever()
  const { balance } = useBalance('KLV')

  // Memoize expensive calculations
  const formattedBalance = useMemo(() => {
    if (!balance) return '0'
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(Number(balance.formatted))
  }, [balance])

  // Memoize event handlers
  const handleClick = useCallback(() => {
    console.log('Address:', address)
  }, [address])

  return (
    <div>
      <p>Balance: {formattedBalance}</p>
      <button onClick={handleClick}>Show Address</button>
    </div>
  )
}
```

### Error Boundaries

```tsx
import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class TransactionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Transaction error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#f8d7da', color: '#721c24' }}>
          <h3>Transaction Error</h3>
          <p>{this.state.error?.message || 'An error occurred'}</p>
          <button onClick={() => this.setState({ hasError: false })}>Try Again</button>
        </div>
      )
    }

    return this.props.children
  }
}

// Usage
function App() {
  return (
    <TransactionErrorBoundary>
      <YourTransactionComponent />
    </TransactionErrorBoundary>
  )
}
```

### Loading States

```tsx
import { useTransaction, useKlever } from '@klever/connect-react'
import { useState } from 'react'

function LoadingStates() {
  const { isConnected, isConnecting } = useKlever()
  const { sendKLV, isLoading } = useTransaction()
  const [txStatus, setTxStatus] = useState<'idle' | 'signing' | 'broadcasting' | 'confirming'>(
    'idle',
  )

  const handleSend = async () => {
    try {
      setTxStatus('signing')
      const result = await sendKLV('klv1receiver...', 1000000n)

      setTxStatus('broadcasting')
      // Transaction is now broadcasting

      setTxStatus('confirming')
      await result.wait()

      setTxStatus('idle')
    } catch (err) {
      setTxStatus('idle')
    }
  }

  const getLoadingMessage = () => {
    switch (txStatus) {
      case 'signing':
        return 'Please sign the transaction in your wallet...'
      case 'broadcasting':
        return 'Broadcasting transaction to network...'
      case 'confirming':
        return 'Waiting for confirmation...'
      default:
        return null
    }
  }

  return (
    <div>
      <button onClick={handleSend} disabled={isLoading || isConnecting}>
        {isConnecting ? 'Connecting...' : isLoading ? getLoadingMessage() : 'Send Transaction'}
      </button>

      {isLoading && (
        <div style={{ marginTop: '10px' }}>
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#e0e0e0',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#007bff',
                animation: 'progress 1.5s ease-in-out infinite',
              }}
            />
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{getLoadingMessage()}</p>
        </div>
      )}
    </div>
  )
}
```

### Optimizing with useMemo/useCallback

```tsx
import { useBalance, useTransaction, useKlever } from '@klever/connect-react'
import { useMemo, useCallback } from 'react'

function OptimizedTransactions() {
  const { address } = useKlever()
  const { balance } = useBalance('KLV')
  const { sendKLV } = useTransaction()

  // Expensive calculation - memoize it
  const balanceStats = useMemo(() => {
    if (!balance) return null

    const amount = Number(balance.formatted)
    return {
      total: amount,
      canStake: amount >= 1000,
      canTransfer: amount >= 10,
      formatted: new Intl.NumberFormat('en-US').format(amount),
    }
  }, [balance])

  // Callback with dependencies - wrap in useCallback
  const handleMaxTransfer = useCallback(async () => {
    if (!balance) return
    const maxAmount = balance.amount - 1000000n // Keep 1 KLV for fees
    await sendKLV('klv1receiver...', maxAmount)
  }, [balance, sendKLV])

  // Stable callback - no dependencies
  const handleRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  return (
    <div>
      {balanceStats && (
        <div>
          <p>Total: {balanceStats.formatted} KLV</p>
          <p>Can Stake: {balanceStats.canStake ? 'Yes' : 'No'}</p>
          <p>Can Transfer: {balanceStats.canTransfer ? 'Yes' : 'No'}</p>
        </div>
      )}
      <button onClick={handleMaxTransfer}>Transfer Max</button>
      <button onClick={handleRefresh}>Refresh</button>
    </div>
  )
}
```

### Polling Strategies

```tsx
import { useBalance, useKlever } from '@klever/connect-react'
import { useEffect, useState } from 'react'

// Custom hook with configurable polling
function useCustomBalance(token: string, pollInterval: number = 10000) {
  const { provider, address } = useKlever()
  const [balance, setBalance] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return

    let cancelled = false

    const fetchBalance = async () => {
      try {
        const account = await provider.getAccount(address)
        const asset = account.assets?.find((a) => a.assetId === token)
        if (!cancelled) {
          setBalance(asset?.balance || '0')
        }
      } catch (err) {
        console.error('Balance fetch error:', err)
      }
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, pollInterval)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [provider, address, token, pollInterval])

  return balance
}

// Usage with different poll intervals
function BalanceWithCustomPolling() {
  // Fast polling for critical data
  const klvBalance = useCustomBalance('KLV', 5000) // 5 seconds

  // Slower polling for less critical data
  const kdaBalance = useCustomBalance('MY-KDA-TOKEN', 30000) // 30 seconds

  return (
    <div>
      <p>KLV: {klvBalance || 'Loading...'}</p>
      <p>KDA: {kdaBalance || 'Loading...'}</p>
    </div>
  )
}

// Stop polling when component is not visible
function SmartPolling() {
  const [isVisible, setIsVisible] = useState(true)
  const { balance, refetch } = useBalance('KLV')

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible'
      setIsVisible(visible)

      // Refetch when user returns to tab
      if (visible) {
        refetch()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [refetch])

  return (
    <div>
      <p>Balance: {balance?.formatted || 'Loading...'}</p>
      <p>Polling: {isVisible ? 'Active' : 'Paused'}</p>
    </div>
  )
}
```

## TypeScript Support

All hooks are fully typed for excellent TypeScript support:

```tsx
import type {
  KleverContextValue,
  Balance,
  UseTransactionReturn,
  TransactionCallbacks,
} from '@klever/connect-react'
import { useKlever, useBalance, useTransaction } from '@klever/connect-react'

// Type-safe context usage
function TypedWalletInfo() {
  const context: KleverContextValue = useKlever()
  const { address, isConnected } = context

  // address is typed as `string | undefined`
  return <div>{address && <p>Connected: {address}</p>}</div>
}

// Type-safe balance hook
function TypedBalance() {
  const {
    balance,
    isLoading,
    error,
  }: { balance: Balance | null; isLoading: boolean; error: Error | null } = useBalance('KLV')

  return (
    <div>
      {balance && (
        <div>
          <p>Token: {balance.token}</p>
          <p>Amount: {balance.amount.toString()}</p>
          <p>Precision: {balance.precision}</p>
          <p>Formatted: {balance.formatted}</p>
        </div>
      )}
    </div>
  )
}

// Type-safe transaction callbacks
function TypedTransaction() {
  const callbacks: TransactionCallbacks = {
    onSuccess: (receipt) => {
      // receipt is typed as TransactionReceipt
      console.log('Hash:', receipt.hash)
      console.log('Block:', receipt.blockNumber)
    },
    onError: (error) => {
      // error is typed as Error
      console.error('Message:', error.message)
    },
  }

  const { sendKLV, isLoading, error }: UseTransactionReturn = useTransaction(callbacks)

  return (
    <button onClick={() => sendKLV('klv1...', 1000000n)} disabled={isLoading}>
      Send
    </button>
  )
}

// Custom hook with types
function useTypedStaking() {
  const { freeze, unfreeze, isLoading, error } = useStaking()

  return {
    freeze,
    unfreeze,
    isLoading,
    error,
  }
}
```

## Troubleshooting

### Extension Not Detected

**Problem:** `extensionInstalled` is `false` even though extension is installed.

**Solutions:**

1. Refresh the page after installing extension
2. Check if extension is enabled in browser
3. Try in incognito mode to rule out conflicts
4. Check browser console for errors

```tsx
function ExtensionDebug() {
  const { extensionInstalled, searchingExtension } = useKlever()

  useEffect(() => {
    // Debug extension detection
    console.log('Extension installed:', extensionInstalled)
    console.log('Searching:', searchingExtension)
    console.log('Window.kleverWeb:', window.kleverWeb)
  }, [extensionInstalled, searchingExtension])

  return <div>Check console for debug info</div>
}
```

### Wallet Not Connecting

**Problem:** `connect()` fails or hangs.

**Solutions:**

1. Ensure extension is unlocked
2. Check network connectivity
3. Verify correct network is selected
4. Clear localStorage and try again

```tsx
function ConnectionDebug() {
  const { connect, error, isConnecting } = useKlever()

  const handleConnect = async () => {
    try {
      // Clear stored state
      localStorage.removeItem('klever-connected')
      localStorage.removeItem('klever-network')

      await connect()
    } catch (err) {
      console.error('Connection error:', err)
    }
  }

  return (
    <div>
      <button onClick={handleConnect} disabled={isConnecting}>
        {isConnecting ? 'Connecting...' : 'Connect'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  )
}
```

### Transaction Fails Silently

**Problem:** Transaction doesn't complete but no error is shown.

**Solutions:**

1. Always await `result.wait()` for confirmation
2. Use transaction monitor for real-time status
3. Check transaction on blockchain explorer
4. Ensure wallet has sufficient balance

```tsx
function DebugTransaction() {
  const { sendKLV } = useTransaction()
  const { provider } = useKlever()

  const handleSend = async () => {
    try {
      console.log('Starting transaction...')
      const result = await sendKLV('klv1receiver...', 1000000n)
      console.log('Transaction submitted:', result.hash)

      console.log('Waiting for confirmation...')
      const receipt = await result.wait()
      console.log('Confirmed:', receipt)

      // Verify on chain
      const tx = await provider.getTransaction(result.hash)
      console.log('On-chain status:', tx?.status)
    } catch (err) {
      console.error('Transaction error:', err)
      // Log full error details
      if (err instanceof Error) {
        console.error('Error name:', err.name)
        console.error('Error message:', err.message)
        console.error('Error stack:', err.stack)
      }
    }
  }

  return <button onClick={handleSend}>Send with Debug</button>
}
```

### Balance Not Updating

**Problem:** Balance doesn't reflect recent transactions.

**Solutions:**

1. Use `refetch()` to manually update
2. Wait for polling interval (10s default)
3. Check if transaction is confirmed
4. Verify correct network

```tsx
function BalanceDebug() {
  const { balance, isLoading, error, refetch } = useBalance('KLV')
  const { currentNetwork } = useKlever()

  useEffect(() => {
    // Auto-refetch after transaction
    const handleTransactionComplete = () => {
      setTimeout(() => refetch(), 2000)
    }

    window.addEventListener('transactionComplete', handleTransactionComplete)
    return () => window.removeEventListener('transactionComplete', handleTransactionComplete)
  }, [refetch])

  return (
    <div>
      <p>Network: {currentNetwork}</p>
      <p>Balance: {balance?.formatted || 'Loading...'}</p>
      <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
      {error && <p>Error: {error.message}</p>}
      <button onClick={refetch}>Force Refresh</button>
    </div>
  )
}
```

### Network Switching Issues

**Problem:** Network switch doesn't take effect.

**Solutions:**

1. Disconnect and reconnect wallet
2. Refresh page after network switch
3. Check localStorage for saved network
4. Ensure extension supports the network

```tsx
function NetworkSwitchDebug() {
  const { switchNetwork, currentNetwork, disconnect, connect } = useKlever()

  const handleSwitchNetwork = async (network: 'mainnet' | 'testnet') => {
    try {
      console.log('Current network:', currentNetwork)
      await switchNetwork(network)
      console.log('Switched to:', network)

      // Reconnect if needed
      await disconnect()
      await connect()
    } catch (err) {
      console.error('Network switch error:', err)
    }
  }

  return (
    <div>
      <p>Current: {currentNetwork}</p>
      <button onClick={() => handleSwitchNetwork('mainnet')}>Mainnet</button>
      <button onClick={() => handleSwitchNetwork('testnet')}>Testnet</button>
    </div>
  )
}
```

### Memory Leaks

**Problem:** App slows down over time.

**Solutions:**

1. Cancel polling on unmount
2. Clean up event listeners
3. Use AbortController for async operations
4. Avoid creating new objects in render

```tsx
function MemoryLeakPrevention() {
  const { provider } = useKlever()
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    const fetchData = async () => {
      try {
        const result = await provider.getAccount('klv1...')
        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
        }
      }
    }

    fetchData()

    return () => {
      // Cleanup
      cancelled = true
      controller.abort()
    }
  }, [provider])

  return <div>Data: {JSON.stringify(data)}</div>
}
```

## License

MIT
