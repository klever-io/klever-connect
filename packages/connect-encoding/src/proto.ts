/**
 * Proto type exports for Klever Connect SDK
 * Provides clean access to protobuf-generated types
 */

import * as protoTypes from './proto/compiled'

// Export the proto namespace directly (avoiding proto.proto nesting)
export const proto = protoTypes.proto

// ============================================
// Core Transaction Types
// ============================================

export const TXContract = protoTypes.proto.TXContract
export const Transaction = protoTypes.proto.Transaction

// ============================================
// Enums
// ============================================

// Export proto-generated enums directly (source of truth)
export const ContractType = protoTypes.proto.TXContract.ContractType
export const TXResult = protoTypes.proto.Transaction.TXResult
export const TXResultCode = protoTypes.proto.Transaction.TXResultCode

// ============================================
// Contract Message Classes
// ============================================

export const TransferContract = protoTypes.proto.TransferContract
export const FreezeContract = protoTypes.proto.FreezeContract
export const UnfreezeContract = protoTypes.proto.UnfreezeContract
export const DelegateContract = protoTypes.proto.DelegateContract
export const UndelegateContract = protoTypes.proto.UndelegateContract
export const WithdrawContract = protoTypes.proto.WithdrawContract
export const ClaimContract = protoTypes.proto.ClaimContract
export const VoteContract = protoTypes.proto.VoteContract
export const CreateAssetContract = protoTypes.proto.CreateAssetContract
export const SmartContract = protoTypes.proto.SmartContract

// ============================================
// Nested Enums (for convenience)
// ============================================

export const WithdrawType = protoTypes.proto.WithdrawContract.WithdrawType
export const ClaimType = protoTypes.proto.ClaimContract.ClaimType
export const VoteType = protoTypes.proto.VoteContract.VoteType
export const AssetType = protoTypes.proto.CreateAssetContract.AssetType

// ============================================
// TypeScript Interface Types
// ============================================

export type ITXContract = protoTypes.proto.ITXContract
export type ITransaction = protoTypes.proto.ITransaction

// Contract interfaces
export type ITransferContract = protoTypes.proto.ITransferContract
export type IFreezeContract = protoTypes.proto.IFreezeContract
export type IUnfreezeContract = protoTypes.proto.IUnfreezeContract
export type IDelegateContract = protoTypes.proto.IDelegateContract
export type IUndelegateContract = protoTypes.proto.IUndelegateContract
export type IWithdrawContract = protoTypes.proto.IWithdrawContract
export type IClaimContract = protoTypes.proto.IClaimContract
export type IVoteContract = protoTypes.proto.IVoteContract
export type ICreateAssetContract = protoTypes.proto.ICreateAssetContract
export type ISmartContract = protoTypes.proto.ISmartContract

// Nested interfaces
export type IAssetProperties = protoTypes.proto.CreateAssetContract.IAssetProperties
export type IAssetAttributes = protoTypes.proto.CreateAssetContract.IAssetAttributes
export type IKDAFee = protoTypes.proto.Transaction.IKDAFee
export type IRaw = protoTypes.proto.Transaction.IRaw
export type IReceipt = protoTypes.proto.Transaction.IReceipt
