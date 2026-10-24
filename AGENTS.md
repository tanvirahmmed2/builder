# AGENTS.md - Multi-Type Website Builder SaaS

This document defines core instructions, architectural standards, constraints, and conventions for AI agents (Antigravity, Gemini, Codex, Claude, etc.) operating in this repository.

---

## 1. Project Overview

This repository is a **Multi-Type Website Builder SaaS platform** capable of provisioning, hosting, and managing four distinct website types:
1. **Portfolio Websites**: Personal and agency showcases, project galleries, case studies, skills, services, and lead capture.
2. **Multi-Store E-Commerce**: Storefronts, nested categories, product variants (SKU, size, color), shopping cart, multi-branch inventory, checkout, coupons, and orders.
3. **Restaurant & POS (Point of Sale)**: Digital food menus, modifiers/addons, table reservation, QR ordering, cashier POS interface (fast touch checkout, split bill, thermal receipt format), and real-time Kitchen Display System (KDS).
4. **Organization / Team Management**: Company portals, staff directories, departments, organizational hierarchy, internal announcements, job listings & candidate pipeline.

### Core Architecture Layers
- **Core SaaS Layer**: Landing page, pricing, auth, onboarding wizard, tenant provisioning, custom domain DNS/SSL validation, subscription billing, superadmin control center.
- **Tenant Admin Panel (`/panel/[tenantId]`)**: Role-governed control panel that dynamically mounts modules depending on the tenant's chosen website type(s).
- **Tenant Public Frontend Engine (`/[tenantDomain]` or subdomain)**: Dynamic SSR/SSG storefronts and websites rendered via Next.js 16 App Router.

---

## 2. Technology Stack & Dependencies

