/**
 * Core type definitions for Klever Connect SDK
 * Inspired by ethers.js, CosmJS, and @solana/web3.js
 */

declare const brand: unique symbol

export type Brand<T, TBrand> = T & { [brand]: TBrand }

// Branded types for type safety
export type KleverAddress = Brand<string, 'KleverAddress'>
export type TransactionHash = Brand<string, 'TransactionHash'>
export type BlockHash = Brand<string, 'BlockHash'>
export type AssetID = Brand<string, 'AssetID'>
export type ValidatorAddress = Brand<string, 'ValidatorAddress'>
export type PublicKey = Brand<string, 'PublicKey'>
export type PrivateKey = Brand<string, 'PrivateKey'>
export type Signature = Brand<string, 'Signature'>
export type HexString = Brand<string, 'HexString'>
export type Base58String = Brand<string, 'Base58String'>
