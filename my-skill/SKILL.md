---
name: multi-type-saas-builder
description: >-
  Comprehensive skill for developing, operating, and extending the Multi-Type
  Website Builder SaaS platform supporting Portfolio, Multi-Store E-Commerce,
  Restaurant Cloud POS, and Organization/Team Management sites.
---

# Multi-Type Website Builder SaaS Skill

This skill provides step-by-step runbooks, automation scripts, and reference implementations for building, maintaining, and scaling the Multi-Type Website Builder SaaS.

---

## 1. Quick Reference: The 4 Website Types

| Website Type | Primary Modules Enabled | Key Database Tables | Key API Endpoints |
| :--- | :--- | :--- | :--- |
| **Portfolio** | Projects, Categories, Services, Inquiries | `portfolio_projects`, `portfolio_inquiries` | `/api/tenants/[id]/portfolio/*` |
| **Multi-Store E-Commerce** | Products, Variants, Inventory, Orders, Shipping | `ecommerce_products`, `ecommerce_orders`, `inventory_stock` | `/api/tenants/[id]/store/*` |
| **Restaurant + POS** | Digital Menu, Modifiers, Tables, POS Shifts, KDS | `restaurant_menu_items`, `pos_shifts`, `pos_orders` | `/api/pos/*`, `/api/tenants/[id]/kds/*` |
| **Organization Portal** | Departments, Staff, Careers, Announcements | `org_departments`, `org_members`, `org_jobs` | `/api/tenants/[id]/org/*` |

---

## 2. Standard Workflows

### Workflow A: Provisioning a New Tenant
1. **Validate Subdomain**: Run validation to ensure the slug is alphanumeric and not reserved (`admin`, `api`, `app`, `www`, `billing`).
2. **Create Tenant Record**: Insert row into `tenants` with specified `site_type` and owner user ID.
3. **Execute Template Seeding**:
   ```bash
   node my-skill/scripts/seed-tenant-template.mjs --tenantId="<uuid>" --type="restaurant_pos"
   ```
4. **Issue Welcome Notification**: Send welcome email with login credentials via Brevo template.

### Workflow B: Validating Multi-Tenant Isolation
Before merging or deploying any database changes:
1. Ensure all `SELECT`, `UPDATE`, and `DELETE` statements on tenant tables contain `WHERE tenant_id = $1`.
2. Run tenant integrity check:
   ```bash
   node my-skill/scripts/validate-tenant.mjs --tenantId="<uuid>"
   ```

### Workflow C: Custom Domain Verification
1. User enters domain (e.g. `shop.brand.com`) in `/panel/[tenantId]/settings/domains`.
2. Generate DNS CNAME verification record pointing to `cname.buildsaas.com`.
3. Periodically poll DNS records using Node.js `dns.promises.resolveCname`.
4. Once verified, update `tenant_domains.is_verified = true` and request automated SSL certificate.

---

## 3. Directory Contents

- **`scripts/`**:
  - `validate-tenant.mjs`: Diagnostic script to test database connectivity, verify foreign keys, and confirm tenant partition integrity.
  - `seed-tenant-template.mjs`: Automated seeder that generates realistic demo data (products, menus, team, portfolio) for any site type.
- **`examples/`**:
  - `tenant-routing-middleware.js`: Production-ready Next.js middleware implementation for domain rewrites.
  - `pos-order-payload.json`: Sample payload representing a restaurant POS transaction with split payments and kitchen modifiers.
  - `multistore-config.json`: Configuration schema for multi-warehouse and multi-branch e-commerce setups.
- **`resources/`**:
  - `tenant-schema-template.sql`: Complete PostgreSQL DDL starter script.
  - `site-types-matrix.json`: JSON feature flag matrix mapping site types to enabled UI modules.
  - `role-permissions.json`: Role-Based Access Control matrix for all platform and tenant roles.

---

## 4. Troubleshooting & Common Pitfalls

- **Issue**: Storefront returns 404 or redirects to SaaS homepage.
  - *Fix*: Check `Host` header in `middleware.js` and verify if the domain/subdomain exists in `tenants.slug` or `tenant_domains.domain`.
- **Issue**: POS cashier cannot print receipts or submits duplicate orders.
  - *Fix*: Verify `client_order_token` uniqueness in the POS order payload to prevent double billing. Check `pos_shifts` table for an open shift ID.
- **Issue**: Cloudinary asset upload fails.
  - *Fix*: Ensure the upload request includes the signed preset and folder path prefix `/tenants/${tenantId}/`.
