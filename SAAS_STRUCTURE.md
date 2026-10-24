# SAAS_STRUCTURE.md - Core Platform Architecture & Multi-Tenancy

This document specifies the core SaaS application architecture, domain routing system, middleware rewrites, onboarding lifecycles, and shared platform services.

---

## 1. System Topology & Multi-Tenancy Model

The platform operates as a unified Next.js 16 application with intelligent edge middleware routing.

```
Incoming Request (Host Header)
               │
               ▼
     [ Next.js Middleware ]
               │
   ┌───────────┴───────────────────────────────┐
   │                                           │
   ▼                                           ▼
[Root / SaaS Domain]                [Tenant Subdomain or Custom Domain]
(e.g., buildsaas.com)                (e.g., store.buildsaas.com or myrestaurant.com)
   │                                           │
   ├─ Marketing Landing (HOME_STYLE)           ├─ Database Tenant Lookup by domain/slug
   ├─ SaaS Auth (/login, /register)            ├─ Resolve site_type (Portfolio, Store, POS, Org)
   ├─ Onboarding Wizard                        └─ Rewrite to Internal Route:
   ├─ Superadmin Dashboard (/superadmin)            `/(storefront)/[tenantSlug]/...`
   └─ Tenant Admin Panel (/panel/[tenantId])
```

---

## 2. Directory Layout & App Router Structure

```
src/
├── app/
│   ├── (saas)/                         # SaaS Marketing & Global Pages
│   │   ├── page.js                     # Root Landing Page
│   │   ├── pricing/page.js             # Subscription Plans
│   │   ├── templates/page.js           # Showcase of 4 Site Types
│   │   ├── (auth)/
│   │   │   ├── login/page.js           # SaaS & Tenant Login
│   │   │   ├── register/page.js        # Onboarding / Signup
│   │   │   └── forgot-password/page.js
│   │   └── onboarding/                 # New Tenant Provisioning Wizard
│   │       └── page.js
│   │
│   ├── (admin)/superadmin/             # SaaS SuperAdmin Backoffice
│   │   ├── layout.js                   # Superadmin Navigation
│   │   ├── page.js                     # Platform KPIs & MRR
│   │   ├── tenants/page.js             # Manage All Tenants
│   │   ├── subscriptions/page.js       # Billing & Plans
│   │   ├── domains/page.js             # Custom Domain Approvals
│   │   └── audit-logs/page.js          # Platform Security Audit
│   │
│   ├── (tenant-panel)/panel/[tenantId]/# Unified Tenant Management Dashboard
│   │   ├── layout.js                   # Tenant Sidebar, Header & Module Switcher
│   │   ├── page.js                     # Tenant Dashboard Overview
│   │   ├── portfolio/                  # Portfolio Module (Projects, Inquiries)
│   │   ├── store/                      # Multi-Store E-Commerce (Catalog, Orders)
│   │   ├── pos/                        # Restaurant POS Terminal & Cashier
│   │   ├── kds/                        # Kitchen Display System
│   │   ├── org/                        # Team, Departments & Careers
│   │   └── settings/                   # Custom Domain, Theme, SEO, Billing
│   │
│   ├── (storefront)/[tenantSlug]/      # Public-Facing Tenant Websites
│   │   ├── layout.js                   # Dynamic Theme Provider & Layout
│   │   ├── page.js                     # Tenant Homepage (Renders by site_type)
│   │   ├── [slug]/page.js              # Dynamic Custom Pages
│   │   ├── products/                   # Storefront Product Catalog
│   │   ├── cart/ & checkout/           # E-Commerce Cart & Checkout
│   │   ├── menu/                       # Restaurant Menu & QR Ordering
│   │   ├── book-table/                 # Restaurant Table Booking
│   │   ├── projects/                   # Portfolio Project Detail
│   │   └── careers/                    # Org Job Openings & Application Form
│   │
│   └── api/                            # Backend API Handlers
│       ├── saas/                       # SaaS Core APIs (auth, plans, stripe/bKash webhooks)
│       ├── tenants/[tenantId]/         # Tenant-scoped CRUD APIs
│       ├── pos/                        # High-speed POS order processing & shifts
│       └── public/                     # Public storefront data endpoints
│
├── components/
│   ├── saas/                           # Marketing components (Hero, Bento, Pricing)
│   ├── panel/                          # Dashboard tables, forms, modals, Tiptap
│   ├── pos/                            # Touch terminal, cart drawer, thermal receipt
│   └── storefront/                     # Dynamic blocks (Hero, Gallery, Menu, Products)
│
├── lib/
│   ├── db.js                           # PostgreSQL connection pool with pg
│   ├── auth.js                         # JWT verification, password hashing, session cookies
│   ├── tenant.js                       # Tenant resolver, domain cache, quota checks
│   ├── cloudinary.js                   # Cloudinary asset uploads & folder partitioning
│   └── brevo.js                        # Brevo transactional email templates
│
└── middleware.js                       # Edge routing for subdomains and custom domains
```

---

## 3. Domain Resolution Middleware Workflow

The Next.js `middleware.js` performs the following steps on every incoming HTTP request:

1. **Extract Host**: Reads `req.headers.get('host')` (e.g., `acme.localhost:3000`, `acme.buildsaas.com`, or `acmebrand.com`).
2. **Detect SaaS Root**: If host matches the primary root domain (e.g., `buildsaas.com`, `localhost:3000`), bypass storefront rewrites and render SaaS marketing, auth, or `/panel`.
3. **Subdomain or Custom Domain Matching**:
   - Check in-memory / edge key-value cache or query PostgreSQL for active tenant with matching subdomain or verified custom domain.
   - If tenant is suspended or unpaid: rewrite to `/_errors/suspended`.
   - If found: rewrite URL internally to `/(storefront)/[tenantSlug]${pathname}`.
4. **Header Injection**: Inject `x-tenant-id`, `x-tenant-slug`, and `x-tenant-type` into request headers so Server Components access tenant context with zero extra database lookups.

---

## 4. Tenant Onboarding Lifecycle

When a new user registers on the SaaS platform:
1. **User Account Created**: Insert into `saas_users` with role `tenant_owner`.
2. **Website Type Selected**: User chooses from `portfolio`, `ecommerce`, `restaurant_pos`, or `organization` (or All-In-One Enterprise).
3. **Tenant Provisioned**:
   - Unique subdomain slug assigned and checked for uniqueness.
   - Insert row into `tenants` table.
   - Seed starter template data (starter categories, sample products/menu items, default theme colors).
4. **Subscription Assigned**: 14-day free trial or assigned to free starter tier.
5. **Immediate Redirect**: Directs user directly into `/panel/[tenantId]` with guided onboarding checklist.

---

## 5. Shared Core Services

### A. Authentication & Session Management
- Multi-tier tokens: Platform tokens vs Tenant tokens.
- Secure HTTP-only cookies containing signed JWT tokens with 7-day expiration.
- Invalidation mechanism using token versioning in database.

### B. Subscription & Quota Enforcement
- Every tenant query requiring write operations verifies tier limits:
  - Max products / menu items (e.g., 50 for Starter, Unlimited for Pro).
  - Max staff members / cashiers.
  - Custom domain capability (Pro / Enterprise only).
  - Storage consumption on Cloudinary.

### C. Payment Gateway Integrations
- Supports international payments (Stripe) and regional payment gateways (bKash, SSLCommerz).
- Webhook endpoints verify signatures, update `tenant_subscriptions` and `billing_invoices`, and trigger Brevo confirmation receipts.
