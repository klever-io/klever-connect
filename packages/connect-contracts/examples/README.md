# Contract Examples

This folder contains example smart contracts for testing and demonstrating the `@klever/connect-contracts` package.

## Available Examples

### [Dice Contract](./dice/)

A simple gambling game smart contract written in Rust for Klever blockchain.

**Features:**
- Bet on dice rolls (UNDER/OVER)
- Query last bet results
- Payable in KLV
- Demonstrates structs, enums, and readonly/mutable endpoints

**Files:**
- `dice.abi.json` - Contract ABI
- `dice.wasm` - Compiled bytecode
- `README.md` - Full documentation

## Using Examples in Tests

All test files in this package reference these examples:

```typescript
import diceAbi from '../examples/dice/dice.abi.json'

const contract = new Contract(address, diceAbi, provider)
```

## Adding New Examples

To add a new contract example:

1. Create a new folder: `examples/your-contract/`
2. Add the ABI: `your-contract.abi.json`
3. Add the bytecode: `your-contract.wasm` (if available)
4. Create documentation: `README.md`
5. Update this file with a link to your example

## Testing with Examples

Run the test suite to see examples in action:

```bash
pnpm --filter @klever/connect-contracts test
```

All 125 tests use the Dice contract example to verify:
- ABI parsing and validation
- Parameter encoding/decoding
- Function call encoding
- Contract class functionality
- ContractFactory operations
