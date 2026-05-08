# Expected output — kda-mint

Fungible mode (default):

```text
Sender: klv1<your-address>
Minting 1000000 of MTT-ABCD to klv1<receiver> (fungible)
Submitted: hash=<64-hex-chars> status=pending
Confirmed: status=success
```

NFT mode (`KLV_MINT_MODE=nft KLV_KDA_ID=MNFT-ABCD`):

```text
Sender: klv1<your-address>
Minting NFT into MNFT-ABCD (next nonce assigned by chain)
Submitted: hash=<hash> status=pending
Confirmed: status=success
Find the new NFT id (e.g. MNFT-ABCD/<nonce>) on the explorer: https://kleverscan.org/transaction/<hash>
```
