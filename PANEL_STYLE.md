# PANEL_STYLE.md - Dashboard, Admin Panel & POS Design System

This document outlines the UI/UX design specifications, tokens, components, and layout systems for both the **Tenant Management Dashboard** and the **Cashier POS / Kitchen Display System (KDS)**.

---

## 1. Design Philosophy

The admin and tenant management experience must be:
1. **High-Density & Information-Rich**: Quick scanning of tables, metrics, and orders without unnecessary whitespace bloating.
2. **Context-Aware Theming**: Visual styling shifts subtly based on the active website module:
   - **SaaS Platform Admin**: Slate & Indigo (Command center)
   - **Portfolio Manager**: Zinc & Violet (Creative showcase)
   - **E-Commerce Store Manager**: Emerald & Slate (Commerce, inventory, revenue)
   - **Restaurant & POS**: Amber, Orange & Dark Charcoal (High speed, kitchen-friendly, contrast)
   - **Organization Portal**: Cyan & Blue (Corporate, team, structure)
3. **Ultra-Fast & Touch-Optimized POS**: Point-of-Sale interface must work seamlessly on touch screens, tablets, and desktop with zero input lag and instant keyboard shortcuts.

---

## 2. Color Palette & Semantic Tokens

### Core Neutral Surfaces
- **Background Root**: `#090d16` (Deep Obsidian Dark) / `#f8fafc` (Clean Light)
- **Card / Surface**: `#0f172a` (Surface 1) / `#1e293b` (Surface 2) / `#334155` (Surface 3)
- **Border Default**: `rgba(255, 255, 255, 0.08)` (Dark) / `rgba(0, 0, 0, 0.08)` (Light)
- **Border Active / Focus**: `rgba(99, 102, 241, 0.5)` (Indigo Ring)

### Module Primary Accent Colors
| Module | Accent Color | Tailored Gradient | Semantic Meaning |
| :--- | :--- | :--- | :--- |
| **SaaS SuperAdmin** | `#6366f1` (Indigo 500) | `linear-gradient(135deg, #6366f1, #4f46e5)` | Platform metrics, subscriptions |
| **Portfolio Manager** | `#8b5cf6` (Purple 500) | `linear-gradient(135deg, #a855f7, #7c3aed)` | Creative projects, media, case studies |
| **E-Commerce Manager** | `#10b981` (Emerald 500) | `linear-gradient(135deg, #10b981, #059669)` | Revenue, stock, customer orders |
| **Restaurant & POS** | `#f59e0b` (Amber 500) | `linear-gradient(135deg, #f59e0b, #d97706)` | Fast food orders, kitchen tickets, tables |
| **Organization Portal** | `#06b6d4` (Cyan 500) | `linear-gradient(135deg, #06b6d4, #0891b2)` | Teams, HR, roles, internal notices |

### State Colors
- **Success**: `#22c55e` (Emerald) - Paid, Delivered, Active
- **Warning**: `#eab308` (Amber) - Pending, Cooking, Low Stock
- **Danger**: `#ef4444` (Rose) - Cancelled, Refunded, Out of Stock, Error
- **Info**: `#38bdf8` (Sky) - Hold, Draft, In Transit

---

## 3. Typography & Hierarchy

- **Primary Font Family**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Monospace Font (SKUs, IDs, POS totals)**: `'JetBrains Mono', 'Fira Code', monospace`
- **Scale**:
  - `Page Title`: `text-2xl font-bold tracking-tight text-white`
  - `Section Header`: `text-lg font-semibold text-slate-100`
  - `Card Header`: `text-sm font-medium text-slate-400 uppercase tracking-wider`
  - `Body / Cell Text`: `text-sm text-slate-300 font-normal`
  - `Caption / Meta`: `text-xs text-slate-400`
  - `POS Big Price`: `text-3xl font-extrabold font-mono text-emerald-400`

---

## 4. Layout Architecture

### Standard Tenant Dashboard Shell
```
+----------------------------------------------------------------------------------+
| Topbar: [Tenant Logo/Name] [Module Switcher] [Search (Cmd+K)] [Alerts] [User Av] |
+-------------------+--------------------------------------------------------------+
| Sidebar (240px)   | Main Content Container (Fluid max-w-7xl)                     |
| - Overview        |                                                              |
| - Products/Menu   | [Page Header: Title + Action Buttons]                        |
| - Orders / POS    |                                                              |
| - Inventory       | [KPI Stats Grid: 4 Cards]                                    |
| - Team / Staff    |                                                              |
| - Settings        | [Data Filter Bar: Search, Status, Date Picker, Export]       |
|                   |                                                              |
| [Collapse Toggle] | [Data Table / Grid with Pagination]                          |
+-------------------+--------------------------------------------------------------+
```

