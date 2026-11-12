# BackNext

**Backed. Built. Delivered.** A demo-only creator request board.

Publish a request, simulate backing, inspect its demo receipt, and attach finished work. Includes six curated ideas, responsive layouts, smooth interactions, reduced-motion support, and an original SVG logo.

**No wallet connection, token approval, swap, or real payment is included.** Each browser has its own local demo. There is no shared backend or authenticated creator account. Simulated receipts are not blockchain evidence.

## Run locally

Use Node 22+ for checks and Python 3 for preview. No dependency installation is needed.

```sh
npm test
npm run check
python3 -m http.server 4173 --directory dist
```

## Hosting

GitHub Pages: Settings → Pages → Deploy from a branch → main → /docs.

Netlify: import this repository; netlify.toml validates and publishes dist/.

After editing dist/, run npm run pages and commit both dist/ and docs/ to refresh GitHub Pages.

## Next steps

Read [the demo script](guides/demo-script.md) and [next steps](guides/next-steps.md). Test with three people, use one genuine creator request, and record a 60–90 second walkthrough. Any onchain development remains a separate testnet-first milestone.

This demo does not satisfy a hackathon requirement for real WIF transactions. Do not present simulated totals as actual traction or payments.

## Branding

Three stacked request cards represent community backing underneath an idea, with a checkmark for delivered work. SVG assets live in dist/assets/.
