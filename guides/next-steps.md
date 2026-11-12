# What to do next

1. Open the hosted demo and run the full loop: create → back → receipt → deliver.
2. Replace a sample idea with one you can personally deliver. Add a real output link when ready.
3. Record the 60–90 second walkthrough in `demo-script.md`.
4. Ask three people to try it without coaching. Find out whether they understand backing, can find the delivered work, and would use it again.
5. Keep it demo-only until the product and transaction flow are validated. The next technical milestone is a testnet exercise using a mock token, not mainnet funds.
6. For a hackathon requiring real WIF transactions, contact the organizers to ask whether a demo can be reviewed or submitted outside the qualifying track. Do not claim this demo meets the onchain requirement.

## Hosting handoff

The deployable folder is `dist/`; it contains only the demo. GitHub Pages publishes the docs/ folder; Netlify publishes dist/. Do not publish `experimental/`, `node_modules/`, or `.openai/` as website assets.