---

## 5. Component Library Standards

### 1. Data Tables
- Sticky header with subtle backdrop blur (`backdrop-blur-md bg-slate-900/80`).
- Alternating row hover highlight (`hover:bg-slate-800/50 transition-colors`).
- Checkbox bulk selection toolbar appearing when 1+ rows are checked.
- Standard column formats:
  - Thumbnail + Name + Secondary slug
  - Monospace SKU or Order Reference ID
  - Status badge (pill with colored dot)
  - Numeric alignment: Right-aligned with tabular numbers (`font-mono`)
  - Row actions: Dropdown button or quick icon triggers (`Edit`, `Duplicate`, `Delete`).

### 2. Forms & Inputs
- Dark surface background: `bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`.
- Integrated validation message: Displayed directly below the input with red dot and text.
- Drag-and-Drop Media Dropzone: Multi-file preview with upload progress bar, Cloudinary integration, and aspect ratio crop tool.
- Rich-Text Tiptap Editor: Sticky formatting toolbar (Bold, Italic, H2, H3, Bullet, Link, Image, CodeBlock).

### 3. Modals & Side Drawers
- Backdrop: `bg-black/60 backdrop-blur-sm animate-fade-in`.
- Side Drawer: Used for editing products, order details, and team member profiles without navigating away from the table.
- Accessible close: `Escape` key closes, outside click closes with unsaved-changes confirmation.

---

## 6. Restaurant POS (Point of Sale) Dedicated Interface

The POS terminal requires a dedicated layout optimized for rapid transaction flow:

```
+---------------------------------------------------------------+------------------------+
| POS Header: [Cashier Name] [Shift #4] [Table: T-12] [Offline/Online Indicator]        |
+---------------------------------------------------------------+------------------------+
| Left Panel: Category Pills & Fast Item Grid (70% Width)       | Right Panel: Cart Drawer|
| [All] [Appetizers] [Burgers] [Beverages] [Desserts]           | [Order #1042 - Dine-in]|
|                                                               | ---------------------- |
| +-------------------+ +-------------------+ +---------------+ | 2x Cheeseburger $18.00 |
| | Cheeseburger      | | Bacon Burger      | | Truffle Fries | |    + Extra Cheese $2.00|
| | $9.00             | | $11.50            | | $6.00         | | 1x Mango Shake  $5.00  |
| +-------------------+ +-------------------+ +---------------+ | ---------------------- |
| +-------------------+ +-------------------+ +---------------+ | Subtotal:       $25.00 |
| | Sparkling Water   | | Mojito            | | Lava Cake     | | Tax (8%):        $2.00 |
| | $3.00             | | $7.00             | | $8.50         | | Total:          $27.00 |
| +-------------------+ +-------------------+ +---------------+ | ---------------------- |
|                                                               | [Hold Order] [Discount]|
| [Barcode Scanner Input: Focus Always Accessible]             | [Cash] [Card] [bKash]  |
|                                                               | [PRINT & PAY (SPACE)]  |
+---------------------------------------------------------------+------------------------+
```

### POS Specific Rules:
- **Touch Button Minimum Size**: All tappable product cards must be at least `88px x 88px` with clear imagery and price.
- **Modifier Popup**: Clicking an item with modifiers (e.g., Pizza toppings, spice level) opens a lightweight modal to select options before adding to cart.
- **Offline Resilience Badge**: Visual pill in topbar showing `Online (Synced)` or `Offline (Queued: 4 Orders)`.
- **Receipt Formats**: Support 80mm thermal receipt printing and 58mm compact format with auto-print capability.

---

## 7. Kitchen Display System (KDS) Layout

- High contrast dark UI optimized for kitchen wall screens.
- Order Cards color-coded by waiting time:
  - **Green (< 10 mins)**: New ticket
  - **Yellow (10-20 mins)**: In preparation
  - **Red (> 20 mins)**: Delayed / Urgent
- Large item checkoffs: Kitchen staff can touch or strike through individual cooked items.
- Audio bell notification on incoming orders (using Web Audio API).
