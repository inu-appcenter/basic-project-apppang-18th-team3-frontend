---
name: e2e-harness
description: Launch this app's Vite dev server and drive it with Playwright to verify pages (login/register flows) render and behave correctly. Use when asked to run, test, or verify the app in a real browser.
---

# E2E harness

This project uses `@playwright/test` for browser-driven e2e tests. Don't
write an ad-hoc driver script — use the existing harness.

## Run

```bash
npm run test:e2e
```

This auto-starts `npm run dev` (Vite on `http://localhost:5173`) via
Playwright's `webServer` config in `playwright.config.ts` and tears it down
after. No manual dev-server start/stop needed.

Chromium must be installed once per machine:

```bash
npx playwright install chromium
```

## Where specs live

- `e2e/*.spec.ts` — mocked specs (default `npm run test:e2e` target).
  Network calls to `/api/**` are intercepted with `page.route()` so tests
  are deterministic and don't depend on the live backend.
- `e2e/live/*.spec.ts` — **not** run by `npm run test:e2e`. These hit the
  real backend (`https://apppang.shop`) directly via Playwright's `request`
  fixture (no browser, so CORS doesn't apply). Run manually with:

  ```bash
  npm run test:e2e:live
  ```

  Use this only to spot-check that the real API contract (field names,
  status codes) still matches what the mocked specs assume — not as a
  routine check, since the live backend can be flaky/down independent of
  frontend code (e.g. `/api/auth/login`, `/api/auth/signup`, and
  `/api/auth/check-email` were all returning `500` as of 2026-07-14 —
  a backend-side bug, not a frontend issue).

## Gotchas

- `apppang.shop` rejects CORS preflight from `localhost` origins, so a
  page-level `fetch`/`axios` call to the real backend fails in a real
  browser. `vite.config.ts` proxies `/api` → `https://apppang.shop` so the
  dev server itself relays the request server-side. Mocked specs never hit
  this path since `page.route()` intercepts before the request leaves the
  browser; the proxy only matters if you deliberately test against the
  live backend from a page (avoid this — use `e2e/live` with the `request`
  fixture instead).
- React controlled inputs: use Playwright's `fill`/`click`, not
  `evaluate(el => el.value = ...)` — the latter skips React's `onChange`.
- Auth state lives in `localStorage` (`accessToken`) plus the in-memory
  `useAuthStore` (zustand) — after a mocked login, read
  `localStorage.getItem('accessToken')` to assert the token was persisted.
