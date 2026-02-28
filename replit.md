# MultBoy - Delivery & Freight Platform

## Overview
MultBoy is a delivery and freight platform (delivery e frete) that connects clients, motoboys, and admins. Built with a full-stack TypeScript setup using React + Express + tRPC.

## Architecture

### Stack
- **Frontend**: React 19, Vite, TailwindCSS v4, shadcn/ui components, wouter (routing), TanStack Query
- **Backend**: Express.js + tRPC, Node.js with tsx
- **Database**: PostgreSQL (Drizzle ORM with `postgres` driver)
- **Auth**: JWT-based session auth (bcryptjs for password hashing, jose for JWT)
- **Package Manager**: pnpm

### Project Structure
```
client/         - React frontend (Vite)
  src/
    components/ - UI components
    pages/      - Page components
    contexts/   - React contexts
    hooks/      - Custom hooks
    lib/        - Utilities
server/         - Express backend
  _core/        - Core framework (auth, trpc, vite dev server, etc.)
  db.ts         - Database queries (PostgreSQL via drizzle-orm/postgres-js)
  routers.ts    - tRPC routers
  storage.ts    - Storage utilities
shared/         - Shared types between client and server
drizzle/        - Database schema and migrations
```

### Key Features
- Delivery and freight request system (Delivery & Frete)
- Admin panel for managing requests and users
- Credit balance system (purchase and debit)
- Google Maps integration for location selection
- Real-time notifications
- JWT session authentication

### Database Schema (PostgreSQL)
- `users` - User accounts with roles (user/admin), credit balance
- `requests` - Delivery/freight requests with status tracking
- `creditTransactions` - Credit purchase and debit history

## Development

### Running the App
```
PORT=5000 pnpm dev
```
This starts a single Express server that:
1. Serves the tRPC API at `/api/trpc`
2. Handles auth at `/api/auth/*`
3. Serves the React frontend via Vite middleware (dev) or static files (prod)

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-provisioned by Replit)
- `JWT_SECRET` - Secret for JWT token signing (set in Replit secrets)
- `PORT` - Server port (set to 5000)

### Database Migrations
```
pnpm db:push   # Generate and apply migrations
```

## Deployment
- Target: autoscale
- Build: `pnpm run build`
- Run: `node dist/index.js`
