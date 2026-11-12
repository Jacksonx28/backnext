# BackNext direct-support pilot

The main board remains a browser-local demo. `/support/` is a separate live payment pilot for the portfolio starter request.

- Network: Robinhood Chain mainnet, chain ID 4663.
- Token: World is Flat WIF, `0x5173b8ea6923c2d40267890d45c46a3480954773`, 18 decimals.
- Recipient supplied by the creator: `0x3622fc18e57d4adea145a4d411fa94c0135435f0`.
- Request: A portfolio that helps you land your next client.
- Planned result: one-page portfolio starter with project gallery/contact form, walkthrough, editable files, and launch checklist. Not yet delivered.

## Flow

Open `/support/` in the browser containing Rabby or another injected EVM wallet. Connect a supporter address different from the receiving address. On Robinhood Chain, hold WIF for support and ETH for gas. Enter the amount yourself. Review recipient, token, amount, and estimated fee, then approve in your wallet. The application checks the transaction destination/calldata/value/sender and the matching WIF Transfer event before labeling a receipt verified. Pending or unverified transactions block another payment in that tab. Browser-local pending state is rechecked after reload.

One direct ERC-20 transfer; no allowance, own smart contract, escrow, staking, or automatic refunds. Recipient and request are fixed in the published source, never supplied through a query parameter. The chain proves the transfer, not the creator promise or request association. Local receipts are not a shared public index. No real transaction was executed by the developer during validation.

The public RPC is rate-limited. Receipt errors remain unverified, not successful. Save the explorer link if the service is unavailable. Wallet replacement/cancellation transactions may require checking wallet activity manually; the page does not assume a replacement succeeded.

## Validation

Eleven model/policy tests pass, including ABI golden fixtures generated independently with ethers, amount precision, self-backing rejection, and failure cases for token, recipient, sender, network, value, status, block and event mismatch. JavaScript syntax and demo isolation checks pass. Local browser preview verified network/token reads and the disconnected state. A real signed transfer remains a user action, not a completed test.

## Deployment and rollback

GitHub Pages publishes `docs/` in the remote repo; Netlify publishes `dist/`. The release copies the same support assets to both. Revert this release to remove the live pilot. If verification errors or recipient mismatches occur, disable the live page immediately and preserve pending hashes for explorer checks; never ask a user to pay again to resolve an unknown result.

## Submission update (after confirming a real payment)

WIF use: The live pilot lets supporters send WIF directly to the portfolio creator on Robinhood Chain. BackNext checks the exact transfer and displays its explorer receipt. The broader request/receipt/delivery board remains a browser-local demo.

Integration: WIF is the fee or payment. Own contract addresses: blank. Transaction evidence: only the verified live support hash. Video note: the video shows the demo workflow; the separate live support pilot was added afterward.

Sources checked November 12, 2026: https://docs.robinhood.com/chain/connecting/ ; official World Is Flat token link from https://worldisflat.fun/ to https://ponsfamily.com/launchpad/0x5173b8eA6923c2d40267890D45C46a3480954773 ; https://eips.ethereum.org/EIPS/eip-20 .
