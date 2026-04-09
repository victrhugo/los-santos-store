# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the Los Santos e-commerce app and shared backend services.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **E-commerce frontend**: Next.js 15 (App Router) + Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **API framework**: Express 5
- **Build**: esbuild (CJS bundle)

## Projects

### Los Santos (`artifacts/los-santos/`)
Next.js e-commerce store for clothing, accessories, and perfumes.
- Runs on port 3000
- Dev command: `pnpm --filter @workspace/los-santos run dev`
- Uses Supabase for products, variants, orders, and order_items tables

### API Server (`artifacts/api-server/`)
Shared Express API server running on port 8080.

## Key Commands

- `pnpm --filter @workspace/los-santos run dev` — run the e-commerce store
- `pnpm --filter @workspace/los-santos run build` — build for production
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm run typecheck` — full typecheck across all packages

## Supabase Schema Expected

Tables needed in Supabase:
- `products`: id, name, description, price, image_url, category, created_at
- `product_variants`: id, product_id, name, price, stock, created_at
- `orders`: id, customer_name, customer_phone, delivery_type, total, status, created_at
- `order_items`: id, order_id, product_id, variant_id, quantity, price, created_at

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
