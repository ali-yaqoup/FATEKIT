# FATEKIT — Project Brief for the Antigravity Agent

You are building **FATEKIT**, a production-ready Arabic-RTL luxury makeup e-commerce site for the Palestinian market, plus its private admin dashboard, as one connected Next.js application.

Read the following files in this project folder before writing any code:
- `DESIGN.md` — the visual design system ("Monolith Luxe"): colors, typography, spacing, component rules. Follow it exactly. Do not introduce generic SaaS/Bootstrap/Material styling.
- `prisma/schema.prisma` — the full data model. Do not redesign the schema; extend it only if something is genuinely missing.
- `/stitch-reference/*.png` — approved UI reference screenshots for every page (store + admin). Match these layouts closely; they are the source of truth for visual structure, not just inspiration.

---

## 1. Non-negotiable constraints

- **Currency:** every price anywhere in the app (store, admin, seed data) is in **Israeli Shekel (₪)**. Never use SAR, USD, AED, or any other currency symbol.
- **Payment:** cash-on-delivery is the **only** payment method. Do not build a payment gateway integration, card form, or Apple Pay/online-payment UI anywhere — not in checkout, not in settings, not in the data model beyond a fixed `"COD"` label.
- **Language:** the entire app is Arabic and RTL (`dir="rtl"`, `lang="ar"`), including the admin dashboard. No English UI text except code/variable names.
- **Design system:** black (#000000) / white (#FBF9F9) / champagne accent (#F5E6DA) only. Playfair Display for headings, IBM Plex Sans Arabic for UI text. Sharp/minimal corners, thin 1px borders, no heavy shadows, no bright status colors (red/green/blue) — use black, outline, and champagne variants for status chips instead.
- **Historical integrity:** deleting a product must be a **soft delete** (`isArchived = true`), never a hard delete — past orders must keep showing the product name/price as it was via the `OrderItem` snapshot fields, even after the live product changes or is archived.
- **Category → Subcategory dependent UX:** in Add/Edit Product, the "التصنيف الفرعي" select must populate dynamically based on the selected "التصنيف الرئيسي" (client-side filtering of subcategories where `parentId === selectedCategoryId`). This is the most important UX relationship in the whole system — don't simplify it into a single flat category dropdown.
- **Variant-aware inventory:** if a product has one or more `ProductVariant` rows, stock is tracked **per variant**, not on the product's own `quantity` field. The product-level `quantity` field is only used when there are zero variants.

---

## 2. Tech stack

- **Framework:** Next.js 15 (App Router), TypeScript, React Server Components where sensible, Server Actions for mutations.
- **Styling:** Tailwind CSS (the Stitch reference HTML is already Tailwind-based — port classes directly where possible, adjusting to the design tokens in `DESIGN.md`).
- **Database:** PostgreSQL via Prisma ORM (see `prisma/schema.prisma`). Hosted on Supabase.
- **Auth:** Supabase Auth, admin-only (email/password) for `/admin/**`. No customer accounts needed for v1 — checkout is guest checkout that creates/updates a `Customer` row by phone number.
- **File storage:** Supabase Storage for product images, category images, variant swat=== images, homepage content images.
- **Deployment target:** Vercel (structure the app so it deploys cleanly there — no server-only assumptions that break on serverless).

---

## 3. Project structure

```
/app
  /(store)/
    page.tsx                     → الرئيسية (homepage)
    /shop/page.tsx                 → قائمة المنتجات/التصنيف
    /shop/[categorySlug]/page.tsx
    /product/[slug]/page.tsx       → تفاصيل المنتج
    /cart/page.tsx
    /checkout/page.tsx
    layout.tsx                     → black header + category nav, RTL
  /admin/
    layout.tsx                     → black sidebar shell (see §5), protected by Supabase auth
    page.tsx                       → لوحة القيادة
    /orders/page.tsx
    /orders/[id]/page.tsx          → تفاصيل الطلب
    /products/page.tsx
    /products/new/page.tsx
    /products/[id]/edit/page.tsx
    /categories/page.tsx
    /customers/page.tsx
    /customers/[id]/page.tsx
    /inventory/page.tsx
    /coupons/page.tsx
    /reports/page.tsx
    /settings/page.tsx
    /homepage/page.tsx             → إدارة الصفحة الرئيسية
    /login/page.tsx
/lib
  /db.ts                           → Prisma client singleton
  /supabase.ts                     → Supabase client (browser + server)
  /actions/                        → server actions grouped by domain (products.ts, orders.ts, categories.ts, ...)
  /validators/                     → zod schemas for form input validation
/components
  /store/                          → storefront components
  /admin/                          → admin components (Sidebar, StatusChip, DataTable, KpiCard, etc.)
  /ui/                              → shared primitives (Button, Select, Toggle, Input) styled per DESIGN.md
/prisma
  schema.prisma
  seed.ts                          → seed script: real categories/subcategories, ~15 demo products with variants, a few demo orders/customers, one admin user
```

---

## 4. Core business logic to implement correctly

1. **Order status → inventory**: when an admin changes an order's status via a server action, do NOT decrement stock on every status change. Decrement stock **once**, at order creation time (when checkout completes), inside a Prisma transaction that also creates the `Order` + `OrderItem` rows and decrements `ProductVariant.quantity` (or `Product.quantity` if no variant). If the order is later cancelled (`CANCELLED`), restock the decremented quantities back.
2. **Stock status derivation**: don't store a separate "متوفر / مخزون منخفض / نفد المخزون" field — derive it from `quantity` at render time (e.g. `0` → نفد المخزون, `<= 5` → مخزون منخفض, else → متوفر). Make the low-stock threshold a small constant, easy to change later.
3. **Customer upsert on checkout**: match by `phone`. If a customer with that phone exists, update their info and increment `ordersCount`/`totalSpent`/`lastOrderAt`; otherwise create a new `Customer`.
4. **Coupon validation**: on checkout, validate the entered code against `isActive`, date range, `minOrderAmount`, and `usageLimit` vs `usageCount` before applying the discount; increment `usageCount` on successful order creation.
5. **Category deactivation**: an inactive `Category` (or subcategory) must disappear from all storefront category/nav queries but must NOT cascade-hide or delete its products — those products simply become harder to browse to until the category is reactivated (they're still directly reachable via `/product/[slug]`).
6. **Homepage content**: the `/(store)` homepage reads from the singleton `HomepageContent` row (and `FeaturedCategory`/`InstagramImage`) rather than hardcoded JSX, so edits made in `/admin/homepage` reflect immediately. "وصل حديثاً" and "الأكثر مبيعاً" sections query `Product` by `isNew`/`isBestseller` flags — they are NOT part of `HomepageContent`.

---

## 5. Admin shell (apply to every `/admin/**` page, no exceptions)

Fixed black sidebar, right-aligned (RTL), containing in this exact order:
`لوحة القيادة` · `الطلبات` · `المنتجات` · `إدارة الصفحة الرئيسية` · `إدارة التصنيفات` · `العملاء` · `المخزون` · `العروض والكوبونات` · `التقارير` · `الإعدادات`, with `حسابي` / `تسجيل الخروج` pinned at the bottom.

Top bar: page title, search, notification bell, admin avatar, and an outlined "عرض المتجر" link to `/` opening in a new tab.

This shell must be a single shared `AdminLayout`/`Sidebar` component — never re-implemented per page (this was the #1 consistency bug in the earlier design pass; don't repeat it).

---

## 6. Build order (do this incrementally, verify each phase before moving on)

1. **Scaffold**: Next.js + TypeScript + Tailwind config matching `DESIGN.md` tokens (colors, fonts as CSS variables/Tailwind theme extension). Set up Prisma + Supabase connection. Run initial migration from `schema.prisma`.
2. **Seed data**: write and run `prisma/seed.ts` with realistic categories/subcategories, ~15 products (some with variants, some without), a few customers and orders in different statuses, one admin user.
3. **Admin auth**: `/admin/login` + middleware protecting `/admin/**`.
4. **Admin shell + Dashboard**: build the shared sidebar/layout first, then the KPI dashboard reading real aggregate queries (total sales, order count, customer count, product count, low-stock list).
5. **Categories management**: full CRUD + parent/child tree UI, reorder, activate/deactivate.
6. **Products**: list with working filters, Add/Edit Product with the dependent category→subcategory selects and variant rows, soft-delete confirmation.
7. **Orders**: list with status tabs + filters, order detail page with the timeline and status-update server action wired to the inventory-decrement/restock logic.
8. **Customers, Inventory, Coupons, Reports, Settings, Homepage content**: build in that order.
9. **Storefront**: homepage (reading `HomepageContent`), shop/category listing, product detail (with variant selector wired to real stock), cart (client state, e.g. Zustand or React context), checkout (creates the order transactionally, guest customer upsert, coupon validation, COD-only confirmation).
10. **Polish pass**: empty states, confirmation dialogs, responsive/mobile behavior, loading states.

After each numbered phase, run the app locally and visually confirm it against the matching Stitch reference screenshot before moving to the next phase.
