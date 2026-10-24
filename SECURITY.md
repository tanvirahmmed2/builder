# SECURITY.md - Multi-Tenant Security & Compliance Standards

This document establishes the mandatory security controls, data isolation guarantees, authentication architecture, and threat mitigation strategies for the Multi-Type Website Builder SaaS platform.

---

## 1. Multi-Tenant Data Isolation (Zero Cross-Tenant Leakage)

Multi-tenant isolation is the highest priority security boundary. The system enforces defense-in-depth across three tiers:

```
[ Request Layer ]      Next.js Middleware validates domain/subdomain -> Injects x-tenant-id
       │
[ Controller Layer ]   API Route Handler asserts Authenticated User belongs to x-tenant-id
       │
[ Database Layer ]     All queries bind WHERE tenant_id = $1 (Prepared Statement)
```

### Inviolable Data Access Rules
1. **Never perform unpartitioned queries**: All queries touching tenant-specific tables must explicitly include `WHERE tenant_id = $x` in the prepared statement.
2. **Never trust client-supplied tenant identifiers**: Do not rely on query parameters or JSON body fields for `tenant_id`. Always derive `tenant_id` from the cryptographically verified JWT session or verified domain lookup.
3. **Foreign Key Integrity**: All tenant-scoped tables must use `REFERENCES tenants(id) ON DELETE CASCADE`.

---

## 2. Authentication & Credential Security

### Password Management
- All user passwords must be hashed using `bcryptjs` with a work factor of **12 salt rounds**.
- Passwords must meet minimum entropy criteria:
  - Minimum 8 characters.
  - At least 1 uppercase letter, 1 number, and 1 special character.
- Raw passwords must never appear in log files or be returned in API payloads.

### Token & Session Security
- Authentication tokens are signed using `jsonwebtoken` (JWT) with HMAC SHA-256 using a high-entropy secret (`process.env.JWT_SECRET`).
- Token Lifetime:
  - Access Token: 60 minutes.
  - Refresh Token: 7 days with database-backed token rotation.
- Cookies: Stored as HTTP-only cookies with flags:
  ```javascript
  {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
  ```

---

## 3. Role-Based Access Control (RBAC) Matrix

### Platform Roles (SaaS Layer)
| Role | Manage Tenants | View MRR/Billing | Suspend Tenant | System Settings |
| :--- | :---: | :---: | :---: | :---: |
| **SuperAdmin** | Full | Full | Yes | Full |
| **Support Agent** | Read-Only | Read-Only | No | No |
| **Tenant Owner** | Scope Only | Scope Only | Self | Scope Only |

### Tenant Internal Roles (Tenant Panel Layer)
| Role | Edit Store / Menu | Access POS Terminal | Access Kitchen (KDS) | Manage Staff / HR | View Financial Reports |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Owner** | Yes | Yes | Yes | Yes | Yes |
| **Store Manager** | Yes | Yes | Yes | No | Yes |
| **Cashier** | Read-Only | Yes | No | No | Shift Only |
| **Kitchen Staff** | No | No | Yes | No | No |
| **HR Manager** | No | No | No | Yes | No |
| **Editor / Content**| Portfolio/Blog | No | No | No | No |

---

## 4. API & Threat Protection

### A. SQL Injection Elimination
- Raw string concatenation or template literal queries (e.g. `query(`SELECT * FROM users WHERE id = '${id}'`)`) are **strictly prohibited**.
- Parameterized queries must always be used:
  ```javascript
  // CORRECT
  const { rows } = await pool.query(
    'SELECT * FROM ecommerce_products WHERE tenant_id = $1 AND id = $2',
    [tenantId, productId]
  );
  ```

### B. Cross-Site Scripting (XSS) Prevention
- Tiptap rich-text editor inputs must be sanitized using server-side HTML entity encoding or DOMPurify before storing and rendering.
- Content Security Policy (CSP) headers are enforced via `next.config.mjs`:
  ```
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://res.cloudinary.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https://res.cloudinary.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.stripe.com;
  ```

### C. Rate Limiting & Brute-Force Defense
- Auth routes (`/api/saas/auth/login`, `/api/saas/auth/register`) are rate-limited to **5 attempts per minute per IP**.
- POS checkout and online checkout routes are rate-limited to **30 requests per minute per IP**.

---

## 5. Payment Gateway & POS Shift Security

### PCI-DSS Minimization
- The platform never stores, processes, or transmits raw credit card numbers.
- All checkout flows use Stripe Elements / hosted gateway checkouts.
- Webhook endpoints (`/api/saas/webhooks/stripe`, `/api/saas/webhooks/bkash`) cryptographically verify payload signatures before updating payment statuses.

### POS Cash Drawer Reconciliation
- Every POS cashier must initiate a shift with an recorded opening cash float.
- Discrepancies between expected cash in drawer and actual counted cash at shift closing are flagged in `pos_shifts` and reported to the store manager.

---

## 6. Media Asset & Upload Sandbox

- Uploads via Cloudinary must use signed server-side presets.
- Strict MIME-type whitelisting: `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`, `application/pdf` (resumes only).
- Maximum file size constraints:
  - Images: 5MB max.
  - Resume PDFs: 10MB max.
- Tenant files must be sandboxed into individual Cloudinary folders: `/tenants/[tenantId]/...`.
