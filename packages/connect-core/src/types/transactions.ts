import { ContractType as CT } from '@klever/connect-encoding'

// Re-export ContractType from encoding (source of truth from proto files)
export { ContractType } from '@klever/connect-encoding'

/**
 * Transaction type constants for Klever blockchain operations
 *
 * This object provides developer-friendly shortcuts to transaction types
 * while maintaining compatibility with the underlying proto enum values.
 * Each transaction type represents a specific operation that can be performed on the blockchain.
 *
 * @example
 * ```typescript
 * import { TXType } from '@klever/connect-core'
 *
 * // Create a transfer transaction
 * const transferType = TXType.Transfer
 *
 * // Create a delegation transaction
 * const delegateType = TXType.Delegate
 * ```
 */
export const TXType = {
  /**
   * Transfer assets between accounts
   * Used for sending KLV, KFI, or any other fungible tokens
   */
  Transfer: CT.TransferContractType as number,

  /**
   * Create a new asset (token) on the blockchain
   * Allows creation of fungible tokens, NFTs, and other asset types
   */
  CreateAsset: CT.CreateAssetContractType as number,

  /**
   * Create a new validator node
   * Requires minimum self-delegation and validator configuration
   */
  CreateValidator: CT.CreateValidatorContractType as number,

  /**
   * Update validator configuration
   * Modify validator settings like commission rate, rewards destination, etc.
   */
  ValidatorConfig: CT.ValidatorConfigContractType as number,

  /**
   * Freeze assets for staking or other purposes
   * Locks tokens to participate in bucket-based staking
   */
  Freeze: CT.FreezeContractType as number,

  /**
   * Unfreeze previously frozen assets
   * Initiates the unbonding period for frozen tokens
   */
  Unfreeze: CT.UnfreezeContractType as number,

  /**
   * Delegate tokens to a validator
   * Stake tokens with a validator to earn rewards
   */
  Delegate: CT.DelegateContractType as number,

  /**
   * Undelegate tokens from a validator
   * Remove delegation and start the unbonding period (21 days)
   */
  Undelegate: CT.UndelegateContractType as number,

  /**
   * Withdraw unbonded tokens
   * Claim tokens after the unbonding period has completed
   */
  Withdraw: CT.WithdrawContractType as number,

  /**
   * Claim staking rewards
   * Collect accumulated rewards from delegation or validation
   */
  Claim: CT.ClaimContractType as number,

  /**
   * Unjail a validator
   * Restore a jailed validator to active status
   */
  Unjail: CT.UnjailContractType as number,

  /**
   * Trigger asset-related operations
   * Perform actions like minting, burning, pausing, or wiping assets
   */
  AssetTrigger: CT.AssetTriggerContractType as number,

  /**
   * Set or update account name
   * Assign a human-readable name to an account address
   */
  SetAccountName: CT.SetAccountNameContractType as number,

  /**
   * Create a governance proposal
   * Submit a proposal for community voting
   */
  Proposal: CT.ProposalContractType as number,

  /**
   * Vote on a governance proposal
   * Cast a vote in favor or against a proposal
   */
  Vote: CT.VoteContractType as number,

  /**
   * Configure an Initial Token Offering (ITO)
   * Set up parameters for a token sale
   */
  ConfigITO: CT.ConfigITOContractType as number,

  /**
   * Set ITO pricing information
   * Define price tiers and sale conditions for an ITO
   */
  SetITOPrices: CT.SetITOPricesContractType as number,

  /**
   * Buy assets from an ITO or marketplace
   * Purchase tokens or NFTs from available offers
   */
  Buy: CT.BuyContractType as number,

  /**
   * Sell assets on marketplace
   * Create a sell order for assets
   */
  Sell: CT.SellContractType as number,

  /**
   * Cancel a marketplace order
   * Remove an active buy or sell order
   */
  CancelMarketOrder: CT.CancelMarketOrderContractType as number,

  /**
   * Create a new marketplace
   * Initialize a marketplace for trading assets
   */
  CreateMarketplace: CT.CreateMarketplaceContractType as number,

  /**
   * Configure marketplace settings
   * Update marketplace parameters and rules
   */
  ConfigMarketplace: CT.ConfigMarketplaceContractType as number,

  /**
   * Update account permissions
   * Modify account access control and multi-signature settings
   */
  UpdateAccountPermission: CT.UpdateAccountPermissionContractType as number,

  /**
   * Deposit assets
   * Deposit tokens into a contract or liquidity pool
   */
  Deposit: CT.DepositContractType as number,

  /**
   * Trigger ITO-related operations
   * Perform actions like starting, pausing, or finalizing an ITO
   */
  ITOTrigger: CT.ITOTriggerContractType as number,

  /**
   * Smart contract interaction
   * Deploy or invoke smart contract functions
   */
  SmartContract: CT.SmartContractType as number,
} as const

/**
 * Type representing any valid transaction type value
 * Extracted from the TXType constant object
 */
export type TXTypeValue = (typeof TXType)[keyof typeof TXType]

/**
 * Smart contract specific transaction types
 * Distinguishes between contract deployment and invocation
 *
 * @example
 * ```typescript
 * // Deploy a new contract
 * const deployType = SCTXType.SCDeploy
 *
 * // Invoke an existing contract
 * const invokeType = SCTXType.SCInvoke
 * ```
 */
export enum SCTXType {
  /**
   * Invoke a function on an existing smart contract
   * Calls a method on a deployed contract
   */
  SCInvoke = 0,

  /**
   * Deploy a new smart contract
   * Upload and initialize contract code on the blockchain
   */
  SCDeploy = 1,
}
