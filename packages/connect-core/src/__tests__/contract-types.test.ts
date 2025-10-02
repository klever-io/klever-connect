import { describe, it, expect } from 'vitest'
import { ContractType } from '@klever/connect-encoding'
import { TXType } from '../constants'

describe('Contract Types', () => {
  it('TXType values should match ContractType enum values', () => {
    expect(TXType.Transfer).toBe(ContractType.TransferContractType)
    expect(TXType.CreateAsset).toBe(ContractType.CreateAssetContractType)
    expect(TXType.CreateValidator).toBe(ContractType.CreateValidatorContractType)
    expect(TXType.ValidatorConfig).toBe(ContractType.ValidatorConfigContractType)
    expect(TXType.Freeze).toBe(ContractType.FreezeContractType)
    expect(TXType.Unfreeze).toBe(ContractType.UnfreezeContractType)
    expect(TXType.Delegate).toBe(ContractType.DelegateContractType)
    expect(TXType.Undelegate).toBe(ContractType.UndelegateContractType)
    expect(TXType.Withdraw).toBe(ContractType.WithdrawContractType)
    expect(TXType.Claim).toBe(ContractType.ClaimContractType)
    expect(TXType.Unjail).toBe(ContractType.UnjailContractType)
    expect(TXType.AssetTrigger).toBe(ContractType.AssetTriggerContractType)
    expect(TXType.SetAccountName).toBe(ContractType.SetAccountNameContractType)
    expect(TXType.Proposal).toBe(ContractType.ProposalContractType)
    expect(TXType.Vote).toBe(ContractType.VoteContractType)
    expect(TXType.ConfigITO).toBe(ContractType.ConfigITOContractType)
    expect(TXType.SetITOPrices).toBe(ContractType.SetITOPricesContractType)
    expect(TXType.Buy).toBe(ContractType.BuyContractType)
    expect(TXType.Sell).toBe(ContractType.SellContractType)
    expect(TXType.CancelMarketOrder).toBe(ContractType.CancelMarketOrderContractType)
    expect(TXType.CreateMarketplace).toBe(ContractType.CreateMarketplaceContractType)
    expect(TXType.ConfigMarketplace).toBe(ContractType.ConfigMarketplaceContractType)
    expect(TXType.UpdateAccountPermission).toBe(ContractType.UpdateAccountPermissionContractType)
    expect(TXType.Deposit).toBe(ContractType.DepositContractType)
    expect(TXType.ITOTrigger).toBe(ContractType.ITOTriggerContractType)
    expect(TXType.SmartContract).toBe(ContractType.SmartContractType)
  })

  it('should have correct values for important contract types', () => {
    expect(TXType.Transfer).toBe(0)
    expect(TXType.SmartContract).toBe(63)
  })
})
