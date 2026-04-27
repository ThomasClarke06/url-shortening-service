# url-shortening-service
Goal: Build a simple URL shortening service

NestJS + TypeScript API: create a shortened link, follow it to the original URL, reject bad input. Storage is in-memory (resets when the process restarts).

## Run

```bash
npm install
npm run start:dev
```

Default: http://localhost:3000
Example: https://www.example.com/some/very/long/path

## API

**`POST /urls`** — body `{ "url": "https://..." }` → **201**

```json
{
  "shortUrl": "http://localhost:3000/abc12xyz",
  "code": "abc12xyz",
  "originalUrl": "https://..."
}
```

**`GET /{code}`** — **302** to the stored URL (`Location` header). Unknown code → **404**.

**`GET /`** — `{ "ok": true }` for a quick health check.

**`POST /urls` errors: 400 for empty, missing, or invalid URL, or extra JSON properties (`forbidNonWhitelisted`).

## Try it

```bash
curl -s -X POST http://localhost:3000/urls \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.example.com/some/very/long/path"}'
```

## Tests

```bash
npm test
npm run test:e2e
```
