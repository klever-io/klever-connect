# Expected output — marketplace-list-asset

```text
Seller:        klv1qgz9c8r4r8a5g7l9z2tdc6yyy7y0jzn0wprv7h0utzqxvpmmqnwsezuq57
Network:       testnet
MarketplaceId: 4d61726b6574706c61636531
Listing type:  BuyItNow
Sell request:
{
  "marketType": 0,
  "marketplaceId": "4d61726b6574706c61636531",
  "assetId": "KFI",
  "price": "1000000",
  "currencyId": "KLV"
}
DRY_RUN=true — not broadcasting.
```

With `DRY_RUN=false`:

```text
Listing tx hash: 0c2a…b9a1
Explorer:        https://kleverscan.org/transaction/0c2a…b9a1
After mining, the receipt will reveal the orderId — needed to cancel (flow 42) or buy (flow 41).
```
