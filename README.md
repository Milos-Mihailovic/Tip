# Tip — Fun tipping landing page

[![CI](https://github.com/Milos-Mihailovic/Tip/actions/workflows/ci.yml/badge.svg)](https://github.com/Milos-Mihailovic/Tip/actions/workflows/ci.yml)
This is a small React + Vite landing page to accept quick tips/donations via Stripe Checkout and PayPal.

Features
- Playful landing hero
- Quick donate buttons (€5 / €10 / €25 / custom)
- Stripe Checkout integration via serverless endpoint
- PayPal buttons (client SDK)
- Small admin/demo list (mock)

Local setup

1. Copy environment file and fill keys:

```
cp .env.example .env
# then edit .env and add your test keys
```

Important env vars
- STRIPE_SECRET_KEY — your Stripe secret key (server)
- VITE_STRIPE_PUBLISHABLE_KEY — Stripe publishable key (client)
- VITE_PAYPAL_CLIENT_ID — PayPal sandbox client id (client)
- SUCCESS_URL — optional base URL for redirection (defaults to http://localhost:5173)


Install & Run (development)

Windows PowerShell:

```powershell
npm install
npm run dev
```

Open http://localhost:5173

Production build (recommended)

To build a production bundle with Tailwind processed locally (recommended for deploy):

```powershell
npm install
npm run build
```

Vercel / Netlify

- Add `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`, and `VITE_PAYPAL_CLIENT_ID` to your project environment on the host dashboard.
- Vercel will automatically detect the frontend and the `api/` serverless functions. Netlify also supports functions (use Netlify functions or adapt the endpoints).

Notes about Tailwind
- During development the project uses the Tailwind CDN for a quick preview. For production you should use the local Tailwind build (the devDependencies are included so the production build processes Tailwind classes). If you prefer to keep using the CDN, remove Tailwind devDependencies.

Stripe notes
- Use the test secret/publishable keys from your Stripe dashboard.
- Example card: 4242 4242 4242 4242, any valid future expiry, any CVC.
- The serverless endpoint is `api/create-checkout-session` — it creates a Checkout Session and returns the hosted Checkout URL.

PayPal notes
- Use your PayPal sandbox client id in `VITE_PAYPAL_CLIENT_ID`.
- The PayPal buttons are loaded from the client SDK. For production, you should create orders on the server.

Deployment
- This project is ready for Vercel or Netlify. Vercel will treat `api/*.js` as serverless functions.
- Add environment variables in the hosting dashboard (STRIPE_SECRET_KEY, VITE_STRIPE_PUBLISHABLE_KEY, VITE_PAYPAL_CLIENT_ID).

CI & Automatic Deployment (Vercel)

You can auto-deploy on push to `main` using either Vercel's Git integration (recommended) or the included GitHub Action.

1) Vercel (recommended)

- Connect this GitHub repository in the Vercel dashboard. Vercel will detect the project and create a deployment pipeline that runs on every push.
- Add environment variables in Vercel Project Settings → Environment Variables (`STRIPE_SECRET_KEY`, `PAYPAL_CLIENT_SECRET`, etc.).

2) GitHub Action (optional)

- There's a workflow at `.github/workflows/deploy.yml` that deploys to Vercel using a personal token. To use it, add these repository secrets in GitHub (Settings → Secrets & variables → Actions):

	- `VERCEL_TOKEN` — Vercel personal token (create at https://vercel.com/account/tokens)
	- `VERCEL_ORG_ID` — (optional) your Vercel org id
	- `VERCEL_PROJECT_ID` — (optional) your Vercel project id

You can add secrets via GitHub CLI:

```powershell
gh auth login
gh secret set STRIPE_SECRET_KEY --body "sk_test_..."
gh secret set VERCEL_TOKEN --body "<your_vercel_token>"
```

After adding the secrets, pushing to `main` will trigger the deploy workflow and publish your site.

Security
- Do not put secret keys in client code. Keep `STRIPE_SECRET_KEY` server-only.

Next steps / optional
- Add Stripe webhook verification in `/api/webhook` and persist payments to a database. (Implemented in this repo: the webhook endpoint now verifies signatures using `STRIPE_WEBHOOK_SECRET` and appends basic logs to `webhook.log` for demo.)
- Add a QR-code generator linking to the Checkout URL. (Implemented: when creating a Stripe Checkout session the app shows a QR code and a copy-link button so users can scan to pay from mobile or open the Checkout in a new tab.)

Stripe Webhook (testing)

This project includes a verified webhook endpoint at `api/webhook`.

1. Add `STRIPE_WEBHOOK_SECRET` to your `.env` (or host env). You get this secret when configuring a webhook endpoint in the Stripe dashboard, or from the `stripe listen` CLI command.

2. To test with the Stripe CLI (recommended):

```powershell
stripe listen --forward-to localhost:5173/api/webhook --events checkout.session.completed

# The CLI will print a webhook secret (whsec_...) — set STRIPE_WEBHOOK_SECRET to that value while testing.
```

3. The webhook handler verifies the signature and logs `checkout.session.completed` events to `webhook.log` (demo only).

Security note: In production persist events to a database and verify the webhook secret is set on your hosting provider's environment variable settings.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
