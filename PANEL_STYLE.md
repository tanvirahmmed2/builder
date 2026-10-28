# PANEL_STYLE.md - Tenant Management Panel & POS Design System

This document outlines the UI/UX architecture, layout specifications, design tokens, role permissions, and component standards for the **Tenant Management Dashboard and POS Terminal** located under `src/app/[domain]/(panel)/panel/control/`.

---

## 1. Design Philosophy & Architectural Standard

The tenant control console provides a high-density, lightning-fast operating system for multi-store retail, inventory, restaurant POS, and business administration:

1. **High-Density Information Architecture**: Compact padding (`py-2 px-3`), clear table borders (`divide-y divide-slate-100`), tabular monospace numbers (`font-mono`), and quick-scanning metric cards.
2. **Multi-Tenant Domain Scoping**: Every staff session is scoped to a specific tenant domain (`/[domain]/panel/control`). All client requests automatically map `/api/...` calls to `/api/${domain}/panel/control/...` via a built-in request interceptor in `layout.jsx`.
3. **Strict RBAC Enforcement**: Role-governed viewports with automated permission gating for `admin`, `manager`, `sales`, and `staff`.
4. **Touch & Scanner-Optimized POS**: A dedicated two-column cashier POS terminal supporting barcode hardware scanners, item variant selection, real-time change calculation, and automated 80mm thermal receipt printing.

---

## 2. Color Palette & Semantic Tokens

The panel uses clean slate neutrals paired with the SaaS platform's primary olive accent and clear semantic feedback colors:

### Core Surfaces & Borders
- **Background Root**: `bg-slate-50` (Light) / `dark:bg-slate-950` (Dark)
- **Primary Card Surface**: `bg-white` (Light) / `dark:bg-slate-900` (Dark)
- **Secondary Surface / Inputs**: `bg-slate-50` / `dark:bg-slate-800`
- **Border Default**: `border-slate-200` (Light) / `dark:border-slate-800` (Dark)
- **Divider Color**: `divide-slate-100` / `dark:divide-slate-800`

### Brand & Interactive Accents
- **Primary Accent (`--primary`)**: `#A2AB73` — Used for active icons, key CTAs, and user avatar badges.
- **Primary Dark (`--primary-dark`)**: `#a1b34c` — Hover state for primary buttons.
- **Secondary Action (`--secondary`)**: `#CC3A63` — High-priority triggers, alerts, and badges.

### Status Badge Palette
Implemented via `getStatusBadge(status)` across all dashboard tables:

| Status Group | Examples | Tailwind Classes |
| :--- | :--- | :--- |
| **Success / Paid / Active** | `completed`, `delivered`, `approved`, `active`, `success`, `paid` | `bg-emerald-50 text-emerald-700 border-emerald-200` |
| **Pending / In Progress** | `pending`, `partial`, `processing`, `confirmed`, `shipped`, `due` | `bg-amber-50 text-amber-700 border-amber-200` |
| **Danger / Failed / Return** | `cancelled`, `rejected`, `failed`, `banned`, `returned` | `bg-rose-50 text-rose-700 border-rose-200` |
| **Neutral / Draft / Archived**| `draft`, `archived`, `closed`, `other` | `bg-slate-50 text-slate-700 border-slate-200` |

---

## 3. Typography & Numerical Formatting

