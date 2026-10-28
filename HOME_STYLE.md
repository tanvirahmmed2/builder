# HOME_STYLE.md - SaaS Marketing & Landing Page Design System

This document specifies the exact design tokens, color palette, typography hierarchy, component choreography, and layout architecture for the public **Multi-Type Website Builder SaaS** homepage (`src/app/(home)/page.jsx` and `src/app/(home)/layout.jsx`).

---

## 1. Visual Identity & Atmosphere

The SaaS homepage is designed for high visual impact, combining a modern editorial palette with clean responsive cards, subtle borders, and smooth transitions.

- **Theme Engine**: Built on Tailwind CSS v4 (`@import "tailwindcss";`) with native dark mode support via `@custom-variant dark (&:where(.dark, .dark *));`.
- **Canvas Base**:
  - Light Mode: `bg-slate-50 text-slate-900`
  - Dark Mode: `dark:bg-slate-950 dark:text-slate-100`
- **Surface Elevation**: Clean white cards (`bg-white`) in light mode transitioning to deep slate surfaces (`dark:bg-slate-900` or `dark:bg-slate-800/80`) with fine borders (`border-slate-200/80 dark:border-slate-700/80`).
- **Accent Philosophy**: A signature Sage/Olive Green (`--primary`) balanced by a vibrant Raspberry Rose (`--secondary`) for high-conversion CTAs.

---

## 2. Color Palette & Theme Tokens

