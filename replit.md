# SkySearch — 机票搜索网站

A full-stack flight search website that queries real-time flight prices from the city.travel SOAP API.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/flight-search run dev` — run the frontend (requires PORT + BASE_PATH env vars, handled by Replit workflows)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- No database required — all data comes from the city.travel SOAP API

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS + shadcn/ui
- API: Express 5
- Validation: Zod (`zod/v4`) + Orval codegen
- External data: city.travel SOAP API (AeroSearch)
- Build: esbuild (API), Vite (frontend)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/` — generated React Query hooks
- `lib/api-zod/` — generated Zod validation schemas
- `artifacts/flight-search/` — React + Vite frontend
- `artifacts/api-server/src/routes/flights.ts` — SOAP proxy route
- `artifacts/api-server/src/routes/airports.ts` — static airport database (50+ airports)
- `api/index.ts` — Vercel serverless function wrapper
- `vercel.json` — Vercel deployment configuration

## Architecture decisions

- The backend proxies SOAP requests to `https://apisrv.city.travel/SiteCity` — the API requires no database
- XML namespace prefixes (`a:`, `b:`, `s:`) are stripped using `removeNSPrefix: true` in fast-xml-parser
- The real SOAP response structure: `FlightData.FlightData[]` → each item has `Offers.OfferInfo` → `Segments.OfferSegment`
- Currency is CNY; User-Agent must match the real app to avoid being blocked
- Vercel deployment: frontend as static site, backend as a Node.js serverless function at `/api`

## Deploying to Vercel via GitHub

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import Git Repository
3. Vercel will auto-detect `vercel.json` — no extra config needed
4. Click Deploy

The `vercel.json` at the repo root handles everything:
- Builds the Vite frontend → serves as static files
- Routes `/api/*` to the Express serverless function in `api/index.ts`
- Handles SPA routing (all other paths → `index.html`)

## Gotchas

- The SOAP request must use `Currency: CNY` and the real app's User-Agent or the server may reject it
- `fast-xml-parser` with `removeNSPrefix: true` is required — without it, all field names have namespace prefixes and are inaccessible
- The real response path is `result.FlightData.FlightData[]` (double-nested), NOT `result.FlightData[]`
- `PORT` is not required during `vite build` — the config guards it with `isBuild` check

## User preferences

- Wants to deploy to Vercel via GitHub
- Prefers Chinese (CNY) currency for flight prices
