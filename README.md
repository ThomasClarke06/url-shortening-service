# url-shortening-service

Goal: build a simple URL shortening service.

NestJS + TypeScript: shorten a link, open the short URL to be redirected to the original. Bad input returns 400. Storage is in-memory (clears when the process stops).

## Run

```bash
npm install
npm run build    # compile TypeScript
npm run start:dev
```

Default: http://localhost:3000 (`PORT` overrides the port).

Optional `SHORT_LINK_BASE`: no trailing slash (e.g. https://short.ly). Used in the JSON `shortUrl`; if unset, defaults to `http://localhost:{PORT}`.

Example long URL: `https://www.example.com/some/very/long/path`

## API

- POST `/urls` — body `{ "url": "https://..." }` → 201 with `shortUrl`, `code`, `originalUrl`. Same URL again → same `code`.
- GET `/:code` — 302 redirect; unknown code → 404.
- GET `/` — `{ "ok": true }`.
- POST `/urls` errors — 400 for empty, missing, or invalid `url`, or extra JSON fields (`forbidNonWhitelisted`).

## How to simply test
Run it:
npm install
npm run start:dev
Leave it running. By default it listens on http://localhost:3000.

Shorten a URL:
In another terminal:
curl -s -X POST http://localhost:3000/urls \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.example.com/some/very/long/path"}'


## Tests

```bash
npm test
npm run test:e2e
```

## Lint

```bash
npm run lint
npm run lint:fix
```


## Design and future work

### Currently

- In-memory maps: `code → url` and `url → code` so lookups are O(1) and the same long URL (after trim) always maps to the same short code (idempotent POST `/urls`).
- Short codes: 8 characters from `a-z0-9`. If a slot were ever taken, the service retries a few times then fails with 500.

### Toward production

- Persistence: Redis or Postgres (with migrations) so links survive restarts.
- Identity: auth or API keys on POST `/urls`, per-IP rate limits.
- Product features: click counts, admin list/revoke, and canonical URL rules so duplicates merge sensibly.