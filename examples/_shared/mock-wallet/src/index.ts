// =============================================================================
// MockWallet — test-only Wallet implementation for the examples library.
// =============================================================================
//
// PURPOSE
//   Production reactjs/* examples sign with the real BrowserWallet (powered by
//   the Klever Web Extension). Tests, however, must NEVER prompt a browser
//   extension nor hit a live RPC. This module provides:
//
//     1. MockWallet            — implements the public BrowserWallet surface
//                                with deterministic stubs.
//     2. createMockProvider()  — a thin stand-in for KleverProvider used by
//                                read-side examples (balance/account/nonce).
//
// USAGE
//   // From a reactjs/<flow>/src/<flow>.test.tsx
//   import { MockWallet, createMockProvider } from '../../../_shared/mock-wallet'
//
//   const wallet   = new MockWallet({ address: 'klv1test...' })
//   const provider = createMockProvider({
//     accounts: { 'klv1test...': { KLV: { balance: 1_000_000_000n, precision: 6 } } },
//   })
//
//   await wallet.connect()
//   const result = await wallet.transfer({ receiver: 'klv1other...', amount: 1_000_000n })
//   expect(wallet.txLog).toHaveLength(1)
//
// IMPORTANT
//   This file lives outside any published package. It is referenced by tests
//   only; consumers of `@klever/connect` will never see it.
// =============================================================================

import type {
  Wallet,
  WalletEvent,
  WalletEventHandler,
  IProvider,
  Transaction,
  TransactionSubmitResult,
  ContractRequestData,
  TransferRequest,
  Signature,
} from '@klever/connect'

/** Options accepted by the MockWallet constructor. */
export interface MockWalletOptions {
  /** Address the wallet should report. Defaults to a deterministic test address. */
  address?: string
  /** Public key (hex). Defaults to a deterministic stub. */
  publicKey?: string
  /** Pre-canned KLV balance (smallest units). Defaults to 1000 KLV. */
  balance?: bigint
  /** Pre-canned nonce. Defaults to 0. */
  nonce?: number
  /**
   * If set, every `sendTransaction`/`transfer` call records the contract data
   * here so the test can assert what would have hit the network.
   */
  txLog?: ContractRequestData[]
  /**
   * Optional override that lets a test fail or succeed deterministically:
   * - returning a hash makes the call succeed with that hash
   * - throwing makes the call fail
   */
  onSendTransaction?: (contract: ContractRequestData) => string | Promise<string>
  /**
   * Optional provider stub. If not supplied the wallet's `provider` getter
   * returns a no-op stub that throws on every method, so tests fail loudly if
   * they accidentally exercise the network.
   */
  provider?: IProvider
}

const DEFAULT_TEST_ADDRESS = 'klv1qqqqqqqqqqqqqpgqxxx0mocktest0wallet0addressxxxxxxxxxxxxxxxxs0a'
const DEFAULT_TEST_PUBKEY = '00'.repeat(32)

/**
 * Deterministic 64-byte zero "signature" object satisfying the SDK Signature
 * shape. Tests assert call shape, not cryptographic content.
 */
function stubSignature(): Signature {
  const zeros = new Uint8Array(64)
  return {
    bytes: zeros,
    toHex: () => '00'.repeat(64),
    toBase64: () => Buffer.from(zeros).toString('base64'),
  } as unknown as Signature
}

/**
 * MockWallet — minimal, side-effect-free implementation of the SDK `Wallet`
 * interface. Every async method resolves to a deterministic value so tests
 * stay fully offline.
 *
 * Mirrors the public surface of `BrowserWallet` from `@klever/connect-wallet`
 * (per FLOW-INVENTORY §3.7), specifically:
 *
 *   - address, publicKey, provider getters
 *   - connect(), disconnect(), isConnected()
 *   - signMessage(message), signTransaction(tx)
 *   - transfer(req), sendTransaction(contract)
 *   - broadcastTransaction(tx), broadcastTransactions(txs)
 *   - getBalance(), getNonce()
 *   - on / off / removeAllListeners
 *   - 'connect' / 'disconnect' / 'accountChanged' events
 */
