/**
 * Core type definitions for Klever Connect SDK
 * Inspired by ethers.js, CosmJS, and @solana/web3.js
 */

// Environment types
export type Environment = 'browser' | 'node' | 'react-native' | 'unknown'

// Import global type augmentations
import './environment.d.ts'

export * from './branded'
export * from './proposals'
export * from './transactions'
export * from './network'
