# PestFlow - Modern Pest Control Software

## Overview

PestFlow is a SaaS web application designed for pest control businesses. It provides an all-in-one solution for scheduling, dispatching, route optimization, invoicing, and business growth. The application follows a full-stack architecture with a React frontend and Express backend, using PostgreSQL for data persistence.

The product targets pest control business owners and technicians, offering features like AI agents, document management, review generation, customer portals, and mobile-friendly dashboards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter with hash-based routing (`useHashLocation`) for SPA navigation
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS v4 with custom theme variables, using shadcn/ui component library (New York style)
- **Animations**: Framer Motion for UI transitions
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful JSON APIs under `/api/*` routes
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Build**: esbuild for production bundling with selective dependency bundling for cold start optimization

### Database Design
- **Database**: PostgreSQL (connection via `DATABASE_URL` environment variable)
- **Schema Location**: `shared/schema.ts` - shared between frontend and backend
- **Tables**: 
  - `users` - Authentication and user management
  - `jobs` - Service jobs with customer info, addresses, scheduling, and geocoding
  - `routes` - Optimized route storage
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization

### Project Structure
```
client/           # React frontend application
  src/
    components/   # UI components (shadcn/ui based)
    pages/        # Route page components
    hooks/        # Custom React hooks
    lib/          # Utilities and constants
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Database access layer
  db.ts           # Database connection
shared/           # Shared code between client/server
  schema.ts       # Drizzle database schema
```

### Key Design Patterns
- **Shared Schema**: Database schemas defined once in `shared/` and used by both frontend (for type inference) and backend (for queries)
- **Storage Abstraction**: `IStorage` interface in `server/storage.ts` abstracts database operations
- **Path Aliases**: TypeScript path aliases (`@/`, `@shared/`, `@assets/`) for clean imports
- **Static Redirects**: HTML files in `client/public/` redirect to hash-routed equivalents for direct URL access

## External Dependencies

### Third-Party Services
- **Stripe**: Payment processing via hosted Checkout (redirects to stripe.com). Success URL returns to `/signup-success` page for conversion tracking
- **Meta Pixel/CAPI**: Facebook/Meta conversion tracking with both client-side pixel and server-side Conversions API support (`server/meta-capi.ts`)
- **PostHog**: Product analytics (configured in `client/index.html`)
- **Google Tag Manager**: Marketing tag management (GTM-K9NTD49F)
- **Google Ads**: Conversion tracking (AW-17886342638)
- **Hotjar/Contentsquare**: User experience analytics

### Database
- **PostgreSQL**: Primary database, connection string via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries with schema synchronization

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `META_PIXEL_ID` - Facebook Pixel ID (default: 876189468370955)
- `META_CAPI_ACCESS_TOKEN` - Meta Conversions API token (optional, for server-side events)
- `STRIPE_SECRET_KEY` - Stripe API key (if server-side Stripe integration added)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signature verification (if webhooks added)

### Key NPM Dependencies
- Frontend: React, TanStack Query, Framer Motion, Radix UI primitives, shadcn/ui components
- Backend: Express, Drizzle ORM, pg (PostgreSQL driver), Zod
- Shared: drizzle-zod for schema-to-validation bridge