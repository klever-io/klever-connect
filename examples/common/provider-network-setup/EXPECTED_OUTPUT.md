# Expected output — `provider-network-setup`

## `npm start` (default: testnet)

```text
Constructing KleverProvider for "testnet"
  chainId : 109
  name    : testnet

Built-in NETWORKS:
  - mainnet  chainId=108 api=https://api.mainnet.klever.org
  - testnet  chainId=109 api=https://api.testnet.klever.org
  - devnet   chainId=110 api=https://api.devnet.klever.org
  - local    chainId=local api=http://localhost:8080

(KLV_CUSTOM_RPC not set — skipping custom-network demo)

Done.
```

## `KLV_NETWORK=devnet npm start`

```text
Constructing KleverProvider for "devnet"
  chainId : 110
  name    : devnet
...
```

## `KLV_CUSTOM_RPC=https://node.example.com npm start`

```text
Constructing KleverProvider for "testnet"
  chainId : 109
  name    : testnet

Built-in NETWORKS:
  ...

Custom provider:
  chainId : 109
  name    : custom
  api url : https://node.example.com

Done.
```

> Exact chainId / API URL strings come from `NETWORKS` in `@klever/connect`.
> Verify against `packages/connect-provider/src/network.ts` if anything looks
> off after an SDK upgrade.
