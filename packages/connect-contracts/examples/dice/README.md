# Dice Contract Example

This folder contains a sample Dice game smart contract for Klever blockchain, used for testing and demonstration purposes.

## Files

- **`dice.abi.json`** - Contract ABI (Application Binary Interface)
- **`dice.wasm`** - Compiled WebAssembly bytecode

## Contract Overview

The Dice contract is a simple gambling game where users can bet on dice rolls.

### Endpoints

#### `getLastResult(address: Address) → Bet` (readonly)

Returns the last bet result for a given address.

**Parameters:**

- `address` - User's Klever address

**Returns:**

- `Bet` struct containing bet details

#### `bet(bet_type: BetType, bet_value: u32) → Bet` (mutable, payable in KLV)

Place a bet on the dice game.

**Parameters:**

- `bet_type` - Type of bet (UNDER=0, OVER=1)
- `bet_value` - Target number (1-100)

**Returns:**

- `Bet` struct with result

### Types

#### `Bet` (struct)

```rust
struct Bet {
  bet_type: u32,      // Type of bet placed
  bet_value: u32,     // Target number
  dice_value: u32,    // Rolled dice value
  multiplier: u32,    // Win multiplier
  is_winner: bool     // Whether bet won
}
```

#### `BetType` (enum)

```rust
enum BetType {
  UNDER = 0,  // Bet that dice rolls under bet_value
  OVER = 1    // Bet that dice rolls over bet_value
}
```

## Usage Example

```typescript
import { Contract, contractParam } from '@klever/connect-contracts'
import diceAbi from './examples/dice/dice.abi.json'

// Create contract instance
const contract = new Contract(contractAddress, diceAbi, provider)

// Query last result
const result = await contract.getLastResult(userAddress)
console.log('Last bet:', result)

// Place a bet (bet UNDER 50)
const betType = contractParam.u32(0) // UNDER
const betValue = contractParam.u32(50)
const tx = await contract.bet(betType, betValue, {
  value: { KLV: parseKLV('1') },
})
```

## Deployment

```typescript
import { ContractFactory } from '@klever/connect-contracts'
import diceAbi from './examples/dice/dice.abi.json'
import diceWasm from './examples/dice/dice.wasm'

const factory = new ContractFactory(diceAbi, diceWasm, signer)
const contract = await factory.deploy()
console.log('Deployed at:', contract.address)
```

## Contract Information

- **Language:** Rust
- **Framework:** klever-sc v0.45.0
- **VM:** WebAssembly (WASM)
- **Network:** Klever Testnet
