export function encodeHex(value: string): string {
  return '0x' + Buffer.from(value).toString('hex')
}
