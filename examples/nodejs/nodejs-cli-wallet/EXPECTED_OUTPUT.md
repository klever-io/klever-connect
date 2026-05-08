# Expected output — nodejs-cli-wallet

```text
$ klever-cli balance --address klv1ALICE…
1500000

$ klever-cli account --address klv1ALICE…
{
  "address": "klv1ALICE…",
  "nonce": 42,
  "balance": "1500000",
  "frozenBalance": "0"
}

$ klever-cli faucet
{
  "txHash": "5b3a…1e2f"
}

$ klever-cli transfer --to klv1BOB… --amount 1.5
Transfer tx hash: 7a3b…0f1d
Status:           pending

$ klever-cli tx --hash 7a3b…0f1d
{
  "hash": "7a3b…0f1d",
  "status": "success"
}

$ klever-cli --help
Klever CLI — interact with the Klever blockchain
…
```
