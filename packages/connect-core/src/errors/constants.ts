/**
 * Error codes used throughout the SDK
 */
export enum ErrorCode {
  // Network errors
  NetworkError = 'NETWORK_ERROR',
  NetworkUnavailable = 'NETWORK_UNAVAILABLE',
  RequestFailed = 'REQUEST_FAILED',

  // Transaction errors
  TransactionError = 'TRANSACTION_ERROR',
  TransactionFailed = 'TRANSACTION_FAILED',
  InvalidTransaction = 'INVALID_TRANSACTION',

  // Wallet errors
  WalletError = 'WALLET_ERROR',
  WalletNotConnected = 'WALLET_NOT_CONNECTED',
  WalletNotFound = 'WALLET_NOT_FOUND',
  UserRejected = 'USER_REJECTED',

  // Validation errors
  ValidationError = 'VALIDATION_ERROR',
  InvalidAddress = 'INVALID_ADDRESS',
  InvalidAmount = 'INVALID_AMOUNT',
  InvalidParameter = 'INVALID_PARAMETER',
  InvalidInput = 'INVALID_INPUT',

  // Contract errors
  ContractError = 'CONTRACT_ERROR',
  ContractCallFailed = 'CONTRACT_CALL_FAILED',
  ContractQueryFailed = 'CONTRACT_QUERY_FAILED',

  // Authentication errors
  AuthenticationError = 'AUTHENTICATION_ERROR',
  Unauthorized = 'UNAUTHORIZED',

  // Other errors
  OperationNotSupported = 'OPERATION_NOT_SUPPORTED',
  Unknown = 'UNKNOWN_ERROR',
}
