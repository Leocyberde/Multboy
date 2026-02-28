# MultBoy - Delivery & Freight Platform

## Overview
MultBoy is a Brazilian delivery and freight platform ("plataforma de delivery e frete inteligente") that connects clients, motoboys, and delivery opportunities. It features authentication, delivery/freight request management, a credit system, real-time notifications, and Google Maps integration.

## Architecture
- **Framework**: Express.js (backend) + Vite/React 19 (frontend)
- **Language**: TypeScript (full-stack)
- **Build Tool**: Vite 7 + esbuild
- **Package Manager**: pnpm
- **Database**: PostgreSQL (via Drizzle ORM + postgres.js driver)
- **API Layer**: tRPC v11 + TanStack React Query
- **Auth**: Custom JWT-based auth (jose) with bcryptjs password hashing
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix UI)
- **Routing**: Wouter

## Project Layout
```
client/          - React frontend (Vite root)
  src/
    App.tsx      - Main app with routing
    main.tsx     - Entry point
server/
  _core/         - Core server infrastructure (Express, tRPC, auth, Vite middleware)
  routers.ts     - tRPC router aggregation
  db.ts          - Database access layer
  storage.ts     - File storage utilities
shared/          - Types and constants shared between client and server
drizzle/         - Database schema, migrations, relations
```

## Development
- **Run**: `pnpm run dev` (starts Express server with Vite middleware on port 5000)
- **DB migrate**: `pnpm run db:push`
- **Build**: `pnpm run build`
- **Test**: `pnpm run test`

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (Replit managed)
- `JWT_SECRET` - Secret for signing JWT tokens
- `PORT` - Server port (set to 5000)

## Demo Credentials
- Admin: `gael` / `10203040`
- Client: `user1` / `password123`

## Deployment
- Target: autoscale
- Build: `pnpm run build`
- Run: `node dist/index.js`
