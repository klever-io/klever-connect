/**
 * Core type definitions for Klever Connect SDK
 * Inspired by ethers.js, CosmJS, and @solana/web3.js
 */

// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./env.d.ts" />

// Environment types
export type Environment = 'browser' | 'node' | 'react-native' | 'unknown'

export * from './branded'
export * from './proposals'
export * from './transactions'
export * from './network'
