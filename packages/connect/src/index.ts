/**
 * Klever Connect - Unified JavaScript SDK for Klever Blockchain
 *
 * This is the main entry point that re-exports all functionality from the SDK packages.
 * You can import everything you need from '@klever/connect' for convenience.
 *
 * @example
 * ```typescript
 * import { KleverProvider, Wallet, TransactionBuilder, parseKLV } from '@klever/connect'
 *
 * const provider = new KleverProvider('mainnet')
 * const wallet = new Wallet(privateKey, provider)
 * const tx = await wallet.sendTransaction({
 *   to: 'klv1...',
 *   value: parseKLV('100')
 * })
 * ```
 */

// =============================================================================
// CORE - Types, Constants, Errors, Utilities
// =============================================================================

export * from '@klever/connect-core'

// Additional explicit exports for discoverability
export type {
  KleverAddress,
  TransactionHash,
  AssetAmount,
  AssetID,
  BlockHeight,
  BlockHash,
  Nonce,
  PublicKey,
  PrivateKey,
  Signature,
  HexString,
  Base58String,
  Environment,
} from '@klever/connect-core'

export {
  // Type guards
  isKleverAddress,
  isValidAddress,
  isTransactionHash,

  // Factory functions
  createKleverAddress,
  createTransactionHash,
  createAssetAmount,

  // Format/Parse functions
  formatAssetAmount,
  parseAssetAmount,
  formatKLV,
  parseKLV,

  // Error classes
  KleverError,
  ValidationError,
  NetworkError,
  TransactionError,
  ContractError,
  WalletError,
  EncodingError,
  CryptoError,

  // Environment detection
  detectEnvironment,
  isBrowser,
  isNode,
  isReactNative,

  // Logger
  createLogger,
  getGlobalLogger,
  setGlobalLoggerOptions,
  initBrowserLogger,
  coreLogger,
  providerLogger,
  walletLogger,
  transactionLogger,
  contractLogger,
} from '@klever/connect-core'

// =============================================================================
// ENCODING - Protocol Buffer Encoding/Decoding
// =============================================================================

export {
  KleverEncoder,
  KleverDecoder,
} from '@klever/connect-encoding'

export type {
  ITransaction,
  IReceipt,
} from '@klever/connect-encoding'

// =============================================================================
// CRYPTO - Cryptographic Operations
// =============================================================================

export {
  cryptoProvider as crypto,
} from '@klever/connect-crypto'

export type {
  KeyPair,
} from '@klever/connect-crypto'

export {
  generateKeyPair,
  verifySignature,
} from '@klever/connect-crypto'

// =============================================================================
// PROVIDER - Network Communication
// =============================================================================

export {
  KleverProvider,
  HttpClient,
  NETWORKS,
  createCustomNetwork,
  getNetworkByChainId,
} from '@klever/connect-provider'

export type {
  IProvider,
  Network,
  NetworkName,
  NetworkConfig,
  ProviderConfig,
  IAccount,
  IAssetBalance,
  IBlockResponse,
  IBroadcastResult,
  IBulkBroadcastResult,
  BuildTransactionRequest,
  BuildTransactionResponse,
  TransferRequest,
  FreezeRequest,
  UnfreezeRequest,
  DelegateRequest,
  UndelegateRequest,
  WithdrawRequest,
  ClaimRequest,
  CreateAssetRequest,
  CreateValidatorRequest,
  ValidatorConfigRequest,
  VoteRequest,
  ProposalRequest,
  SmartContractRequest,
  AssetTriggerRequest,
  ConfigITORequest,
  SetITOPricesRequest,
  ITOTriggerRequest,
  BuyRequest,
  SellRequest,
  CancelMarketOrderRequest,
  CreateMarketplaceRequest,
  ConfigMarketplaceRequest,
  SetAccountNameRequest,
  UpdateAccountPermissionRequest,
  DepositRequest,
  UnjailRequest,
  AmountLike,
} from '@klever/connect-provider'

// =============================================================================
// TRANSACTIONS - Transaction Building
// =============================================================================

export {
  Transaction,
  TransactionBuilder,
} from '@klever/connect-transactions'

export type {
  BuildProtoOptions,
} from '@klever/connect-transactions'

// =============================================================================
// WALLET - Wallet Implementations
// =============================================================================

export {
  BrowserWallet,
  NodeWallet,
  BaseWallet,
  WalletFactory,
  createWallet,
} from '@klever/connect-wallet'

// =============================================================================
// CONTRACTS - Smart Contract Interactions
// =============================================================================

export {
  Contract,
  ContractFactory,
} from '@klever/connect-contracts'

export type {
  ContractABI,
} from '@klever/connect-contracts'

// =============================================================================
// LEGACY COMPATIBILITY - Keep existing exports
// =============================================================================

export { Klever } from './klever'
export { klever } from './default'

// =============================================================================
// CONVENIENCE ALIASES - Common patterns from other Web3 SDKs
// =============================================================================

// Alias for ethers.js compatibility
export { KleverProvider as Provider } from '@klever/connect-provider'
export { NodeWallet as Wallet } from '@klever/connect-wallet'

// Alias for common operations
export { TransactionBuilder as TxBuilder } from '@klever/connect-transactions'

// =============================================================================
// VERSION - SDK Version Information
// =============================================================================

export const VERSION = '0.0.1'
export const SDK_NAME = 'Klever Connect'
