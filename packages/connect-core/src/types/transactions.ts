import { ContractType as CT } from '@klever/connect-encoding'

// Re-export ContractType from encoding (source of truth from proto files)
export { ContractType } from '@klever/connect-encoding'

// Developer-friendly transaction type shortcuts
// This provides a cleaner API while using the actual enum values from proto
// Cast to number to avoid TypeScript declaration file issues with proto enums
export const TXType = {
  Transfer: CT.TransferContractType as number,
  CreateAsset: CT.CreateAssetContractType as number,
  CreateValidator: CT.CreateValidatorContractType as number,
  ValidatorConfig: CT.ValidatorConfigContractType as number,
  Freeze: CT.FreezeContractType as number,
  Unfreeze: CT.UnfreezeContractType as number,
  Delegate: CT.DelegateContractType as number,
  Undelegate: CT.UndelegateContractType as number,
  Withdraw: CT.WithdrawContractType as number,
  Claim: CT.ClaimContractType as number,
  Unjail: CT.UnjailContractType as number,
  AssetTrigger: CT.AssetTriggerContractType as number,
  SetAccountName: CT.SetAccountNameContractType as number,
  Proposal: CT.ProposalContractType as number,
  Vote: CT.VoteContractType as number,
  ConfigITO: CT.ConfigITOContractType as number,
  SetITOPrices: CT.SetITOPricesContractType as number,
  Buy: CT.BuyContractType as number,
  Sell: CT.SellContractType as number,
  CancelMarketOrder: CT.CancelMarketOrderContractType as number,
  CreateMarketplace: CT.CreateMarketplaceContractType as number,
  ConfigMarketplace: CT.ConfigMarketplaceContractType as number,
  UpdateAccountPermission: CT.UpdateAccountPermissionContractType as number,
  Deposit: CT.DepositContractType as number,
  ITOTrigger: CT.ITOTriggerContractType as number,
  SmartContract: CT.SmartContractType as number,
} as const

// Type for the TXType values
export type TXTypeValue = (typeof TXType)[keyof typeof TXType]

// Smart contract transaction types
export enum SCTXType {
  SCInvoke = 0,
  SCDeploy = 1,
}
