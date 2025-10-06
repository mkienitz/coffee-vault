# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Coffee Vault NG is a SvelteKit application for tracking coffee inventory, doses, and brewing. It uses a physical dose storage system with drawers (A-K) and tubes (1-8) to organize pre-measured coffee doses.

## General rules and preferences

- Use Svelte 5 runes and no deprecated Svelte 4 syntax
- When dealing with markup, ensure it works on phones, tablets and big screens
- You can find additional information on DaisyUI using the MCP context7
- You can find additional information on SvelteKit using the MCP svelte

## Core Architecture

### Database Layer (Drizzle ORM + SQLite)

- **Database**: SQLite with libsql client
- **ORM**: Drizzle ORM with schema-first approach
- **Location**: Database file path configured via `COFFEE_VAULT_DB_PATH` env var
- **Schema**: `src/lib/server/db/schema.ts` defines three main tables:
  - `coffees`: Coffee inventory with metadata (roaster, origin, process, etc.)
  - `doses`: Physical dose storage locations (drawer/tube combinations)
  - `brews`: Consumption tracking when doses are consumed
- **Database functions**: `src/lib/server/db/index.ts` contains all database operations

### Key Domain Concepts

- **Coffee**: Represents a bag/batch of coffee with weight tracking
- **Dose**: Pre-measured coffee portions stored in physical locations (drawer + tube)
- **Brew**: Records of consumed doses with consumption date and weight
- **Physical Storage**: 11 drawers (A-K) × 8 tubes each = 88 total dose slots

### Form Handling & Validation

- **Superforms**: Used for form handling with server-side validation
- **Zod schemas**: `src/lib/zod-schemas.ts` defines all validation schemas
- **Flash messages**: User feedback via sveltekit-flash-message and svelte-french-toast

### UI Components

- **Styling**: TailwindCSS with DaisyUI components

## Common Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run check           # Type checking with svelte-check
npm run check:watch     # Type checking in watch mode
npm run lint            # ESLint + Prettier checking
npm run format          # Auto-format with Prettier

# Database
npx drizzle-kit generate    # Generate migration files
npx drizzle-kit migrate     # Run migrations
npx drizzle-kit studio     # Open Drizzle Studio (database GUI)
```

## Environment Configuration

Required environment variable:

- `COFFEE_VAULT_DB_PATH`: Path to SQLite database file

## Key File Patterns

### Route Structure

- `/coffees` - Coffee inventory management
- `/doses` - Dose management
- `/brews` - Brewing history
- API routes in `/api/` for external integrations

### Server-side Pages

All routes use `+page.server.ts` files for:

- Database operations via Drizzle
- Form actions with Superforms
- Server-side validation with Zod schemas

### Component Organization

- Page-specific components alongside route files
- Reusable UI components in `src/lib/components/ui/`
- Business logic components in `src/lib/components/`

## Development Notes

- Database schema changes require migration generation via `drizzle-kit generate`
- All forms use Superforms with Zod validation
- Physical dose management uses drawer/tube coordinate system
- Coffee weight tracking accounts for doses and brews to show remaining coffee
- NFC tags storing an URL to /doses/\[doseId\] are used for dose identification in the physical system
