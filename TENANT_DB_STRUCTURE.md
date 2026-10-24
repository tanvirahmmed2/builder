# TENANT_DB_STRUCTURE.md - Tenant Data Model & Relational Tables

This document defines the PostgreSQL relational database schema for tenant-scoped operations, encompassing Portfolio showcases, Multi-Store E-Commerce, Restaurant Cloud POS, and Organization/Team Management.

---

## 1. Tenancy Isolation Principle

Every table in this schema contains a mandatory `tenant_id UUID NOT NULL` column referencing `tenants(id) ON DELETE CASCADE`.
- Every read, update, or delete query **must** include `tenant_id = $1`.
- Compound indexes with `(tenant_id, ...)` are configured on all frequently queried columns.

---

## 2. Tenant Core & Staff Schema

### A. Tenant Members & RBAC (`tenant_members`)
```sql
CREATE TABLE IF NOT EXISTS tenant_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES saas_users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL 
        CHECK (role IN ('owner', 'admin', 'store_manager', 'cashier', 'kitchen_staff', 'hr_manager', 'editor')),
    permissions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_tenant_members_lookup ON tenant_members(tenant_id, user_id);
```

### B. Tenant Branches / Locations (`tenant_branches`)
```sql
CREATE TABLE IF NOT EXISTS tenant_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    phone VARCHAR(50),
    is_main_branch BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenant_branches_tenant ON tenant_branches(tenant_id);
```

---

## 3. Module 1: Portfolio Database Schema

```sql
-- Portfolio Categories
CREATE TABLE IF NOT EXISTS portfolio_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, slug)
);

-- Portfolio Projects & Case Studies
CREATE TABLE IF NOT EXISTS portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES portfolio_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    summary TEXT,
    content_html TEXT,
    featured_image TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    client_name VARCHAR(150),
    live_url TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_portfolio_projects_tenant ON portfolio_projects(tenant_id, order_index);

-- Services Offered
CREATE TABLE IF NOT EXISTS portfolio_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    price_starting NUMERIC(10, 2),
    icon_name VARCHAR(50),
    deliverables JSONB DEFAULT '[]'::jsonb,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contact & Lead Inquiries
CREATE TABLE IF NOT EXISTS portfolio_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_portfolio_inquiries_tenant ON portfolio_inquiries(tenant_id, status);
```

---

## 4. Module 2: Multi-Store E-Commerce Schema

```sql
-- Categories
CREATE TABLE IF NOT EXISTS ecommerce_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES ecommerce_categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    image_url TEXT,
    order_index INT NOT NULL DEFAULT 0,
    UNIQUE(tenant_id, slug)
);

-- Products Catalog
CREATE TABLE IF NOT EXISTS ecommerce_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES ecommerce_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description_html TEXT,
    base_price NUMERIC(10, 2) NOT NULL,
    compare_at_price NUMERIC(10, 2),
    cost_price NUMERIC(10, 2),
    sku VARCHAR(100),
    barcode VARCHAR(100),
    images JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    has_variants BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_ecommerce_products_tenant ON ecommerce_products(tenant_id, is_active);

-- Product Variants (Size, Color, etc.)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES ecommerce_products(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    price NUMERIC(10, 2) NOT NULL,
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Multi-Branch Inventory Stock
CREATE TABLE IF NOT EXISTS inventory_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES tenant_branches(id) ON DELETE CASCADE,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    UNIQUE(tenant_id, variant_id, branch_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS ecommerce_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES tenant_branches(id) ON DELETE SET NULL,
    order_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    shipping_address JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid' 
        CHECK (payment_status IN ('unpaid', 'paid', 'partially_refunded', 'refunded')),
    order_status VARCHAR(30) NOT NULL DEFAULT 'pending' 
        CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, order_number)
);

CREATE INDEX idx_ecommerce_orders_tenant ON ecommerce_orders(tenant_id, order_status, created_at DESC);

-- Order Items
CREATE TABLE IF NOT EXISTS ecommerce_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES ecommerce_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES ecommerce_products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);
```

---

