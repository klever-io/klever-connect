# Expected output — `react-wallet-connect-disconnect`

## When the extension IS installed

After `npm run dev` and visiting <http://localhost:5173>:

```
Klever Connect — Wallet Connect / Disconnect

Press Connect to authorise this site in the Klever Web Extension.

[ Connect Wallet ]
```

After clicking **Connect Wallet** and approving in the extension popup:

```
Connected as klv1abcd…xyz

[ Disconnect ]
```

Clicking **Disconnect** returns to the previous state.

## When the extension is NOT installed

```
Klever Web Extension not found.
Install it from https://klever.io/extension and reload this page.
```

## During detection (~first 500 ms after page load)

```
Detecting Klever Web Extension…
```

## On error (e.g. user rejects in popup)

The connect button comes back, and an error line appears beneath it:

```
User rejected the request.
```
