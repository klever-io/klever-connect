---
'@klever/connect-transactions': minor
'@klever/connect-encoding': minor
'@klever/connect-contracts': patch
---

fix(transactions): buildProto() encodes the transaction's contracts

`TransactionBuilder.buildProto()` returned every transaction with
`Contract: null` and no `Version`, so anything built offline was dropped by
the node. It now encodes each contract into `RawData.Contract` the way the
node's `/transaction/send` does: Transfer, Freeze, Unfreeze, Delegate,
Undelegate, Withdraw, Claim, Vote and SmartContract (invoke and deploy, with
`callValue`). For the same inputs, the offline transaction has the same
`RawData` and hash as the one the node builds. Tests check this against 21
transactions captured from testnet; a call value in two assets is compared by
its decoded contract, since Go writes map entries in random order. `kdaFee` has
no node capture yet.

- Any other contract type throws a `ValidationError` instead of being dropped.
  Build those with `build()`.
- `Version` defaults to 1, the version the node sets; `buildProto({ version })`
  overrides it.
- Fields that are 0 or empty (nonce, fees, permission ID, a contract with no
  fields set) are left out, as the node's encoding does, so the signed bytes
  match what the node checks.
- A smart contract `scType` other than 0 (invoke) or 1 (deploy) throws; the
  node rejects it with "invalid smart contract type".
- Amounts, fees, the nonce and `kdaFee.amount` must be non-negative safe
  integers, `version` a uint32 and `permissionId` a non-negative int32;
  anything else throws instead of being rounded or misread.
- `transfer()`, `freeze()` and `kdaFee()` take amount strings only as decimal
  digits, in every build mode. `BigInt()` used to read '0x10' as 16 and ' 10 '
  as 10, and threw a `RangeError` for 1.5; these now throw `ValidationError`.
  A number amount must be a safe integer (for example 1e18 now throws); pass a
  bigint or a decimal string for larger values.
- Royalties: the node reads a KDA's royalties from chain state. Offline, pass
  both `kdaRoyalties` and `klvRoyalties` to `transfer()`. A smart-contract call
  value is encoded without royalties, so a call in an asset with transfer
  royalties fails on chain; build it with `build()`.

`@klever/connect-encoding`: `proto/contracts.proto` is now klever-go's
`data/transaction/proto/contracts.proto`. The SDK's earlier copy numbered fields
differently from the node (for example `TransferContract` had `Amount` = 2 and
`AssetID` = 3; the node has `AssetID` = 2, `Amount` = 3, and royalty fields), so
any contract encoded with it was misread by the node. The generated classes and
types now follow the node:

- `TransferContract` gains `KDARoyalties` and `KLVRoyalties`; `SmartContract`
  has `Type`, `Address` and a `CallValue` map of asset ID to `CallValue`
  (`Input` and `VirtualMachine` are gone); `WithdrawContract` uses
  `WithdrawType` and `amount`; `ClaimContract` uses `ClaimType`.
- Only the messages the SDK uses are generated (Transaction and the ten contract
  messages it exports, with what they reference), as before.
- `WithdrawType`, `ClaimType`, `VoteType` and `AssetType` still export the
  node's enums under these names. Values the node doesn't define are gone:
  `WithdrawType` 2-4, `VoteType.Abstain` and `SCType` upgrade. `SCType` and
  `ICallValue` are new exports, and `IAssetProperties`/`IAssetAttributes` now
  alias `IPropertiesInfo`/`IAttributesInfo`.

Breaking for code that builds proto messages directly:

- Renamed enum members: `WithdrawType.StakingReward` is `Staking`;
  `SmartContract.SCType.SCInvokeType`/`SCDeployType` are `SCInvoke`/`SCDeploy`;
  `CreateAssetContract.AssetType` is `EnumAssetType`.
- Removed nested types: `SmartContract.CallValueData`/`ICallValueData`, and
  `CreateAssetContract.AssetProperties`/`AssetAttributes` (now the top-level
  `PropertiesInfo`/`AttributesInfo`, with the node's fields).
- `CreateAssetContract`: `Name` and `Ticker` are bytes, `URIs` is a
  `map<string, string>`, `Properties`/`Attributes` move to fields 11/12, and
  `Royalties`, `Staking`, `Roles` and `AdminAddress` are added.
- Renumbered fields: `FreezeContract` swaps fields 1 and 2, `VoteContract`
  swaps `Amount` and `Type`, and `WithdrawContract` moves `Type` and `AssetID`.
  A message encoded with the old classes decodes differently on the node.

`@klever/connect-contracts`: an offline call with `nonce: 0`, the first
transaction of a new account, no longer fails with "Nonce is required".

The vote docs said 0 = abstain, 1 = yes and 2 = no; klever-go defines
0 = yes and 1 = no.