## 5. Module 3: Restaurant & Cloud POS Database Schema

```sql
-- Restaurant Food Menus & Categories
CREATE TABLE IF NOT EXISTS restaurant_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    UNIQUE(tenant_id, slug)
);

-- Food Items
CREATE TABLE IF NOT EXISTS restaurant_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES restaurant_categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    base_price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    dietary_flags JSONB DEFAULT '[]'::jsonb, -- ['vegan', 'halal', 'gluten_free']
    prep_time_minutes INT DEFAULT 15,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_items_tenant ON restaurant_menu_items(tenant_id, category_id, is_available);

-- Modifier Groups (e.g. Size, Toppings)
CREATE TABLE IF NOT EXISTS modifier_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES restaurant_menu_items(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    min_selection INT NOT NULL DEFAULT 0,
    max_selection INT NOT NULL DEFAULT 1,
    is_required BOOLEAN NOT NULL DEFAULT false
);

-- Modifier Options
CREATE TABLE IF NOT EXISTS modifier_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    extra_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- Restaurant Tables & Floor Plan
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES tenant_branches(id) ON DELETE CASCADE,
    table_number VARCHAR(30) NOT NULL,
    zone_name VARCHAR(50) DEFAULT 'Main Dining',
    capacity INT NOT NULL DEFAULT 4,
    qr_code_token VARCHAR(100) UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'available' 
        CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
    UNIQUE(tenant_id, table_number)
);

-- POS Cashier Shifts
CREATE TABLE IF NOT EXISTS pos_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES tenant_branches(id) ON DELETE CASCADE,
    cashier_id UUID NOT NULL REFERENCES saas_users(id),
    opening_cash NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    closing_cash NUMERIC(10, 2),
    cash_sales NUMERIC(10, 2) DEFAULT 0.00,
    card_sales NUMERIC(10, 2) DEFAULT 0.00,
    mobile_sales NUMERIC(10, 2) DEFAULT 0.00,
    total_sales NUMERIC(10, 2) DEFAULT 0.00,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed'))
);

-- POS & Table Orders
CREATE TABLE IF NOT EXISTS pos_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES tenant_branches(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES pos_shifts(id) ON DELETE SET NULL,
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    cashier_id UUID REFERENCES saas_users(id) ON DELETE SET NULL,
    order_number VARCHAR(50) NOT NULL,
    order_type VARCHAR(30) NOT NULL DEFAULT 'dine_in' 
        CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
    subtotal NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    kitchen_status VARCHAR(30) NOT NULL DEFAULT 'pending' 
        CHECK (kitchen_status IN ('pending', 'cooking', 'ready', 'served', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, order_number)
);

CREATE INDEX idx_pos_orders_kitchen ON pos_orders(tenant_id, kitchen_status, created_at);

-- POS Order Items
CREATE TABLE IF NOT EXISTS pos_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES pos_orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES restaurant_menu_items(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    selected_modifiers JSONB DEFAULT '[]'::jsonb,
    kitchen_notes TEXT,
    item_status VARCHAR(30) NOT NULL DEFAULT 'pending'
);
```

---

## 6. Module 4: Organization & Team Schema

```sql
-- Departments
CREATE TABLE IF NOT EXISTS org_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team Members
CREATE TABLE IF NOT EXISTS org_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    designation VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    bio TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_org_members_tenant ON org_members(tenant_id, department_id, order_index);

-- Job Openings
CREATE TABLE IF NOT EXISTS org_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'full_time',
    location VARCHAR(100) NOT NULL DEFAULT 'Remote',
    salary_range VARCHAR(100),
    description_html TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed')),
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, slug)
);

-- Job Applications
CREATE TABLE IF NOT EXISTS org_job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES org_jobs(id) ON DELETE CASCADE,
    candidate_name VARCHAR(150) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    candidate_phone VARCHAR(50),
    resume_url TEXT NOT NULL,
    cover_letter TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'applied' 
        CHECK (status IN ('applied', 'screening', 'interviewing', 'offered', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_applications_job ON org_job_applications(tenant_id, job_id, status);
```
