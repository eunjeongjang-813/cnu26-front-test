# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a lecture/course repository with two independent projects:

- `week1-react/` — React + Vite SPA (CSR only, no TypeScript)
- `week2-nextjs/` — Next.js 16 App Router shopping mall (TypeScript, SSR/ISR)

Each project has its own `node_modules` and must be run independently.

## Commands

### week1-react (Vite + React)
```bash
cd week1-react
npm install
npm run dev      # dev server
npm run build    # production build
npm run preview  # preview build
```

### week2-nextjs (Next.js 16)
```bash
cd week2-nextjs
npm install
cp .env.local.example .env.local  # set BACKEND_URL
npm run dev      # dev server
npm run build    # production build
npm run lint     # ESLint
```

## week2-nextjs Architecture

### Request Flow
```
Browser → proxy.ts (auth guard) → App Router pages → lib/api.ts → Backend (localhost:8080)
```

### Auth Pattern
- JWT token stored in browser cookie (`token`, max-age 3600)
- **`proxy.ts`** (Next.js 16 equivalent of `middleware.ts`) guards `/shop`, `/cart`, `/orders`, `/login` — redirects unauthenticated users to `/login`, authenticated users away from `/login`
- Server Components read the token via `lib/auth-server.ts` → `cookies()` from `next/headers`
- Client Components cannot read the token directly; they call `/api/*` route handlers instead

### Server vs Client Components
- Pages under `app/` are Server Components by default (no `'use client'`)
- Components with interactivity (`useState`, event handlers) use `'use client'`
- `lib/api.ts` is used on both: server-side calls go directly to `BACKEND_URL`; client-side calls go to `/api/*` (proxied via `next.config.ts` rewrites to avoid CORS)

### Key Files
- `lib/api.ts` — all BE API call functions (`searchProducts`, `getMe`, `loginUser`, etc.)
- `lib/auth-server.ts` — server-only auth helpers (reads cookie, calls `getMe`)
- `lib/auth.ts` — older auth helper (kept for reference, superseded by `auth-server.ts`)
- `proxy.ts` — route protection middleware (Next.js 16 renamed from `middleware.ts`, exports `proxy` function instead of `middleware`)
- `app/api/orders/route.ts` — Route Handler proxying order API to backend
- `next.config.ts` — rewrites `/api/*` to backend, allows Naver image domains

### Environment Variables
- `BACKEND_URL` — backend server URL, server-side only (no `NEXT_PUBLIC_` prefix)
- Client-accessible vars must use `NEXT_PUBLIC_` prefix

### BE Integration Status
Several API calls currently return mock data pending backend implementation (marked with `/* 실제 BE 완성 후 아래 코드로 교체 */` comments): `getMyOrders` in `lib/api.ts`, order creation/listing in `app/api/orders/route.ts`.