- **Framework**: Next.js 16 (App Router, Server & Client Components)
- **Runtime & UI**: React 19, JavaScript (ESM) / JSX
- **Styling**: Tailwind CSS v4, PostCSS, Framer Motion
- **Database**: PostgreSQL with direct `pg` connection pooling
- **Authentication**: JWT (`jsonwebtoken`) + `bcryptjs` password hashing + HTTP-only cookies
- **Rich Text Editing**: Tiptap Editor (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/pm`)
- **Media Storage**: Cloudinary SDK (organized in tenant-partitioned folders)
- **Transactional Email**: Brevo (`@getbrevo/brevo`)
- **Icons & Utilities**: `react-icons`, `slugify`, `axios`

---

## 3. Agent Golden Rules & Invariants

All agents interacting with this codebase MUST strictly follow these rules:

### A. Multi-Tenant Data Isolation (CRITICAL)
- **NEVER** write or execute a database query on tenant-scoped data without an explicit `tenant_id = $x` filter.
- Cross-tenant data leakage is a catastrophic severity defect. Every API route under tenant scope must resolve the authenticated tenant context and bind queries to that `tenant_id`.
- Ensure all foreign keys referencing tenant tables cascade or protect accurately within the tenant boundary.

### B. Security & Input Sanitization
- **NEVER** use raw string interpolation in SQL queries. Always use parameterized queries (`pg` parameters `$1, $2, ...`).
- Sanitize rich text HTML generated from Tiptap prior to saving or rendering to eliminate XSS vectors.
- Secure HTTP-only cookies for JWT session tokens with `SameSite=Lax` and `Secure=true` in production.
- Strictly validate user roles using RBAC middleware before allowing mutations in the tenant dashboard or POS terminal.

### C. Design & Aesthetic Standards
- Follow modern, sleek, high-conversion visual design standards:
  - SaaS Home: Curated dark palette, glassmorphism, subtle gradients, framer-motion micro-interactions (see [HOME_STYLE.md](file:///d:/code/portfoliobuilder/HOME_STYLE.md)).
  - Admin & POS Panel: High-density, accessible, responsive, slate/zinc surfaces, clear status badges, keyboard shortcuts, touch-friendly POS buttons (see [PANEL_STYLE.md](file:///d:/code/portfoliobuilder/PANEL_STYLE.md)).
- Do not use raw browser defaults for form controls or alerts. Use polished UI components with loading and error states.

### D. Architectural File Separation
Refer to the dedicated specification documents for deep architectural guidelines:
- [PANEL_STYLE.md](file:///d:/code/portfoliobuilder/PANEL_STYLE.md): Admin panel & POS styling, layout tokens, and UI components.
- [HOME_STYLE.md](file:///d:/code/portfoliobuilder/HOME_STYLE.md): Landing page design system, conversion funnels, and animations.
- [SAAS_STRUCTURE.md](file:///d:/code/portfoliobuilder/SAAS_STRUCTURE.md): SaaS application architecture, domain routing, and middleware.
- [SAAS_DB_STRUCTURE.md](file:///d:/code/portfoliobuilder/SAAS_DB_STRUCTURE.md): Platform-level database schema and relationships.
- [TENANT_STRUCTURE.md](file:///d:/code/portfoliobuilder/TENANT_STRUCTURE.md): Tenant module logic (Portfolio, E-Commerce, Restaurant POS, Org).
- [TENANT_DB_STRUCTURE.md](file:///d:/code/portfoliobuilder/TENANT_DB_STRUCTURE.md): Tenant data models, SQL tables, and indexes.
- [SECURITY.md](file:///d:/code/portfoliobuilder/SECURITY.md): Multi-tenant isolation, RBAC, API protection, and audit logs.
- [ENTERPRISE_QUALITY.md](file:///d:/code/portfoliobuilder/ENTERPRISE_QUALITY.md): Scalability, caching, POS offline sync, and reliability.
- [my-skill/SKILL.md](file:///d:/code/portfoliobuilder/my-skill/SKILL.md): Antigravity automation workflows and operational runbooks.

---

## 4. Key Directories & Project Structure

```
d:/code/portfoliobuilder/
├── AGENTS.md                  # This file: Core agent guidelines & rules
├── PANEL_STYLE.md             # Tenant Admin & POS UI design specifications
├── HOME_STYLE.md              # SaaS Marketing landing page design system
├── SAAS_STRUCTURE.md          # Multi-tenant routing & platform architecture
├── SAAS_DB_STRUCTURE.md       # Master database schemas and tables
├── TENANT_STRUCTURE.md        # Tenant modules: Portfolio, Store, Restaurant POS, Org
├── TENANT_DB_STRUCTURE.md     # Tenant database tables and relational schemas
├── SECURITY.md                # Security policy, isolation rules, and RBAC matrix
├── ENTERPRISE_QUALITY.md      # Performance, offline POS sync, SLA, and caching
├── my-skill/                  # Antigravity skill package
│   ├── SKILL.md               # Skill metadata and step-by-step procedures
│   ├── scripts/               # Validation and tenant seeding scripts
│   ├── examples/              # Routing, POS orders, and multi-store configs
│   └── resources/             # Starter SQL schemas and capability matrices
├── postgresql/                # Database migration scripts and PSQL files
│   ├── schema.psql            # Platform & SaaS tables
│   └── website_tables.psql    # Tenant website tables
├── src/
│   ├── app/                   # Next.js App Router (SaaS, Admin, Tenant Sites)
│   ├── components/            # Reusable UI, dashboard, and storefront widgets
│   ├── lib/                   # Database pool, auth helpers, Cloudinary, Brevo
│   └── middleware.js          # Subdomain and custom domain tenant resolver
└── scratch/                   # Verification and test scripts
```

---

## 5. Coding Conventions for Agents

1. **Next.js App Router**:
   - Default to Server Components (`RSC`) for data fetching directly from PostgreSQL.
   - Use Client Components (`"use client"`) only for interactive UI (e.g., POS terminal, builder drag-and-drop, stateful forms).
   - Server Actions or API Route Handlers (`/api/.../route.js`) must validate request headers, tenant context, and schema payloads.
2. **Database Queries**:
   - Always acquire connection from the pool (`import { pool } from '@/lib/db'`).
   - Use transactions (`BEGIN ... COMMIT / ROLLBACK`) whenever mutating multiple related tables (e.g., POS order + order items + stock decrement).
3. **Environment Variables**:
   - Do not hardcode secrets or URLs. Use `process.env.DATABASE_URL`, `process.env.JWT_SECRET`, `process.env.CLOUDINARY_URL`, etc.
4. **Error Handling**:
   - Return structured JSON responses for API routes: `{ success: boolean, data?: any, error?: string, message?: string }`.
   - Never expose raw database stack traces or SQL syntax errors to clients.
