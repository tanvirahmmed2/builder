# TENANT_STRUCTURE.md - Tenant Modules & Application Architecture

This document details the architecture, feature modules, operational workflows, and data flow for the four website types powered by the platform.

---

## 1. Modular Architecture Overview

A tenant can operate one or multiple modules based on their subscription tier:

```
                          ┌──────────────────────────┐
                          │   Tenant Master Config   │
                          │ (Theme, Domain, Roles)   │
                          └────────────┬─────────────┘
                                       │
        ┌──────────────────┬───────────┴───────────┬──────────────────┐
        ▼                  ▼                       ▼                  ▼
┌───────────────┐  ┌───────────────┐       ┌───────────────┐  ┌───────────────┐
│  1. Portfolio │  │ 2. Multi-Store│       │3. Restaurant  │  │4. Organization│
│    Module     │  │  E-Commerce   │       │   with POS    │  │& Team Manager │
└───────────────┘  └───────────────┘       └───────────────┘  └───────────────┘
```

---

## 2. Module 1: Portfolio & Creative Showcase

Designed for freelancers, designers, developers, agencies, and consulting firms.

### Core Capabilities
- **Project Showcase**: Rich media galleries, video embeds, case study narratives with Tiptap editor, client name, completion date, and live demo URLs.
- **Taxonomy**: Filter by category (e.g., UI/UX, Mobile App, Branding), tech stack tags (React, Next.js, Node.js).
- **Services Catalog**: Service cards with pricing tiers, delivery time, deliverables list, and direct inquiry CTAs.
- **Resume & Experience Timeline**: Education, career history, achievements, and downloadable CV file.
- **Client Testimonials**: Verified ratings, quote text, client avatar, company logo.
- **Inquiry & Lead Capture**: Contact forms with spam prevention, automated email dispatch via Brevo, and lead management CRM in the tenant panel.

---

## 3. Module 2: Multi-Store E-Commerce

Designed for retail stores, fashion brands, electronics, and multi-location merchants.

### Core Capabilities
- **Hierarchical Catalog**: Infinite nested categories, brand management, badges (New, Sale, Featured).
- **Matrix Product Variants**:
  - Combinations of attributes: Size (S, M, L, XL), Color (Red, Blue), Material.
  - Variant-specific SKU, barcode, price adjustment, and inventory tracking.
- **Multi-Branch / Multi-Warehouse Stock**:
  - Ability to track inventory across multiple physical stores or fulfillment warehouses.
  - Automatic deduction from nearest branch during online checkout.
- **Promotions & Discount Engine**:
  - Percentage or fixed amount coupons, minimum spend requirements, expiry dates, usage limits.
- **Shopping Cart & Checkout**:
  - Guest and customer account checkouts.
  - Multi-step or streamlined one-page checkout.
  - Automated tax calculation and flexible shipping zone rates (flat rate, free shipping thresholds).
- **Payment Gateway Matrix**: Direct integration with Stripe, bKash, SSLCommerz, and Cash on Delivery (COD).
- **Order Lifecycle**:
  `Pending → Confirmed → Processing → Shipped → Delivered → Cancelled / Refunded`.

---

## 4. Module 3: Restaurant Website with Cloud POS & Kitchen Display (KDS)

Designed for cafes, bistros, dark kitchens, fine dining, and fast-food chains.

```
Customer Order (Online / QR Table)  OR  Cashier POS Terminal
                 │                                │
                 └────────────────┬───────────────┘
                                  ▼
                       [ Central Order Pool ]
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
[ Kitchen Display System (KDS) ]               [ Customer / Cashier ]
- Order tickets displayed on screen             - Real-time order status tracking
- Cook status: Cooking -> Ready                 - Thermal receipt printing (80mm/58mm)
```

### Core Capabilities
- **Digital Food Menu**:
  - Organized by courses (Starters, Mains, Drinks, Desserts).
  - Dietary flags: Vegan, Vegetarian, Gluten-Free, Halal, Spicy Rating (1-3 peppers).
- **Item Modifiers & Add-ons**:
  - Required single-choice groups (e.g., Size: Small / Medium / Large).
  - Optional multi-choice groups (e.g., Extra Cheese +$1.50, Bacon +$2.00).
  - Cooking instructions & special requests (e.g., "No onions", "Well done").
- **Floor Plan & Table Management**:
  - Table numbering, seating capacity, indoor/outdoor zones.
  - Dine-in table reservations with booking confirmation and SMS/email alerts.
  - Dynamic QR codes generated per table for contactless ordering.
- **Cloud Cashier POS Terminal**:
  - Touch-optimized fast item search and category tabs.
  - Hold order / resume order functionality.
  - Split bill (split evenly or pay by item) and multi-tender payments (Cash + Card).
  - Offline-first cache: Continue taking orders when internet drops; auto-syncs when reconnected.
  - Shift management: Open register, record cash drawer opening float, track closing cash and variances.
- **Kitchen Display System (KDS)**:
  - Full-screen web view for kitchen staff with touch strike-through and order completion sound.

---

## 5. Module 4: Organization & Team Management

Designed for corporate companies, non-profits, institutions, and startup teams.

### Core Capabilities
- **Department & Hierarchy Structure**:
  - Departments (Engineering, Design, Marketing, Sales, Operations).
  - Employee directory with job title, direct supervisor, contact email, and bio.
- **Role-Based Access Control (Tenant RBAC)**:
  - Granular permissions for dashboard access (e.g., Store Manager cannot modify billing; Cashier can only access POS).
- **Internal Bulletin Board**:
  - Company-wide announcements, policy documents, event notifications.
- **Careers & Recruitment Portal**:
  - Public job opening listings with job description, requirements, salary range, and deadline.
  - Candidate application form with resume file upload to Cloudinary.
  - Hiring pipeline board in tenant panel: `Applied → Screened → Interviewing → Offered → Rejected`.

---

## 6. Tenant Storefront Dynamic Theme Engine

Tenant public sites are rendered dynamically from a JSON theme configuration:
- **Typography & Font**: Auto-loads Google Fonts specified in tenant configuration.
- **Brand Colors**: CSS custom variables injected at root (`--primary`, `--primary-foreground`, `--accent`).
- **Dynamic Header & Footer**: Configurable menu trees, logo positioning, social media handles, copyright text.
- **Page Builder Sections**: Flexible blocks (Hero Banner, Product Slider, Food Menu Grid, Team Carousel, Contact Form).
