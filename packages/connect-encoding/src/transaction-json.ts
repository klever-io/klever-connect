/**
 * Node broadcast format for transactions.
 *
 * The node's `/transaction/broadcast` endpoint takes each transaction as a JSON
 * object (not as protobuf bytes): bytes as base64, 64-bit integers as numbers,
 * and contract types as their numeric enum value. protobuf.js `toJSON` writes
 * 64-bit integers as strings and enums as names, so its output is normalized
 * here. `Transaction.toJSON` and the provider's raw-transaction path both use
 * this, so every input format reaches the node as the same body.
 */

import * as protoTypes from './proto/compiled'

const ProtoTransaction = protoTypes.proto.Transaction
const ContractType = protoTypes.proto.TXContract.ContractType

/** RawData int64 fields that protobuf.js writes as strings. Dot notation for nested fields. */
const RAW_DATA_INT64_FIELDS = [
  'Nonce',
  'KAppFee',
  'BandwidthFee',
  'PermissionID',
  'KDAFee.Amount',
] as const

/**
 * Normalize protobuf.js `toJSON` output of a transaction into the node's
 * broadcast format. Mutates and returns `json`.
 *
 * @param json - The result of `Transaction.toJSON()` from the proto classes
 * @returns The same object, normalized
 * @throws {Error} If `GasLimit` is not a non-negative safe integer
 */
export function normalizeTransactionJSON(json: { [k: string]: unknown }): {
  [k: string]: unknown
} {
  if (typeof json['GasLimit'] === 'string') {
    const gasLimit = Number(json['GasLimit'])
    if (!Number.isSafeInteger(gasLimit) || gasLimit < 0) {
      throw new Error('Invalid GasLimit value')
    }
    json['GasLimit'] = gasLimit
  }

  const rawData = json['RawData']
  if (rawData && typeof rawData === 'object') {
    const raw = rawData as { [k: string]: unknown }
    numericStringFieldsToNumbers(raw, RAW_DATA_INT64_FIELDS)

    if (Array.isArray(raw['Contract'])) {
      for (const contract of raw['Contract'] as unknown[]) {
        if (contract && typeof contract === 'object') {
          const c = contract as { [k: string]: unknown }
          if (typeof c['Type'] === 'string') {
            const enumValue = ContractType[c['Type'] as keyof typeof ContractType]
            if (typeof enumValue === 'number') c['Type'] = enumValue
          }
        }
      }
    }
  }

  return json
}

/**
 * Decode protobuf-encoded transaction bytes into the node's broadcast format.
 *
 * @param bytes - A protobuf-encoded transaction, as `Transaction.toBytes()` returns
 * @returns The transaction as the JSON object `/transaction/broadcast` accepts
 * @throws {Error} If the bytes are not a protobuf transaction, or have no `RawData`
 */
export function transactionBytesToJSON(bytes: Uint8Array): { [k: string]: unknown } {
  let decoded: protoTypes.proto.Transaction
  try {
    decoded = ProtoTransaction.decode(bytes)
  } catch {
    // Omit the decoder's message: it can quote offsets and lengths of signed data.
    throw new Error('Bytes are not a valid encoded transaction')
  }
  if (!decoded.RawData) {
    throw new Error('Encoded transaction has no RawData')
  }
  return normalizeTransactionJSON(decoded.toJSON())
}

/**
 * Convert a proto-shaped transaction object (bytes as `Uint8Array`, as
 * `ITransaction` describes it) into the node's broadcast format.
 *
 * @param tx - A plain transaction object with `Uint8Array` byte fields
 * @returns The transaction as the JSON object `/transaction/broadcast` accepts
 * @throws {Error} If the object is not a transaction, or has no `RawData`
 */
export function transactionObjectToJSON(tx: { [k: string]: unknown }): {
  [k: string]: unknown
} {
  let message: protoTypes.proto.Transaction
  try {
    message = ProtoTransaction.fromObject(tx)
  } catch {
    throw new Error('Object is not a valid transaction')
  }
  if (!message.RawData) {
    throw new Error('Transaction object has no RawData')
  }
  return normalizeTransactionJSON(message.toJSON())
}

function numericStringFieldsToNumbers(
  obj: { [k: string]: unknown },
  paths: readonly string[],
): void {
  for (const path of paths) {
    const keys = path.split('.')
    const leafKey = keys.pop()
    if (leafKey === undefined) continue

    let target: { [k: string]: unknown } | undefined = obj
    for (const key of keys) {
      if (!target) break
      const next: unknown = target[key]
      target = next && typeof next === 'object' ? (next as { [k: string]: unknown }) : undefined
    }

    if (target && typeof target[leafKey] === 'string') {
      target[leafKey] = Number(target[leafKey])
    }
  }
}
