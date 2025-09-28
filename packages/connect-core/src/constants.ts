import type { Network } from './types'

export const DECIMALS = {
  KLV: 6,
  KFI: 6,
} as const

export const NETWORKS: Record<string, Network> = {
  mainnet: {
    name: 'Klever Mainnet',
    chainId: 1,
    rpcUrl: 'https://api.klever.io',
    explorerUrl: 'https://explorer.klever.io',
    nativeCurrency: {
      name: 'Klever',
      symbol: 'KLV',
      decimals: DECIMALS.KLV,
    },
  },
  testnet: {
    name: 'Klever Testnet',
    chainId: 2,
    rpcUrl: 'https://api-testnet.klever.io',
    explorerUrl: 'https://testnet.explorer.klever.io',
    nativeCurrency: {
      name: 'Klever',
      symbol: 'KLV',
      decimals: DECIMALS.KLV,
    },
  },
} as const

export const TRANSACTION_TYPES = {
  TRANSFER: 0,
  CREATE_ASSET: 1,
  CREATE_VALIDATOR: 2,
  VALIDATOR_CONFIG: 3,
  FREEZE: 4,
  UNFREEZE: 5,
  DELEGATE: 6,
  UNDELEGATE: 7,
  WITHDRAW: 8,
  CLAIM: 9,
  UNJAIL: 10,
  ASSET_TRIGGER: 11,
  SET_ACCOUNT_NAME: 12,
  PROPOSAL: 13,
  VOTE: 14,
  CONFIG_ITO: 15,
  SET_ITO_PRICES: 16,
  BUY: 17,
  SELL: 18,
  CANCEL_MARKET_ORDER: 19,
  CREATE_MARKETPLACE: 20,
  CONFIG_MARKETPLACE: 21,
  UPDATE_ACCOUNT_PERMISSION: 22,
  DEPOSIT: 23,
  ITO_TRIGGER: 24,
} as const

export const ADDRESS_PREFIX = 'klv'
export const TESTNET_ADDRESS_PREFIX = 'klv'