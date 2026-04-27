# url-shortening-service

Goal: build a simple URL shortening service.

NestJS + TypeScript: shorten a link, open the short URL to be redirected to the original. Bad input returns **400**. Storage is **in-memory** (clears when the process stops).

## Run

```bash
npm install
npm run build    # compile TypeScript → dist/
npm run start:dev
```

Default: **http://localhost:3000** (`PORT` overrides the port).

Optional **`SHORT_LINK_BASE`**: no trailing slash (e.g. `https://short.ly`). Used in the JSON `shortUrl`; if unset, defaults to `http://localhost:{PORT}`.

Example long URL: `https://www.example.com/some/very/long/path`

## API

- **`POST /urls`** — body `{ "url": "https://..." }` → **201** with `shortUrl`, `code`, `originalUrl`. Same URL again → same `code`.
- **`GET /{code}`** — **302** redirect; unknown code → **404**.
- **`GET /`** — `{ "ok": true }`.
- **`POST /urls` errors** — **400** for empty, missing, or invalid `url`, or extra JSON fields (`forbidNonWhitelisted`).

## Try it

```bash
curl -s -X POST http://localhost:3000/urls \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.example.com/some/very/long/path"}'
```

Then open the `shortUrl` from the response, or: `curl -sI "http://localhost:3000/<code>"` and check `Location`.

## Lint

```bash
npm run lint
npm run lint:fix
```

## Why `package-lock.json` is large

npm records **every** dependency (direct and transitive) with version, download URL, and integrity hash. That is normal and keeps installs reproducible. Most lines are not hand-written app code.
