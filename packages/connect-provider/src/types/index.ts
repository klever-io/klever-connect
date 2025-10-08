import type * as N from '@klever/connect-core/src/types/network'

export * from './api-types'
export * from './provider'
export * from './types'
export * from './contract-requests'

// re-exporting Network types from connect-core
export type Network = N.Network
export type NetworkName = N.NetworkName
export type NetworkConfig = N.NetworkConfig
export type NetworkURI = N.NetworkURI
