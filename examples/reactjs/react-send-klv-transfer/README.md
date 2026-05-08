# `react-send-klv-transfer` (polished)

> Polished form-based 1-KLV transfer with validation, loading + toast UX.

## Why a "polished" variant?

Flow #17's React variant (lives under another folder, kept minimal) shows the smallest possible "send KLV" example. This folder demonstrates the patterns a real dApp uses:

- Live address + amount validation (red borders, inline errors)
- Live preview ("Will send 1.5 KLV to klv1abc…")
- Loading state on the submit button
- Toast banner for success / error
- "Send another" reset button

## Run

```bash
npm install
npm run dev
npm test
npm run test:testnet
```

## Gotchas

- **Reset state vs reset hook.** Calling `reset()` from `useTransaction` clears the hook's `data`/`error`, but you have to clear your own form fields too (we do this in `handleReset`).
- **`useEffect` for toasts.** Don't render the toast inline from `error` — derive it via `useEffect` so the toast persists for at least one render and isn't tied to render-loop state.
