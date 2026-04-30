# URL Shortening Service Demo Guide (Windows + PowerShell + VS Code)

This guide shows how to demo the full app behavior on Windows using PowerShell in VS Code, and how to run all tests.

## 1) Prerequisites

- Node.js 20+ (`node -v`)
- npm (`npm -v`)
- VS Code
- PowerShell (Windows PowerShell or PowerShell 7)

Open **Terminal > New Terminal** in VS Code. Keep all commands below in that terminal unless stated otherwise.

## 2) Install dependencies

```powershell
npm install
```

## 3) Build once

```powershell
npm run build
```

This compiles TypeScript to `dist/`.

## 4) Start the app (dev mode)

```powershell
npm run start:dev
```

Expected default URL:

- `http://localhost:3000`

Leave this terminal running.

## 5) Demo the API in a second PowerShell terminal

Open a second VS Code terminal (**+** icon in terminal panel), then run:

### Health check

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/"
```

Expected:

- `ok` is `true`

### Create a short URL

```powershell
$body = @{ url = "https://www.example.com/some/very/long/path" } | ConvertTo-Json
$shorten = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/urls" -ContentType "application/json" -Body $body
$shorten
```

Expected keys in response:

- `shortUrl`
- `code`
- `originalUrl`

### Verify idempotency (same URL gives same code)

```powershell
$body = @{ url = "https://www.example.com/some/very/long/path" } | ConvertTo-Json -Compress
$r1 = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/urls" -ContentType "application/json" -Body $body
Start-Sleep -Milliseconds 200
$r2 = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/urls" -ContentType "application/json" -Body $body
"First code:  $($r1.code)"
"Second code: $($r2.code)"
"Equal codes? $($r1.code -eq $r2.code)"
```

Expected:

- `Equal codes? True`
- If it prints `False`, the app likely restarted and in-memory storage was reset
- If PowerShell shows `>>` and seems stuck, an unmatched quote/parenthesis was entered; press `Ctrl + C` and re-run the block exactly.

### Test redirect behavior (`GET /:code`)

`Invoke-RestMethod` auto-follows redirects, so use `curl.exe` to inspect status and location:

```powershell
curl.exe -i "http://localhost:3000/$($shorten.code)"
```
e.g. curl.exe -i "http://localhost:3000/$q14uhu1t"

Expected:

- Status `302`
- `Location` header equals original URL

### Test unknown short code

```powershell
curl.exe -i "http://localhost:3000/notfound1"
```

Expected:

- Status `404`

### Test validation errors (`POST /urls`)

Invalid URL:

```powershell
$bad = @{ url = "not-a-url" } | ConvertTo-Json
curl.exe -i -X POST "http://localhost:3000/urls" -H "Content-Type: application/json" -d $bad
```

Unexpected extra field:

```powershell
$extra = @{ url = "https://example.com"; extraField = "x" } | ConvertTo-Json
curl.exe -i -X POST "http://localhost:3000/urls" -H "Content-Type: application/json" -d $extra
```

Expected:

- Status `400` for both

## 6) Run automated tests

Stop the dev server first (`Ctrl + C` in the first terminal), then run:

### Unit tests

```powershell
npm test
```

### End-to-end tests

```powershell
npm run test:e2e
```

## 7) Run lint checks

```powershell
npm run lint
```

Optional auto-fix:

```powershell
npm run lint:fix
```

## 8) Quick demo checklist

- `npm install`
- `npm run start:dev`
- `GET /` returns `{ ok: true }`
- `POST /urls` returns `shortUrl`, `code`, `originalUrl`
- same URL returns same `code`
- `GET /:code` returns `302`
- invalid input returns `400`
- unknown code returns `404`
- `npm test` passes
- `npm run test:e2e` passes
