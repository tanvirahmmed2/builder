# HOME_STYLE.md - SaaS Marketing & Landing Page Design System

This document specifies the design guidelines, visual aesthetics, component choreography, and conversion architecture for the public **Multi-Type Website Builder SaaS** homepage.

---

## 1. Visual Identity & Atmosphere

The homepage must immediately evoke high engineering quality, speed, and versatility.

- **Theme**: Ultra-modern deep dark mode with dynamic ambient glows and crisp typography.
- **Visual Style**: Sleek glassmorphism (`backdrop-blur-xl bg-slate-950/60 border border-white/10`), subtle glowing grid textures, and smooth gradient text.
- **Micro-Animations**: Powered by `framer-motion` (viewport entrance staggered fade-ins, cursor-following glow, interactive tab switches).

---

## 2. Color Palette & Lighting Tokens

### Background & Atmosphere
- **Canvas Base**: `#030712` (Tailwind Gray 950)
- **Radial Ambient Glows**:
  - Primary Purple: `radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.15), transparent 60%)`
  - Emerald Store Accent: `radial-gradient(circle at 100% 50%, rgba(16, 185, 129, 0.12), transparent 50%)`
  - Amber Restaurant Glow: `radial-gradient(circle at 0% 70%, rgba(245, 158, 11, 0.10), transparent 50%)`

### Accent & Brand Gradients
- **Primary Hero Gradient**: `linear-gradient(to right, #ffffff, #cbd5e1, #94a3b8)`
- **Vibrant Accent Gradient**: `linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)`
- **Feature Highlights**:
  - E-Commerce: `text-emerald-400 bg-emerald-950/50 border-emerald-500/30`
  - Restaurant/POS: `text-amber-400 bg-amber-950/50 border-amber-500/30`
  - Portfolio: `text-purple-400 bg-purple-950/50 border-purple-500/30`
  - Organization: `text-cyan-400 bg-cyan-950/50 border-cyan-500/30`

---

## 3. Typography Hierarchy

- **Headline Font**: Modern Display Sans (`'Plus Jakarta Sans'` or `'Inter'`, weights 700 to 900)
- **Body Font**: Crisp Sans (`'Inter'`, weight 400 to 500)
- **Monospace Code/Badge Font**: `'JetBrains Mono'`, weight 600

```css
/* Hero Title */
.hero-title {
  font-size: clamp(2.5rem, 6vw, 4.75rem);
  line-height: 1.08;
  letter-spacing: -0.035em;
  font-weight: 800;
}

/* Section Header */
.section-title {
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.15;
  letter-spacing: -0.025em;
  font-weight: 700;
}
```

---

## 4. Homepage Section Blueprint

### 1. Navigation Bar (Sticky Glass Header)
- Left: Brand Logo with glowing gradient icon + "BuilderSaaS" wordmark.
- Center: Navigation links with pill hover effect (`Solutions`, `Features`, `Templates`, `Pricing`, `Showcase`).
- Right: `Login` link + High-contrast gradient CTA button (`Start Free Trial`).

### 2. Hero Section
- **Announcement Pill**: Interactive pill badge (e.g., `"⚡ Next-Gen POS & Multi-Store Engine Just Launched"`).
- **Hero Headline**: `"One Platform to Build Portfolios, Multi-Stores, Restaurants & Team Portals"`.
- **Subheadline**: `"Launch high-performance websites with built-in e-commerce inventory, restaurant POS terminals, team management, and custom domains in under 60 seconds."`
- **Call-to-Action Group**:
  - Primary: `Create Your Website →` (with subtle shimmer hover effect).
  - Secondary: `Watch 2-Min Demo ▷` (opens video modal or interactive tour).
- **Interactive Type-Switcher Sandbox**:
  - Four interactive tabs: `[🎨 Portfolio]` `[🛍️ Multi-Store]` `[🍔 Restaurant + POS]` `[🏢 Organization]`.
  - When switched, the live device mockups (MacBook + iPad POS + Mobile) dynamically animate into the chosen site type with live UI preview.

### 3. Feature Bento Grid (4 Pillars)
```
+-----------------------------------+-----------------------------------+
| Multi-Store E-Commerce (2x2 Span) | Restaurant POS & Kitchen (1x2)    |
| - Multi-branch inventory tracking | - Live touch cashier terminal     |
| - Variant matrices (Size, Color)  | - Real-time Kitchen Display (KDS) |
| - Instant checkout & coupons      | - QR-code table ordering          |
+-----------------------------------+-----------------------------------+
| Portfolio & Case Studies (1x1)    | Organization & RBAC (1x1)         |
| - Media galleries & Tiptap editor | - Team member directories         |
| - Lead generation inquiry forms   | - Granular permission roles       |
+-----------------------------------+-----------------------------------+
```

### 4. Live Performance & SEO Benchmark
- Counter widgets highlighting:
  - `99/100` Google Lighthouse Score
  - `< 0.4s` Time to First Byte (Edge SSR)
  - `Zero Maintenance` SSL & DNS provisioning

### 5. Interactive Pricing Tier Matrix
- Monthly / Annual toggle (with `Save 20%` badge).
- 4 Transparent Plans:
  1. **Starter / Portfolio**: 1 custom domain, portfolio showcase, contact inquiries.
  2. **Merchant / E-Commerce**: Multi-store, unlimited products, inventory, payment gateways.
  3. **Restaurant Pro + POS**: Cloud POS, KDS, table management, thermal receipts.
  4. **Enterprise / All-In-One**: All 4 website engines, unlimited staff, custom SSL, SLA support.

### 6. Social Proof & Live Showcase
- Carousel of real tenant websites running on the engine.
- Testimonials with verified business owner photos, company titles, and metrics ("Increased POS checkout speed by 40%").

### 7. High-Converting Bottom CTA
- Dark glowing banner with headline: `"Ready to launch your online empire?"`.
- 1-click signup with Google or Email (no credit card required).

### 8. Global Footer
- Links categorized by Product, Solutions, Resources, and Legal.
- System operational status badge (`All systems operational`).
- Language selector widget (`next-google-translate-widget`).
