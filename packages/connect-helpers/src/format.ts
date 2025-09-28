export function formatKLV(amount: bigint): string {
  return (Number(amount) / 1e6).toString()
}

export function parseKLV(amount: string): bigint {
  return BigInt(Math.floor(parseFloat(amount) * 1e6))
}