export class MockWallet implements Pick<
  Wallet,
  | 'address'
  | 'publicKey'
  | 'provider'
  | 'connect'
  | 'disconnect'
  | 'isConnected'
  | 'signMessage'
  | 'signTransaction'
  | 'transfer'
  | 'sendTransaction'
  | 'broadcastTransaction'
  | 'broadcastTransactions'
  | 'getBalance'
  | 'getNonce'
  | 'on'
  | 'off'
  | 'removeAllListeners'
> {
  // Mutable so emitAccountChanged() can swap addresses mid-test.
  private _address: string
  readonly publicKey: string
  private _provider: IProvider | undefined

  private _connected = false
  private _balance: bigint
  private _nonce: number
  private _listeners = new Map<WalletEvent, Set<WalletEventHandler>>()
  private _txLog: ContractRequestData[]
  private _onSend?: (contract: ContractRequestData) => string | Promise<string>

  constructor(options: MockWalletOptions = {}) {
    this._address = options.address ?? DEFAULT_TEST_ADDRESS
    this.publicKey = options.publicKey ?? DEFAULT_TEST_PUBKEY
    this._balance = options.balance ?? 1_000_000_000n // 1000 KLV
    this._nonce = options.nonce ?? 0
    this._txLog = options.txLog ?? []
    this._onSend = options.onSendTransaction
    this._provider = options.provider
  }

  // ---- Identity -------------------------------------------------------------
  get address(): string {
    return this._address
  }

  get provider(): IProvider {
    if (!this._provider) {
      // Lazy-build a throwing stub so accidental network calls in tests fail
      // loudly. Use options.provider to inject a real mock provider.
      this._provider = new Proxy({} as IProvider, {
        get(_t, prop) {
          // The SDK touches `then` (Promise unwrap) and a few symbols; ignore.
          if (typeof prop === 'symbol' || prop === 'then') return undefined
          return () => {
            throw new Error(
              `[MockWallet] provider.${String(prop)} called, but no provider was injected. ` +
                `Pass { provider: createMockProvider({...}) } to the MockWallet constructor.`,
            )
          }
        },
      })
    }
    return this._provider
  }

  // ---- Connection management ------------------------------------------------
  async connect(): Promise<void> {
    this._connected = true
    this._emit('connect', { address: this._address })
  }

  async disconnect(_clearPrivateKey?: boolean): Promise<void> {
    this._connected = false
    this._emit('disconnect', undefined)
  }

  isConnected(): boolean {
    return this._connected
  }

  // ---- Signing --------------------------------------------------------------
  async signMessage(_message: string | Uint8Array): Promise<Signature> {
    return stubSignature()
  }

  async signTransaction(unsignedTx: Transaction): Promise<Transaction> {
    // Pretend signing — return the tx unchanged. Tests should not broadcast it.
    return unsignedTx
  }

  // ---- Transactions ---------------------------------------------------------
  async transfer(params: TransferRequest): Promise<TransactionSubmitResult> {
    return this.sendTransaction({
      contractType: 0, // TXType.Transfer
      ...params,
    } as unknown as ContractRequestData)
  }

  async sendTransaction(contract: ContractRequestData): Promise<TransactionSubmitResult> {
    this._txLog.push(contract)

    const hash = this._onSend ? await this._onSend(contract) : `mock-tx-hash-${this._txLog.length}`

    const wait = async (): Promise<{ hash: string; status: 'success' }> => ({
      hash,
      status: 'success',
    })

    return {
      hash: hash as TransactionSubmitResult['hash'],
      status: 'success',
      // Tests rarely inspect the raw Transaction; provide undefined cast.
      transaction: undefined as unknown as TransactionSubmitResult['transaction'],
      wait: wait as unknown as TransactionSubmitResult['wait'],
    } as TransactionSubmitResult
  }

  async broadcastTransaction(_tx: Transaction): Promise<string> {
    return `mock-broadcast-${++this._nonce}`
  }

  async broadcastTransactions(txs: Transaction[]): Promise<string[]> {
    return txs.map((_, i) => `mock-broadcast-${i + 1}`)
  }

  // ---- Account info ---------------------------------------------------------
  async getBalance(_asset?: string): Promise<bigint> {
    return this._balance
  }

  async getNonce(): Promise<number> {
    return this._nonce
  }

  // ---- Events ---------------------------------------------------------------
  on(event: WalletEvent, handler: WalletEventHandler): void {
    let set = this._listeners.get(event)
    if (!set) {
      set = new Set()
      this._listeners.set(event, set)
    }
    set.add(handler)
  }

  off(event: WalletEvent, handler: WalletEventHandler): void {
    this._listeners.get(event)?.delete(handler)
  }

  removeAllListeners(event?: WalletEvent): void {
    if (event) {
      this._listeners.delete(event)
    } else {
      this._listeners.clear()
    }
  }

  // ---- Test helpers ---------------------------------------------------------

  /** Simulate the extension switching account in the middle of a test. */
  emitAccountChanged(newAddress: string): void {
    this._address = newAddress
    this._emit('accountChanged', { address: newAddress })
  }

  /** Returns the contract requests captured during the test. */
  get txLog(): ReadonlyArray<ContractRequestData> {
    return this._txLog
  }

  /** Reset captured transaction log between assertions. */
  clearTxLog(): void {
    this._txLog.length = 0
  }

  // ---- Internal -------------------------------------------------------------
  private _emit(event: WalletEvent, data: unknown): void {
    this._listeners.get(event)?.forEach((h) => h(data as never))
  }
}