The design tokens are defined in [`src/app/globals.css`](file:///d:/code/portfoliobuilder/src/app/globals.css):

```css
:root {
  --primary: #A2AB73;          /* Sage / Olive Green */
  --primary-light: #e0e7be;    /* Soft Olive Tint */
  --primary-dark: #a1b34c;     /* Deep Olive Accent */
  --secondary: #CC3A63;        /* Raspberry Rose */
  --secondary-light: #e48ea6;  /* Soft Rose Tint */
  --secondary-dark: #ce063e;   /* Vibrant Crimson Action */
  --light: #ffffff;
  --dark: #000000;
}

@theme {
  --color-primary: var(--primary);
  --color-primary-light: var(--primary-light);
  --color-primary-dark: var(--primary-dark);
  --color-secondary: var(--secondary);
  --color-secondary-light: var(--secondary-light);
  --color-secondary-dark: var(--secondary-dark);
  --color-light: var(--light);
  --color-dark: var(--dark);
}
```

### Semantic Token Usage:
- **`bg-primary`**: Used for the hero section background, architecture buttons, and branding highlights.
- **`bg-secondary` & `hover:bg-secondary-dark`**: Primary conversion actions ("Get Started", "Try the Studio", "Creator Panel", checkout buttons) with `shadow-md shadow-secondary/25`.
- **Status & Module Accent Badges**:
  - **E-Commerce**: `bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400`
  - **Restaurant**: `bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400`
  - **Portfolio**: `bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400`
  - **System / Multi-Site**: `bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400`
  - **Organization / CRM**: `bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400`

---

## 3. Typography & Sizing Hierarchy

- **Font Family**: System display sans with fallback to `Inter`, `sans-serif`. Monospace numbers use `font-mono` for metrics and stats.
- **Scale & Line-Heights**:
  - **Hero Title**: `text-4xl md:text-6xl lg:text-8xl font-semibold tracking-tight leading-tight sm:leading-none text-light dark:text-dark`
  - **Section Title**: `text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-snug text-slate-900 dark:text-white`
  - **Section Subtitle / Description**: `text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-3xl mx-auto`
  - **Card Title**: `text-base sm:text-xl font-bold text-slate-900 dark:text-white`
  - **Card Body / Tagline**: `text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed`
  - **Metric Numbers**: `text-2xl sm:text-3xl lg:text-4xl font-semibold font-mono tracking-tight text-slate-900 dark:text-white`

---

## 4. Global UI Components & Utilities

### 4.1 Custom Input Style
```css
.input-style {
  padding: 10px 14px;
  border: solid 1px var(--primary);
  outline: none;
  border-radius: 4px;
  width: 100%;
}
```

### 4.2 Multi-Lingual Footer Translation Widget
Integrated with `next-google-translate-widget`:
- Class: `.footer-translate-widget`
- Upward-opening dropdown (`bottom: calc(100% + 8px)`), rounded pills, backdrop blur (`backdrop-filter: blur(12px)`), and automatic light/dark surface token adaptation.

### 4.3 Live Chat Popup
- File: [`src/components/saas/home/LiveChatPopup.jsx`](file:///d:/code/portfoliobuilder/src/components/saas/home/LiveChatPopup.jsx)
- Floating widget positioned at `fixed bottom-6 right-6 z-50` providing real-time direct messaging between prospective visitors and platform support staff.

---

## 5. Homepage Layout Blueprint (`src/app/(home)/page.jsx`)

The homepage is composed of 9 modular sections rendered sequentially inside a unified full-width container (`<div className="w-full flex flex-col">`):

```
+--------------------------------------------------------------------------------+
| Fixed Navbar: [SITE_NAME] | [Themes] [Apps ▾] [Packages] | [Contact] [Login] [Get Started] |
+--------------------------------------------------------------------------------+
| 1. Hero Section (bg-primary)                                                   |
|    - Headline: "Build Your Digital Identity. Beyond Limits."                   |
|    - Action CTAs: [Get Started Free →]  [Explore Live Themes]                  |
+--------------------------------------------------------------------------------+
| 2. About & Proof Metrics                                                       |
|    - 4 Stat Cards: UI Components (110+), Themes (56+), Creators (23k+), Reviews|
+--------------------------------------------------------------------------------+
| 3. LearnMore (Visual Drag & Drop Studio)                                       |
|    - 4 Bento Cards: Full Control, Block Library, DB Bridge, Multi-Device     |
+--------------------------------------------------------------------------------+
| 4. E-Commerce Engine                                                           |
|    - 4 Pillars: Store Builder, Inventory/SKUs, Dynamic Cart/Checkout, Profits  |
+--------------------------------------------------------------------------------+
| 5. Restaurant Operating Engine & POS                                           |
|    - 5 Pillars: QR Digital Menu, Floor Map, Cashier POS, KDS Screens, Reviews |
+--------------------------------------------------------------------------------+
| 6. Portfolio & Agency Showcase                                                 |
|    - 3 Pillars: Skills & Milestones, Tech Journals/SEO, Appointment Retainers  |
+--------------------------------------------------------------------------------+
| 7. System Management (Command Hub)                                             |
|    - 6 Modules: Multi-Site, Live Chat, Calendar, RBAC, Financials, Omnichannel|
+--------------------------------------------------------------------------------+
| 8. Dynamic Themes Showcase (Filterable by App Slug)                            |
|    - Live API query: /api/saas/home/themes                                     |
+--------------------------------------------------------------------------------+
| 9. Verified Customer Reviews Carousel                                          |
|    - Dynamic average star rating + horizontal testimonial scroll               |
+--------------------------------------------------------------------------------+
| Global Footer: Brand Bio + Newsletter Subscribe + 4 Link Columns + Translator  |
+--------------------------------------------------------------------------------+
```

---

## 6. Detailed Section Specifications

### 1. Navigation Header ([Navbar.jsx](file:///d:/code/portfoliobuilder/src/components/saas/home/bar/Navbar.jsx))
- **Container**: `fixed top-0 left-0 right-0 h-16 w-full flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 lg:px-8 z-50`
- **Brand**: Displays `{SITE_NAME}` with high-contrast text and hover opacity.
- **Center Navigation**:
  - `Themes`: Links to `/themes`.
  - `Apps Dropdown`: Interactive dropdown listing all active SaaS marketplace apps dynamically passed via React `Context`.
  - `Packages`: Links to `/packages`.
- **Right Action Links**:
  - `Contact`: Links to `/contact`.
  - `Login` & `Get Started`: When unauthenticated, shows login link and pill CTA (`bg-secondary rounded-full px-4.5 py-2 font-bold text-white shadow-md shadow-secondary/25`).
  - `Panel`: When authenticated as creator, directly renders an active panel button (`/creator/[id]`).
  - Mobile Menu Trigger: Hamburger icon (`BiMenu`) triggering a responsive drawer navigation sidebar (`Sidebar.jsx`).

### 2. Hero Section ([Hero.jsx](file:///d:/code/portfoliobuilder/src/components/saas/home/pages/Hero.jsx))
- **Background**: `bg-primary` transition surface.
- **Grid Layout**: 12-column responsive grid (`lg:col-span-7` text layout).
- **Headline**: Ultra-large responsive display typography:
  ```jsx
  <h1 className="text-4xl md:text-6xl lg:text-8xl font-semibold text-light dark:text-dark tracking-tight leading-tight sm:leading-none">
    Build Your Digital Identity. Beyond Limits.
  </h1>
  ```
- **Dual Buttons**:
  - Primary CTA: `bg-secondary hover:bg-secondary-dark text-white rounded-2xl px-7 py-3.5 shadow-lg shadow-secondary/25`
  - Secondary CTA: `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl px-6 py-3.5`

### 3. About & Verification Metrics ([About.jsx](file:///d:/code/portfoliobuilder/src/components/saas/home/pages/About.jsx))
- **Atmosphere**: `bg-white dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800`.
- **4 Key Stats Grid**:
  - 110+ Ready UI Components (Blue/Indigo gradient icon)
  - 56+ Responsive Themes (Purple/Pink gradient icon)
  - 23,000+ Active Creators (Amber/Orange gradient icon)
  - 950+ Verified Reviews (Emerald/Teal gradient icon)
- **Cards**: `rounded-3xl p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all`.

### 4. Visual Studio Architecture ([LearnMore.jsx](file:///d:/code/portfoliobuilder/src/components/saas/home/pages/LearnMore.jsx))
- **Headline**: `"Drag & drop tool to build pages instantly with live preview"`.
- **4 Feature Cards**:
  - Design with Full Control (`text-purple-600 bg-purple-50 dark:bg-purple-950/70`)
  - Pre-Built Block Library (`text-blue-600 bg-blue-50 dark:bg-blue-950/70`)
  - Frontend to Backend Bridged (`text-emerald-600 bg-emerald-50 dark:bg-emerald-950/70`)
  - Multi-Device Breakpoints (`text-amber-600 bg-amber-50 dark:bg-amber-950/70`)

### 5. E-Commerce Engine ([E-commerce.jsx](file:///d:/code/portfoliobuilder/src/components/saas/home/pages/E-commerce.jsx))
- **Grid Breakdown**: 4 large capability cards:
  1. Easy Drag & Drop Store Builder
  2. Digital Store & Inventory Management
  3. Dynamic User Control: Cart & Orders
  4. Sales & Cost Management
- **Checklist Micro-UI**: Each feature card includes a checklist with emerald checkmarks (`BiCheck`) detailing automated invoices, SKU locks, zero transaction cuts, and shipping tracking.

### 6. Restaurant & Dining Operations ([Restaurant.jsx](file:///d:/code/portfoliobuilder/src/components/saas/home/pages/Restaurant.jsx))
- **5 Capabilities Matrix**:
  1. Digital Responsive Stylish Menu (QR code mobile-first ordering)
  2. Order & Table Management (Interactive floor maps & split bills)
  3. Live Cashier POS & Fast Touch Billing (Thermal receipts & touch screen items)
  4. Real-Time Kitchen Display System (KDS routing & cooking timers)
  5. Verified Dining Reviews & Lead Capture (Guest feedback & loyalty capture)

### 7. Portfolio & Personal Branding ([Portfolio.jsx](file:///d:/code/portfoliobuilder/src/components/saas/home/pages/Portfolio.jsx))
- **3 Capabilities Matrix**:
  1. Digital Showcase of Skills & Experience (Categorized skills matrix & milestones)
  2. Dynamic Blogs & Contribution Engine (Rich-text markdown, SEO, GitHub commits)
  3. Native Appointment & Booking System (Timezones, Stripe retainers, Google/Zoom sync)

### 8. System Management Hub ([SystemManagement.jsx](file:///d:/code/portfoliobuilder/src/components/saas/home/pages/SystemManagement.jsx))
- **6 Operational Pillars**:
  1. Multi-Website Portfolio Hub
  2. Live Customer Chat & Inquiries
  3. Built-in Calendar & Bookings
  4. Role-Based Access Control (RBAC)
  5. Financial Reports & Analytics
  6. Omni-Channel Order Processing

### 9. Dynamic Themes Showcase ([Themes.jsx](file:///d:/code/portfoliobuilder/src/components/saas/home/pages/Themes.jsx))
- **Category Filter Pills**: Interactive filter pills allowing visitors to toggle themes by associated application (`all`, `ecommerce`, `restaurant`, `portfolio`, etc.).
- **Live Preview Cards**: Displays theme thumbnail with hover zoom, tags, primary/background palette preview dots, and instant demo link.

### 10. Reviews & Global Footer ([Footer.jsx](file:///d:/code/portfoliobuilder/src/components/saas/home/bar/Footer.jsx))
- **Social Proof**: Real-time average rating calculation and carousel cards.
- **Newsletter Subscription**: Direct email capture form ([SubscribeForm.jsx](file:///d:/code/portfoliobuilder/src/components/saas/home/bar/SubscribeForm.jsx)) submitting to the platform lead database.
- **Information Architecture**: 4 categorized link columns (Products, Solutions, Resources, Legal) plus system health indicator and language switcher.
