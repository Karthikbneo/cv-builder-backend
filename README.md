# CV Builder — ES6 Backend (Extended)
Features added: **File Uploads**, **PDF Download (Puppeteer)**, **Stripe Payments**.

## Quickstart
```bash
cp .env.example .env
# Fill STRIPE_SECRET, STRIPE_WEBHOOK_SECRET, MONGODB_URI, JWT_*

npm i
npm run dev
```

## Uploads
- `POST /api/v1/uploads/image` (auth required) — form-data field name: `file`
- Response: `{ url: "/uploads/<filename>" }`

## Payments (Stripe)
1. Client calls `POST /api/v1/payments/intent` with `{ cvId, action: "download"|"share" }` to get `clientSecret`.
2. Confirm card on the client using Stripe.js with the client secret.
3. Stripe sends webhook to `/api/v1/payments/webhook` — set your webhook endpoint and secret.
4. After success, user can access `GET /api/v1/cvs/:id/pdf` (for action `download`).

### Env
```
STRIPE_SECRET=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
DOWNLOAD_PRICE_INR=9900
SHARE_PRICE_INR=4900
CURRENCY=inr
```

## PDF
- Endpoint: `GET /api/v1/cvs/:id/pdf` — requires a **succeeded** payment record for `{ user, cv, action: "download" }`.
- Generator: Puppeteer renders a simple HTML resume and returns A4 PDF.

## Security Notes
- Do **not** commit `.env` to git.
- Ensure webhook route uses **raw** body; configure your Express JSON parser globally before routes (done).


## Share Links (Payment-gated)
- Create link (auth): `POST /api/v1/shares` with `{ cvId, ttlDays? }` → returns public `json` and `pdf` URLs.
- Public fetch JSON (no auth): `GET /api/v1/shares/:token`
- Public fetch PDF (no auth): `GET /api/v1/shares/:token/pdf`
- Requires a **succeeded** Stripe payment with `action: "share"` for that CV.
- Links expire automatically (TTL, default 30 days) via TTL index.


### Share Viewer (Public HTML)
- `GET /api/v1/shares/:token/view` — a minimal, mobile-friendly HTML page for non-technical recipients. 
  Includes buttons to open the same CV as PDF or JSON.


## Templates / Layouts
- List templates: `GET /api/v1/templates` → returns 2–3 predefined layouts with demo data.
- Get one: `GET /api/v1/templates/:key`
- CV docs store chosen layout in `cv.template` (e.g., `classic`, `modern`, `elegant`).
- PDF renderer styles adapt based on `cv.template`.
