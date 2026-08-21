# Kelly's Cake Project - Agent Guidelines

## Project Overview
- **Type**: Custom cake e-commerce platform
- **Framework**: Next.js 16.2.9 (App Router)
- **Backend**: Supabase (Auth, RLS, Storage)
- **UI**: TailwindCSS v4, shadcn-ui, Framer Motion, sonner
- **State**: Zustand (cart), React Hook Form + Zod validations
- **Architecture**: Feature-based (admin, products, cart, checkout, catering, orders, etc.)

## Key Directories
- `app/` - Next.js App Router pages and layouts
- `features/` - Feature-based modules (admin, auth, cart, catalogs, catering, checkout, orders, products, media, cotizaciones)
- `components/` - Shared UI components
- `lib/supabase/` - Supabase clients (browser, server, admin)

## Available Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - ESLint

## Conventions
- Feature modules in `features/` contain: `actions/`, `components/`, `queries/`, `repositories/`, `services/`, `types/`, `utils/`, `validations/`
- Protected routes via Supabase RLS + `getCurrentAdmin()` / `getCurrentUser()`
- No custom middleware - auth handled server-side
- TailwindCSS v4 config in `postcss.config.mjs`
- TypeScript strict mode configured

## Adding "Add to Cart" to Product Lists
When adding "Add to cart" buttons to product listings (like `ProductosAccordion`):
1. Import `AddToCartButton` from ` "@/features/cart/components/AddToCartButton"`
2. Render conditionally: `{product.precio != null && <AddToCartButton productoId={product.id} />}`
3. The product type must have `id: string` and `precio: number | null`
4. Reuses existing cart state and Supabase tables (`carrito`, `carrito_items`)