- **Font Family**: Standard Sans (`Inter`, system-ui) for labels and navigation.
- **Monospace Font**: `font-mono` is strictly used for order invoice numbers, barcodes, SKUs, and monetary amounts.
- **Currency Standards**:
  - Default Currency: Bangladeshi Taka (`৳`) formatted via `formatMoney(val)`:
    ```js
    const formatMoney = (val) => {
      const num = parseFloat(val || 0);
      return `৳${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    ```
  - Configurable dynamic currencies supported via `website_currencies` table.
- **Date Format**: Standardized to `DD MMM YYYY` (e.g. `28 Oct 2026`).

---

## 4. Role-Based Access Control (RBAC) Matrix

Defined in [`control/layout.jsx`](file:///d:/code/portfoliobuilder/src/app/[domain]/(panel)/panel/control/layout.jsx):

```javascript
export const ROLE_PERMISSIONS = {
  admin: [
    'modules', 'branches', 'people', 'category', 'brands', 'product', 'price-tag', 'stock',
    'purchase', 'purchase-payments', 'supplier', 'customers', 'support', 'contact', 'reviews',
    'payments', 'return', 'report', 'backup', 'settings', 'sale',
    'pending-sale', 'confirmed-sale', 'out_for_delivery', 'completed-sale',
    'returned-sale', 'history', 'issue', 'profile', 'orders', 'overview',
    'activity-logs', 'login-logs', 'investor', 'investments', 'withdrawals',
    'salaries', 'staff-salaries', 'salary-payments', 'shares', 'expenses',
    'expense-payments', 'profits', 'balance', 'notices', 'my-salary'
  ], // All 46 modules
  manager: [
    'modules', 'sale', 'pending-sale', 'confirmed-sale', 'out_for_delivery',
    'completed-sale', 'returned-sale', 'payments', 'history', 'issue',
    'profile', 'orders', 'purchase', 'purchase-payments', 'return', 'stock',
    'price-tag', 'customers', 'activity-logs', 'login-logs', 'expenses',
    'expense-payments', 'notices', 'my-salary'
  ], // 23 operational modules
  sales: [
    'modules', 'sale', 'pending-sale', 'confirmed-sale', 'out_for_delivery',
    'completed-sale', 'returned-sale', 'payments', 'history', 'issue',
    'profile', 'orders', 'price-tag', 'notices', 'activity-logs',
    'login-logs', 'my-salary'
  ], // 17 sales & fulfillment modules
  staff: [
    'modules', 'profile', 'issue', 'orders', 'price-tag', 'notices',
    'activity-logs', 'login-logs', 'my-salary'
  ] // 9 self-service & task modules
};
```

### Unauthorized Guard View:
If a user navigates to an unauthorized module URL, the layout intercepts rendering and displays an **Access Restricted** card with `BiShieldX`, role name notification, and a redirect button back to `/overview`.

---

## 5. Layout Shell & Navigation Architecture

The control panel layout uses a fixed top header paired with a collapsible left sidebar:

```
+------------------------------------------------------------------------------------+
| Fixed Topbar (h-16): [☰ Toggle] [Store Name ↗]               [🛒 POS] [☼/☽] [Avatar ▾] |
+---------------------+--------------------------------------------------------------+
| Collapsible Sidebar | Main Scrollable Workspace Container                          |
| (lg:pl-64 / pl-8)   |                                                              |
|                     | [Staff Header: Avatar, Name, Role Badge, Branch Name]        |
| 1. Core & POS       | [Module Center Callout Banner]                               |
| 2. Inventory        |                                                              |
| 3. Purchases & CRM  | [Quick Admin Shortcuts: 8 Buttons]                           |
| 4. Finance & Ledger |                                                              |
| 5. HRM & Payroll    | [KPI Metrics Grid: Revenue, Balance, Stock, Items]           |
| 6. Operations       |                                                              |
| 7. System Tools     | [Filter Bar: Search, Category, Date Picker]                  |
|                     | [High-Density Data Table / Pagination]                       |
+---------------------+--------------------------------------------------------------+
```

### 5.1 Topbar Navigation ([ControlNavbar.jsx](file:///d:/code/portfoliobuilder/src/components/website/bars/Navbar.jsx))
- **Height & Sticky**: `h-16 fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800`.
- **Store Name & Public Link**: Dynamically displays the store title fetched from `/api/settings` with a direct link to the live storefront (`BiExternalLink`).
- **Quick POS Link**: Dedicated button directly opening the POS Terminal (`/panel/control/sale`).
- **Profile Dropdown**: Displays staff name, role, email, link to profile, and `Logout` action clearing sessions via `DELETE /api/staff/sessions`.

### 5.2 Sidebar Structure ([ControlSidebar.jsx](file:///d:/code/portfoliobuilder/src/components/website/bars/Sidebar.jsx))
Organized into 7 functional sections (`NAV_SECTIONS`):
1. **Core & POS**: Admin Overview, POS Terminal, Pending Sales, Confirmed Sales, Out For Delivery, Completed Sales, Sales History, Returns.
2. **Inventory & Catalog**: Products Catalog, Categories, Brands, Inventory Stock, Price Tags & Barcodes.
3. **Purchases & CRM**: Supplier Purchases, Purchase Payments, Suppliers, Customer Directory.
4. **Finance & Accounts**: Balance & Ledger, Available Balance, Profits & Transfers, Expenses, Expense Payments, Investors, Investments, Equity & Shares, Withdrawals.
5. **HRM & Payroll**: Staff & People, Salary Structures, Staff Salaries, Salary Payments, My Salary.
6. **Operations & Helpdesk**: Store Outlets, Customer Reviews, Support Tickets, Contact Inquiries, Issue Tracker, Notice Board.
7. **System & Tools**: Console Settings, Active Modules, Activity Logs, Login Logs, Database Backup, My Profile.

---

## 6. Cashier POS Terminal Specification (`control/sale/page.jsx`)

The POS interface is optimized for high-speed touch input, barcode scanning, and fast receipts:

```
+---------------------------------------------------------------+------------------------+
| POS Search Bar: [ Barcode Hardware Input (Auto-Focus) ]       | Customer Header        |
| Filter Pills:   [ All ] [ Grocery ] [ Electronics ] [ Apparel ] | Phone:  [+880________] |
+---------------------------------------------------------------+ Name:   [Customer Name]|
| Item Catalog Grid (Fluid 3 to 5 Columns)                      +------------------------+
| +-------------------+ +-------------------+ +---------------+ | Cart Items Table       |
| | [Product Image]   | | [Product Image]   | | [Product Img] | | Img | Name | Qty | Sum |
| | Smartphone X      | | Cotton T-Shirt    | | Organic Milk  | | [•]   Shirt  2x   ৳900 |
| | In Stock: 14      | | In Stock: 50      | | In Stock: 8   | | ---------------------- |
| | ৳ 24,500.00       | | ৳ 450.00          | | ৳ 95.00       | | Subtotal:       ৳900.00|
| +-------------------+ +-------------------+ +---------------+ | Delivery:         ৳60.00|
|                                                               | Total:          ৳960.00|
|                                                               | ---------------------- |
|                                                               | Payment: [Cash] [Card] |
|                                                               | Received:      [৳1000] |
|                                                               | Change:         ৳40.00 |
|                                                               | ---------------------- |
|                                                               | [ 🖨️ PAY & PRINT ]     |
+---------------------------------------------------------------+------------------------+
```

### Key POS Operational Behaviors:
- **Direct Barcode Input**: Listening on `barcodeInputRef` for continuous automated barcode scanner input.
- **Product Variants Modal**: If an item contains variants (Size, Color, Bundle), clicking opens an instant variant picker modal.
- **In-Memory Cart Calculations**: Dynamic subtotal, delivery fee addition, discount subtraction, and automatic change return math.
- **Split Payment Methods**: Supports `Cash`, `Card`, `Mobile Banking`, and `Split` billing.
- **Receipt Dispatcher**: Automatically formats and triggers physical 80mm thermal receipt printing via `printReceipt()` utility.

---

## 7. Data Tables, Forms & Management Modules

### 7.1 Catalog Table Standard ([product/page.jsx](file:///d:/code/portfoliobuilder/src/app/[domain]/(panel)/panel/control/product/page.jsx))
- **Toolbar**: Search input (`BiSearch`) with debounced API queries, Category select dropdown, and Brand select dropdown.
- **Action Group**: Print Price Tags button + "+ Create Product" button (`bg-primary hover:bg-primary-dark`).
- **Table Density**:
  - Image thumbnail (`w-8 h-8 rounded-md object-cover`).
  - Product name + SKU / Barcode + Unit indicator.
  - Linked category and brand pills.
  - Numeric right-aligned pricing (`font-mono`).
  - Quick action buttons (Edit, Delete with double-confirmation).

### 7.2 Console Settings ([settings/page.jsx](file:///d:/code/portfoliobuilder/src/app/[domain]/(panel)/panel/control/settings/page.jsx))
- **Tabbed Settings Architecture**:
  1. **Store Identity**: Title, tagline, contact email, phone, physical address, social links.
  2. **Hero & Banner**: Storefront promotional headings and descriptions.
  3. **Logo & Assets**: Cloudinary asset uploader with instant image previews.
  4. **Multi-Currency Manager**: Table of supported currencies, exchange rates, and 1-click active default switch.
  5. **Tax & Operational Rules**: Exclusive/inclusive tax flags, VAT percentages, and store open/closed toggles.
