# Neomeditech website

Next.js 16 website and quotation-request portal for Neomeditech Biomedical Solutions Pvt. Ltd.

## Local setup

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` and fill every value.
3. Run `npm run dev`.

Use `npm run lint`, `npm run typecheck`, and `npm run build` before a release.

## Required production configuration

Set these values in the hosting provider. Do not commit `.env.local` or any credentials.

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string for persistent users, catalogue, quote requests, messages, and settings. |
| `NEXTAUTH_SECRET` | High-entropy secret used to sign sessions. |
| `NEXTAUTH_URL` | Exact public HTTPS site origin, for example `https://your-domain`. Never use localhost in production. |
| `NEXT_PUBLIC_SITE_URL` | Same public HTTPS origin, used for canonical metadata, sitemap, and robots. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials. |
| `ADMIN_EMAILS` | Comma-separated administrator email addresses. There is intentionally no hard-coded administrator fallback. |
| `RESEND_API_KEY` | Resend server API key for password-reset emails. |
| `RESEND_FROM_EMAIL` | A verified sender address on the production domain. |

In Google Cloud, configure the authorized JavaScript origin as the exact `NEXTAUTH_URL` and configure this redirect URI:

```
${NEXTAUTH_URL}/api/auth/callback/google
```

For example, a site at `https://example.com` requires `https://example.com/api/auth/callback/google`. Update both Google and Resend settings before the domain is switched live.

## Data and content operations

The catalogue, account profiles, quote requests, contact messages, customer notes, and store settings are stored in MongoDB. The first catalogue request creates records from `src/data/products.ts` only when no record already exists for that product slug. Seed records deliberately have no image, stock value, price, or unverified specification.

Before launch, an administrator must complete each live catalogue entry with verified copy, availability, pricing where appropriate, and an image placed under `public/` (then reference it with a path such as `/products/device.jpg`). The customer experience deliberately displays “Quote required” until a verified price is entered.

## Deployment checklist

- Configure every required variable above, including at least one `ADMIN_EMAILS` address.
- Use a production MongoDB database with backups and restricted network access.
- Verify the OAuth origin and callback URI for the live domain.
- Verify the Resend sending domain and send a password-reset email.
- Complete catalogue content and images in the administrator area.
- Confirm the Privacy Policy and Terms of Service with legal counsel for the business’s actual practices.
- Run `npm run lint`, `npm run typecheck`, and `npm run build` in the production environment.