// =============================================================================
// MockProvider — a thin stand-in for `KleverProvider` (HTTP) used by tests
// that read balances, nonces, etc. via the SDK or React hooks. Only the
// surface actually exercised by the example flows is implemented.
// =============================================================================

/** Per-account asset entry: `{ balance: bigint smallest-units, precision: number }`. */
export interface MockAssetEntry {
  balance: bigint
  precision: number
}

export interface MockProviderOptions {
  /** Map of address -> { assetId -> { balance, precision } }. */
  accounts?: Record<string, Record<string, MockAssetEntry>>
  /** Block-number stub. */
  blockNumber?: number
  /** chainId reported by getNetwork. */
  chainId?: string
  /** Network name reported by getNetwork. */
  networkName?: string
}

/**
 * Build a tiny mock provider whose surface satisfies the bits of `IProvider`
 * exercised by the read-side examples (balance / account / nonce / network).
 * Calls to other methods throw a helpful error so tests fail loudly when they
 * need a feature you haven't mocked.
 */
export function createMockProvider(opts: MockProviderOptions = {}): IProvider {
  const accounts = opts.accounts ?? {}
  const blockNumber = opts.blockNumber ?? 1
  const chainId = opts.chainId ?? 'mock'
  const networkName = opts.networkName ?? 'testnet'

  const stub = {
    async getNetwork() {
      return { name: networkName, chainId }
    },
    async getBlockNumber() {
      return blockNumber
    },
    async getAccount(address: string) {
      const assets = accounts[address] ?? {}
      return {
        address,
        nonce: 0,
        balance: assets['KLV']?.balance ?? 0n,
        assets: Object.entries(assets).map(([assetId, info]) => ({
          assetId,
          balance: String(info.balance),
          precision: info.precision,
          frozenBalance: '0',
          unfrozenBalance: '0',
        })),
        permissions: [],
      }
    },
    async getBalance(address: string, asset = 'KLV') {
      return accounts[address]?.[asset]?.balance ?? 0n
    },
    async getNonce(_address: string) {
      return 0
    },
  }

  return new Proxy(stub as unknown as IProvider, {
    get(target, prop) {
      const value = (target as Record<string | symbol, unknown>)[prop]
      if (typeof value !== 'undefined') return value
      if (typeof prop === 'symbol' || prop === 'then') return undefined
      // Unknown method — throw a helpful error so tests fail loudly.
      return () => {
        throw new Error(
          `[createMockProvider] provider.${String(prop)} is not mocked. ` +
            `Add a stub for it in createMockProvider() or extend MockProviderOptions.`,
        )
      }
    },
  })
}

// Explicit re-export to keep the public surface obvious.
export type { Wallet } from '@klever/connect'
