import { TXType } from './transactions'

export interface IProposalMapItem {
  message: string
  precision: number
  unit: string
}

export interface IProposalsMap {
  FeePerDataByte: IProposalMapItem
  KAppFeeCreateValidator: IProposalMapItem
  KAppFeeCreateAsset: IProposalMapItem
  MaxEpochsUnclaimed: IProposalMapItem
  MinSelfDelegatedAmount: IProposalMapItem
  MinTotalDelegatedAmount: IProposalMapItem
  BlockRewards: IProposalMapItem
  StakingRewards: IProposalMapItem
  KAppFeeTransfer: IProposalMapItem
  KAppFeeAssetTrigger: IProposalMapItem
  KAppFeeValidatorConfig: IProposalMapItem
  KAppFeeFreeze: IProposalMapItem
  KAppFeeUnfreeze: IProposalMapItem
  KAppFeeDelegate: IProposalMapItem
  KAppFeeUndelegate: IProposalMapItem
  KAppFeeWithdraw: IProposalMapItem
  KAppFeeClaim: IProposalMapItem
  KAppFeeUnjail: IProposalMapItem
  KAppFeeSetAccountName: IProposalMapItem
  KAppFeeProposal: IProposalMapItem
  KAppFeeVote: IProposalMapItem
  KAppFeeConfigITO: IProposalMapItem
  KAppFeeSetITOPrices: IProposalMapItem
  KAppFeeBuy: IProposalMapItem
  KAppFeeSell: IProposalMapItem
  KAppFeeCancelMarketOrder: IProposalMapItem
  KAppFeeCreateMarketplace: IProposalMapItem
  KAppFeeConfigMarketplace: IProposalMapItem
  KAppFeeUpdateAccountPermission: IProposalMapItem
  MaxNFTMintBatch: IProposalMapItem
  MinKFIStakedToEnableProposals: IProposalMapItem
  MinKLVBucketAmount: IProposalMapItem
  MaxBucketSize: IProposalMapItem
  LeaderValidatorRewardsPercentage: IProposalMapItem
  ProposalMaxEpochsDuration: IProposalMapItem
  KAppFeeDeposit: IProposalMapItem
  KAppFeeITOTrigger: IProposalMapItem
  KAppFeeSmartContract: IProposalMapItem
}

export interface IParsedNetworkParam {
  number: number
  currentValue: string
  parameterLabel: string
}

export enum NetworkParamsIndexer {
  FeePerDataByte = 0,
  KAppFeeCreateValidator = 1,
  KAppFeeCreateAsset = 2,
  MaxEpochsUnclaimed = 3,
  MinSelfDelegatedAmount = 4,
  MinTotalDelegatedAmount = 5,
  BlockRewards = 6,
  StakingRewards = 7,
  KAppFeeTransfer = 8,
  KAppFeeAssetTrigger = 9,
  KAppFeeValidatorConfig = 10,
  KAppFeeFreeze = 11,
  KAppFeeUnfreeze = 12,
  KAppFeeDelegate = 13,
  KAppFeeUndelegate = 14,
  KAppFeeWithdraw = 15,
  KAppFeeClaim = 16,
  KAppFeeUnjail = 17,
  KAppFeeSetAccountName = 18,
  KAppFeeProposal = 19,
  KAppFeeVote = 20,
  KAppFeeConfigITO = 21,
  KAppFeeSetITOPrices = 22,
  KAppFeeBuy = 23,
  KAppFeeSell = 24,
  KAppFeeCancelMarketOrder = 25,
  KAppFeeCreateMarketplace = 26,
  KAppFeeConfigMarketplace = 27,
  KAppFeeUpdateAccountPermission = 28,
  MaxNFTMintBatch = 29,
  MinKFIStakedToEnableProposals = 30,
  MinKLVBucketAmount = 31,
  MaxBucketSize = 32,
  LeaderValidatorRewardsPercentage = 33,
  ProposalMaxEpochsDuration = 34,
  KAppFeeITOTrigger = 35,
  KAppFeeDeposit = 36,
  KAppFeeSmartContract = 37,
}

export const ParamContractMap: Record<number, string> = {
  [TXType.Transfer]: 'KAppFeeTransfer',
  [TXType.CreateAsset]: 'KAppFeeCreateAsset',
  [TXType.CreateValidator]: 'KAppFeeCreateValidator',
  [TXType.AssetTrigger]: 'KAppFeeAssetTrigger',
  [TXType.ValidatorConfig]: 'KAppFeeValidatorConfig',
  [TXType.Freeze]: 'KAppFeeFreeze',
  [TXType.Unfreeze]: 'KAppFeeUnfreeze',
  [TXType.Delegate]: 'KAppFeeDelegate',
  [TXType.Undelegate]: 'KAppFeeUndelegate',
  [TXType.Withdraw]: 'KAppFeeWithdraw',
  [TXType.Claim]: 'KAppFeeClaim',
  [TXType.Unjail]: 'KAppFeeUnjail',
  [TXType.SetAccountName]: 'KAppFeeSetAccountName',
  [TXType.Proposal]: 'KAppFeeProposal',
  [TXType.Vote]: 'KAppFeeVote',
  [TXType.ConfigITO]: 'KAppFeeConfigITO',
  [TXType.SetITOPrices]: 'KAppFeeSetITOPrices',
  [TXType.Buy]: 'KAppFeeBuy',
  [TXType.Sell]: 'KAppFeeSell',
  [TXType.CancelMarketOrder]: 'KAppFeeCancelMarketOrder',
  [TXType.CreateMarketplace]: 'KAppFeeCreateMarketplace',
  [TXType.ConfigMarketplace]: 'KAppFeeConfigMarketplace',
  [TXType.UpdateAccountPermission]: 'KAppFeeUpdateAccountPermission',
  [TXType.Deposit]: 'KAppFeeDeposit',
  [TXType.ITOTrigger]: 'KAppFeeITOTrigger',
  [TXType.SmartContract]: 'KAppFeeSmartContract',
}
