# ENTERPRISE_QUALITY.md - Scalability, Performance & Reliability Standards

This document establishes engineering benchmarks, high-availability architecture, offline-first POS synchronization, and enterprise quality assurance protocols.

---

## 1. High Availability & Database Scalability

To support thousands of concurrent tenants, multi-store checkouts, and real-time restaurant POS transactions, the system adheres to the following infrastructure topology:

```
[ Cloudflare / CDN Edge ] ---> [ Next.js App Cluster (Stateless) ]
                                            │
                                            ▼
                               [ PgBouncer Connection Pooler ]
                                            │
                             ┌──────────────┴──────────────┐
                             ▼                             ▼
                 [ Primary Postgres (Writes) ]   [ Read Replica (Reads) ]
```

### Database Performance Tuning
- **Connection Pooling**: Managed via `pg.Pool` or PgBouncer with transaction-level pooling.
  - Max pool size per instance: 20 connections.
  - Idle timeout: 30,000ms.
  - Query statement timeout: 5,000ms on OLTP queries.
- **Read/Write Splitting**: Public storefront product catalogs, restaurant menus, and portfolio pages route read queries to Read Replicas, leaving the Primary database dedicated to POS checkout and admin mutations.

---

## 2. Storefront Performance & Edge Caching (ISR)

Tenant public websites must achieve Google Lighthouse scores > 95:
- **Incremental Static Regeneration (ISR)**: Public storefront pages use `revalidate = 60` or tag-based revalidation (`revalidateTag('tenant-products')`).
- **Image Optimization**: Cloudinary CDN transforms images on the fly with format `f_auto,q_auto`, responsive widths, and WebP/AVIF delivery.
- **Font Optimization**: Google Fonts are loaded using `next/font/google` with zero layout shift (`font-display: swap`).

---

## 3. POS Offline-First Architecture & Sync Protocol

Cashiers must be able to continue ringing up orders during internet outages:

```
[ POS Cashier Action ] ──► [ Local State & IndexedDB Queue ]
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │ Online?                                       │ Offline?
                 ▼                                               ▼
     [ Immediate POST /api/pos ]                   [ Persist Order in IndexedDB ]
                 │                                               │
                 │                                               ▼
                 │                                   [ Show "Queued Orders: N" ]
                 │                                               │
                 │                                               ▼ (When Online Event Fires)
                 └────────────────◄────────────────── [ Auto-Drain Queue & Replay ]
```

### Sync & Conflict Resolution Rules
1. **Local Unique Order Identifier**: Every offline order generates a client-side UUID (`client_order_token`).
2. **Idempotent Order Creation**: The `/api/pos/orders` endpoint accepts `client_order_token` and executes with `ON CONFLICT (tenant_id, client_order_token) DO NOTHING`.
3. **Queue Replay**: When the `window.addEventListener('online')` triggers, the background worker processes queued orders sequentially, validates totals, and prints confirmation tickets.

---

## 4. Kitchen Display System (KDS) Real-Time Architecture

The Kitchen Display System requires sub-second latency from order placement to screen appearance:
- **Transport**: Server-Sent Events (SSE) or Lightweight WebSockets (`/api/tenants/[tenantId]/kds/stream`).
- **Heartbeat**: 25-second keep-alive ping to detect broken connections and automatically reconnect within 2 seconds.
- **Audio Signaling**: Integrated Web Audio API chime sounds when an order arrives with status `pending`.

---

## 5. Zero-Downtime Database Migration Protocols

All schema updates must adhere to backwards-compatible migration steps:
1. **Additive Changes First**: Add new columns with `NULL` or default values. Never drop or rename active columns in the same release.
2. **Dual-Writing Period**: Code writes to both old and new structures while migrating historical data in batches.
3. **Deprecation & Cleanup**: After all application instances are on the latest release, decommission old columns in a subsequent migration.

---

## 6. Observability, Logging & Health Checks

- **Health Endpoint**: `/api/health` returns status of Next.js runtime, PostgreSQL connectivity, and Redis/cache health:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-25T05:43:00Z",
    "database": "connected",
    "pool": { "total": 10, "idle": 8, "waiting": 0 }
  }
  ```
- **Structured JSON Logging**: Every error log outputs correlation ID, timestamp, tenant ID, user ID, and sanitized stack trace.
- **Sentry Integration**: Captured uncaught exceptions tagged with `tenant_id` and `site_type` for rapid triaging.

---

## 7. Testing Strategy & Quality Gates

| Test Layer | Framework / Tool | Scope | Target Coverage |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | Vitest / Jest | Calculations (taxes, discounts, shift variance) | > 85% |
| **Tenant Isolation Tests** | Jest + Test DB | Asserting no query can access another tenant's rows | 100% Critical |
| **E2E Integration** | Playwright | Full POS flow: Open Shift → Add Items → Pay → Receipt | Critical Paths |
| **Lint & Format** | ESLint + Prettier | Code quality and import validation | 0 warnings |
