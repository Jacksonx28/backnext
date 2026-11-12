# BackNext

**Backed. Built. Delivered.** A creator request board with a separate live WIF support pilot.

## Two clearly separated experiences

- The main board is an interactive browser-local demo: publish sample requests, simulate backing, inspect demo receipts, and attach finished work.
- `/support/` is a live direct-payment pilot for one portfolio starter request. It connects injected EVM wallets such as Rabby, checks Robinhood Chain and the WIF token, simulates an exact transfer, and opens the wallet for user approval. A receipt is labeled verified only when the transaction and matching token Transfer event confirm the payment.

Live support goes directly to the creator. No escrow, token allowance, staking, deployed BackNext contract, or automatic refund. Creator delivery is not guaranteed. Request metadata and receipt association are site-managed, not enforced onchain. The demo video illustrates the broader simulated workflow; the live pilot was added afterward.

## Run and check

Use Node 22+ and Python 3. No dependency installation is required.

```sh
npm test
npm run check
python3 -m http.server 4173 --directory dist
```

## Hosting

GitHub Pages publishes main → `/docs`. Netlify publishes `/dist`. After editing dist, run `npm run pages` and commit both folders. Only these static assets should be served.

Read [live pilot details and validation](guides/live-pilot.md). A real payment must be approved by the user in their own wallet. Simulated demo receipts are never transaction evidence.
