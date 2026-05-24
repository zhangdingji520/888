# SkySearch — 机票搜索

Flight search app that lets users find domestic and international flights. Searches the city.travel SOAP service and displays results with pricing, duration, and flight details.

## Run & Operate

- Workflows start automatically: `artifacts/flight-search: web` (frontend) and `artifacts/api-server: API Server` (backend)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + wouter (routing)
- UI: shadcn/ui components with custom sky-blue theme
- API: Express 5 + OpenAPI spec + Orval codegen
- Validation: Zod (`zod/v4`)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/flight-search/` — React + Vite frontend
- `artifacts/flight-search/src/pages/home.tsx` — main search page
- `artifacts/flight-search/src/components/search/` — search form components
- `artifacts/flight-search/src/components/results/` — flight results components
- `artifacts/api-server/src/routes/flights.ts` — SOAP proxy for flight search
- `artifacts/api-server/src/routes/airports.ts` — airport data + search
- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/` — generated React Query hooks
- `lib/api-zod/` — generated Zod validation schemas

## Architecture decisions

- Proxies city.travel SOAP service through Express so credentials stay server-side
- No database — airport data is in-memory, flights come live from SOAP API
- OpenAPI-first: spec gates codegen which drives both frontend hooks and backend validation
- `fast-xml-parser` parses SOAP XML responses with namespace stripping

## Product

- One-way and round-trip flight search
- Airport autocomplete with popular airports and search-as-you-type
- Results show price (CNY), airline, stops, duration, and baggage info
- Supports Economy / Business / First class selection

## Gotchas

- Flight search calls city.travel SOAP service (external); may be slow or fail in some regions
- `fast-xml-parser` must be a `dependency` (not devDependency) in `artifacts/api-server/package.json`
- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
