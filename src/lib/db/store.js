// In-Memory Reactive Store mirroring postgresql/admin.psql
// Fully powers the Next.js runtime, API routes, and frontends

const initialData = {
  admins: [
    {
      id: 1,
      name: 'Super Admin',
      email: 'support@disibin.com',
      password: '123',
      role: 'admin',
      isActive: true,
      twoFactorEnabled: false,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  session: [],
  login_activity: [],
  blogs: [
    {
      id: 1,
      title: 'How to Build a High-Converting Portfolio in 2026',
      slug: 'how-to-build-high-converting-portfolio',
      summary: 'A step-by-step guide to showcasing your work with impact.',
      content: 'Detailed strategies for developers, designers, and creators to establish digital authority...',
      cover_image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
      author_id: 1,
      is_published: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  blogs_image: [
    {
      id: 1,
      blog_id: 1,
      image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
      alt_text: 'Portfolio banner showcase',
      caption: 'Main banner for modern portfolio article',
      created_at: new Date().toISOString(),
    }
  ],
  packages: [
    {
      id: 1,
      name: 'Starter Tier',
      slug: 'starter-tier',
      description: 'Perfect for individual freelancers starting their journey.',
      price_in_cents: 1900,
      currency: 'USD',
      billing_interval: 'MONTHLY',
      max_portfolios: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Professional Pro',
      slug: 'professional-pro',
      description: 'Ideal for power creators, agencies, and studios.',
      price_in_cents: 4900,
      currency: 'USD',
      billing_interval: 'MONTHLY',
      max_portfolios: 5,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  feature: [
    {
      id: 1,
      name: 'Custom Domain Mapping',
      key: 'custom_domain',
      description: 'Connect personal apex domain and custom subdomains.',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Appointment Scheduling',
      key: 'appointments',
      description: 'Direct calendar integration for client bookings.',
      created_at: new Date().toISOString(),
    }
  ],
  packages_feature: [
    {
      id: 1,
      package_id: 1,
      feature_id: 1,
      value: 'true',
      is_enabled: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      package_id: 2,
      feature_id: 2,
      value: 'true',
      is_enabled: true,
      created_at: new Date().toISOString(),
    }
  ],
  package_image: [
    {
      id: 1,
      package_id: 1,
      image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
      alt_text: 'Starter Tier Preview',
      sort_order: 1,
      created_at: new Date().toISOString(),
    }
  ],
  live_chats: [
    {
      id: 1,
      visitor_name: 'Jordan Lee',
      visitor_email: 'jordan@example.com',
      session_id: 'sess_live_101',
      status: 'OPEN',
      ip_address: '192.168.1.10',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  live_chat_messages: [
    {
      id: 1,
      chat_id: 1,
      sender_type: 'VISITOR',
      sender_name: 'Jordan Lee',
      message: 'Hello, can I export my portfolio directly to static HTML?',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      chat_id: 1,
      sender_type: 'ADMIN',
      sender_name: 'Platform Support',
      message: 'Hi Jordan! Yes, export is supported under the Pro package.',
      created_at: new Date().toISOString(),
    }
  ],
  contacts: [
    {
      id: 1,
      name: 'Elena Rostova',
      email: 'elena@studio.design',
      subject: 'Agency Enterprise Plan Inquiry',
      message: 'We manage 50+ portfolios for our clients. Do you offer bulk tier discounts?',
      status: 'NEW',
      admin_reply: null,
      replied_by_admin_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  support: [
    {
      id: 1,
      ticket_number: 'TCK-2026-001',
      requester_name: 'Marcus Chen',
      requester_email: 'marcus@chen.io',
      subject: 'Custom domain DNS verification delayed',
      category: 'TECHNICAL',
      priority: 'HIGH',
      status: 'OPEN',
      assigned_admin_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  support_messages: [
    {
      id: 1,
      support_id: 1,
      sender_type: 'USER',
      sender_id: 101,
      sender_name: 'Marcus Chen',
      message: 'I added the CNAME record 2 hours ago, but SSL cert is still pending.',
      created_at: new Date().toISOString(),
    }
  ],
  support_images: [
    {
      id: 1,
      support_id: 1,
      message_id: 1,
      image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      file_name: 'dns_screenshot.png',
      created_at: new Date().toISOString(),
    }
  ],
  payment: [
    {
      id: 1,
      creator_id: 101,
      package_id: 2,
      subscription_id: 1,
      amount_in_cents: 4900,
      currency: 'USD',
      payment_method: 'STRIPE_CARD',
      transaction_id: 'txn_mock_89234789',
      status: 'COMPLETED',
      created_at: new Date().toISOString(),
    }
  ],
  subscription: [
    {
      id: 1,
      creator_id: 101,
      package_id: 2,
      status: 'ACTIVE',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
      cancel_at_period_end: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  tenant: [
    {
      id: 1,
      creator_id: 101,
      name: 'Marcus Chen Portfolio Space',
      subdomain: 'marcus-chen',
      custom_domain: 'marcuschen.dev',
      theme_config: { primaryColor: '#a1b34c', fontFamily: 'Inter' },
      status: 'ACTIVE',
      storage_used_mb: 42,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  reports: [
    {
      id: 1,
      reporter_name: 'Anonymous Reviewer',
      reporter_email: 'reviewer@moderation.org',
      subject: 'Inappropriate test content on sample portfolio',
      description: 'Reported placeholder copyright infringement on site /marcus-chen.',
      category: 'MODERATION',
      status: 'OPEN',
      priority: 'MEDIUM',
      admin_response: null,
      resolved_by_admin_id: null,
      resolved_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  leads: [
    {
      id: 1,
      name: 'Sarah Connor',
      email: 'sarah@cyberdyne.io',
      phone: '+1 (555) 234-5678',
      company: 'Cyberdyne Systems',
      source: 'GOOGLE_SEARCH',
      status: 'QUALIFIED',
      notes: 'Interested in annual subscription for 20 engineering managers.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  subscribers: [
    {
      id: 1,
      email: 'developer.newsletter@gmail.com',
      status: 'SUBSCRIBED',
      source: 'FOOTER_NEWSLETTER',
      subscribed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
  ],
  themes: [
    {
      id: 1,
      name: 'Minimalist Artisan',
      slug: 'minimalist-artisan',
      description: 'Clean monochrome layout optimized for high readability.',
      category: 'Minimalist',
      preview_image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
      theme_config: { primaryColor: '#1e293b', backgroundColor: '#ffffff', textColor: '#0f172a' },
      is_active: true,
      is_premium: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Modern Executive',
      slug: 'modern-executive',
      description: 'Sleek dark mode theme tailored for senior engineering leadership.',
      category: 'Executive',
      preview_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
      theme_config: { primaryColor: '#a1b34c', backgroundColor: '#090d16', textColor: '#f8fafc' },
      is_active: true,
      is_premium: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  features: [],
  packageFeatures: [],
  creators: [],
  portfolios: [],
  subscriptions: [],
  payments: [],
  portfolioSections: [],
  portfolioBlogs: [],
  portfolioAppointments: [],
  portfolioExperiences: [],
  portfolioReviews: [],
  users: [],
  spams: [],
  portfolioComments: [],
  portfolioBlogComments: [],
  portfolioSkills: [],
  portfolioContacts: [],
  portfolioSettings: [],
};

// Always ensure live reactive store has all collections
if (!globalThis.__saasStoreClean || !globalThis.__saasStoreClean.blogs) {
  globalThis.__saasStoreClean = JSON.parse(JSON.stringify(initialData));
}
const store = globalThis.__saasStoreClean;

export const dbStore = {
  // --- ADMINS ---
  getAdmins: () => store.admins || [],
  getAdminById: (id) => (store.admins || []).find((a) => String(a.id) === String(id)),
  getAdminByEmail: (email) => (store.admins || []).find((a) => a.email.toLowerCase() === email.toLowerCase()),
  createAdmin: ({ name, email, password, role = 'support' }) => {
    const existing = dbStore.getAdminByEmail(email);
    if (existing) throw new Error('An admin with this email already exists.');
    const newAdmin = {
      id: (store.admins?.length || 0) + 1,
      name,
      email,
      password: password,
      role: role,
      isActive: true,
      twoFactorEnabled: false,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!store.admins) store.admins = [];
    store.admins.push(newAdmin);
    return newAdmin;
  },
  recoverAdminPassword: (email) => {
    const admin = dbStore.getAdminByEmail(email);
    if (!admin) throw new Error('Admin not found.');
    admin.recoveryToken = 'rec_' + Math.random().toString(36).substring(2, 10);
    admin.recoveryTokenExpiresAt = new Date(Date.now() + 3600000).toISOString();
    return { success: true, token: admin.recoveryToken };
  },

  // --- PACKAGES & FEATURES ---
  getPackages: () => {
    return store.packages.map((pkg) => {
      const pkgFeats = store.packageFeatures
        .filter((pf) => pf.packageId === pkg.id && pf.isEnabled)
        .map((pf) => {
          const feat = store.features.find((f) => f.id === pf.featureId);
          return { ...pf, feature: feat };
        });
      return { ...pkg, packageFeatures: pkgFeats };
    });
  },
  getFeatures: () => store.features,
  createPackage: (pkgData) => {
    const newPkg = {
      id: 'b' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      currency: 'USD',
      billingInterval: 'MONTHLY',
      maxPortfolios: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      ...pkgData,
      slug: pkgData.name.toLowerCase().replace(/\s+/g, '-'),
    };
    store.packages.push(newPkg);

    // Link default features
    if (pkgData.featureIds && Array.isArray(pkgData.featureIds)) {
      pkgData.featureIds.forEach((fid) => {
        store.packageFeatures.push({
          id: 'pf-' + Math.random().toString(36).substring(2, 8),
          packageId: newPkg.id,
          featureId: fid,
          value: 'true',
          isEnabled: true,
        });
      });
    }
    return newPkg;
  },
  createFeature: (featData) => {
    const feat = {
      id: 'f' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      created_at: new Date().toISOString(),
      ...featData,
      key: featData.name.toLowerCase().replace(/\s+/g, '_'),
    };
    store.features.push(feat);
    return feat;
  },

  // --- SUBSCRIPTIONS & PAYMENTS ---
  getSubscriptions: () => {
    return store.subscriptions.map((s) => ({
      ...s,
      creator: store.creators.find((c) => c.id === s.creatorId),
      package: store.packages.find((p) => p.id === s.packageId),
    }));
  },
  getPayments: () => {
    return store.payments.map((p) => ({
      ...p,
      creator: store.creators.find((c) => c.id === p.creatorId),
      package: store.packages.find((pkg) => pkg.id === p.packageId),
    }));
  },

  // --- CREATOR SUBSCRIPTION PURCHASE & AUTO TENANT CREATION ---
  purchasePackageAndSubscribe: ({ creatorId, packageId, paymentMethod = 'CARD' }) => {
    const creator = store.creators.find((c) => c.id === creatorId);
    const pkg = store.packages.find((p) => p.id === packageId);
    if (!creator || !pkg) throw new Error('Invalid creator or package.');

    const subId = 's' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const newSub = {
      id: subId,
      creatorId,
      packageId,
      status: 'ACTIVE',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: new Date().toISOString(),
    };
    store.subscriptions.push(newSub);

    const payment = {
      id: 'p' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      creatorId,
      packageId,
      subscriptionId: subId,
      amountInCents: pkg.priceInCents,
      currency: pkg.currency || 'USD',
      paymentMethod,
      transactionId: 'txn_' + Date.now(),
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };
    store.payments.push(payment);

    // Auto-create Portfolio Tenant if creator does not already have one
    let portfolio = store.portfolios.find((p) => p.creatorId === creatorId);
    if (!portfolio) {
      const subdomain = creator.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-site';
      portfolio = {
        id: 'd' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        creatorId,
        title: `${creator.name}'s Portfolio`,
        subdomain: subdomain.substring(0, 30),
        customDomain: null,
        themeConfig: {
          primaryColor: '#6366f1',
          backgroundColor: '#090d16',
          textColor: '#f8fafc',
          fontFamily: 'Inter',
        },
        isPublished: true,
        createdAt: new Date().toISOString(),
      };
      store.portfolios.push(portfolio);

      // Seed default canvas sections for this newly created portfolio tenant
      const defaultSections = [
        { moduleType: 'HERO', title: 'Hero Introduction', contentData: { headline: `Welcome to ${creator.name}'s Space`, subheadline: 'Full-stack software portfolio and appointments platform.', ctaText: 'Book Strategy Call', ctaLink: '#appointment' } },
        { moduleType: 'ABOUT', title: 'About Me', contentData: { bio: 'Crafting modern web software with high aesthetic precision and scalable architecture.' } },
        { moduleType: 'EXPERIENCE', title: 'Experience Timeline', contentData: { heading: 'Career History' } },
        { moduleType: 'BLOG', title: 'Articles & Blog', contentData: { heading: 'Recent Case Studies' } },
        { moduleType: 'APPOINTMENT', title: 'Consultation Booking', contentData: { heading: 'Schedule a Consultation' } },
        { moduleType: 'REVIEWS', title: 'Client Reviews', contentData: { heading: 'Testimonials' } },
        { moduleType: 'CONTACT', title: 'Contact', contentData: { email: creator.email } },
      ];
      defaultSections.forEach((s, idx) => {
        store.portfolioSections.push({
          id: 'sec-' + Math.random().toString(36).substring(2, 9),
          portfolioId: portfolio.id,
          moduleType: s.moduleType,
          sortOrder: idx,
          isVisible: true,
          title: s.title,
          contentData: s.contentData,
          styles: { paddingTop: '64px', paddingBottom: '64px', textAlign: 'left' },
        });
      });
    }

    return { subscription: newSub, payment, portfolio };
  },

  // --- REPORTS ---
  getReports: () => store.reports,
  createReport: (reportData) => {
    const rep = {
      id: 'r' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      category: 'GENERAL',
      status: 'OPEN',
      priority: 'MEDIUM',
      adminResponse: null,
      createdAt: new Date().toISOString(),
      ...reportData,
    };
    store.reports.unshift(rep);
    return rep;
  },
  respondToReport: (reportId, { adminResponse, status = 'RESOLVED' }) => {
    const rep = store.reports.find((r) => r.id === reportId);
    if (!rep) throw new Error('Report not found');
    rep.adminResponse = adminResponse;
    rep.status = status;
    rep.resolvedAt = new Date().toISOString();
    return rep;
  },

  // --- CREATORS & MANAGERS ---
  getCreators: () => store.creators,
  getCreatorById: (id) => store.creators.find((c) => c.id === id),
  getCreatorByEmail: (email) => store.creators.find((c) => c.email.toLowerCase() === email.toLowerCase()),
  registerCreator: ({ name, email, password, role = 'creator', phone }) => {
    const existing = dbStore.getCreatorByEmail(email);
    if (existing) throw new Error('An account with this email already exists.');
    const newCreator = {
      id: 'c' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      name,
      email,
      passwordHash: '$2b$10$X8m1d16/171O0w6x01oA2.t0j/gT6qH86.4xG8e4C9bBw9l8tqSXe',
      role, // 'creator' or 'manager'
      phone: phone || '',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      isVerified: true,
      recoveryToken: null,
      createdAt: new Date().toISOString(),
    };
    store.creators.push(newCreator);
    return newCreator;
  },
  recoverCreatorAccount: (email) => {
    const creator = dbStore.getCreatorByEmail(email);
    if (!creator) throw new Error('Creator account not found.');
    creator.recoveryToken = 'rec_' + Math.random().toString(36).substring(2, 10);
    creator.recoveryTokenExpiresAt = new Date(Date.now() + 3600000).toISOString();
    return { success: true, token: creator.recoveryToken };
  },
  updateCreatorRole: (creatorId, role) => {
    const c = store.creators.find((cr) => cr.id === creatorId);
    if (c) {
      c.role = role;
      return c;
    }
    return null;
  },

  // --- PORTFOLIOS (TENANTS) ---
  getPortfolios: () => store.portfolios,
  getPortfolioById: (id) => store.portfolios.find((p) => p.id === id),
  getPortfolioBySubdomain: (subdomain) => {
    return store.portfolios.find(
      (p) => p.subdomain.toLowerCase() === subdomain.toLowerCase()
    );
  },
  getPortfolioByCreatorId: (creatorId) => store.portfolios.find((p) => p.creatorId === creatorId),
  updatePortfolio: (id, updates) => {
    const index = store.portfolios.findIndex((p) => p.id === id);
    if (index === -1) return null;
    store.portfolios[index] = { ...store.portfolios[index], ...updates };
    return store.portfolios[index];
  },

  // --- CANVAS SECTIONS ---
  getSectionsByPortfolioId: (portfolioId) => {
    return store.portfolioSections
      .filter((s) => s.portfolioId === portfolioId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
  updateSectionOrder: (portfolioId, orderedIds) => {
    orderedIds.forEach((id, idx) => {
      const s = store.portfolioSections.find((sec) => sec.id === id && sec.portfolioId === portfolioId);
      if (s) s.sortOrder = idx;
    });
    return dbStore.getSectionsByPortfolioId(portfolioId);
  },
  addSection: (portfolioId, { moduleType, title, contentData, styles }) => {
    const current = dbStore.getSectionsByPortfolioId(portfolioId);
    const newSec = {
      id: 'sec-' + Math.random().toString(36).substring(2, 9),
      portfolioId,
      moduleType,
      sortOrder: current.length,
      isVisible: true,
      title: title || `${moduleType} Section`,
      contentData: contentData || {},
      styles: styles || { paddingTop: '64px', paddingBottom: '64px', textAlign: 'left' },
    };
    store.portfolioSections.push(newSec);
    return newSec;
  },
  updateSection: (id, updates) => {
    const index = store.portfolioSections.findIndex((s) => s.id === id);
    if (index === -1) return null;
    store.portfolioSections[index] = { ...store.portfolioSections[index], ...updates };
    return store.portfolioSections[index];
  },
  deleteSection: (id) => {
    const index = store.portfolioSections.findIndex((s) => s.id === id);
    if (index !== -1) {
      const [removed] = store.portfolioSections.splice(index, 1);
      return removed;
    }
    return null;
  },

  // --- MODULE: BLOGS ---
  getBlogsByPortfolioId: (portfolioId) => {
    return store.portfolioBlogs.filter((b) => b.portfolioId === portfolioId);
  },
  createBlog: (blogData) => {
    const blog = {
      id: 'b-' + Math.random().toString(36).substring(2, 8),
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      isPublished: true,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      ...blogData,
      slug: (blogData.slug || blogData.title).toLowerCase().replace(/[^a-z0-9]/g, '-'),
    };
    store.portfolioBlogs.unshift(blog);
    return blog;
  },
  deleteBlog: (id) => {
    const idx = store.portfolioBlogs.findIndex((b) => b.id === id);
    if (idx !== -1) return store.portfolioBlogs.splice(idx, 1)[0];
    return null;
  },

  // --- MODULE: APPOINTMENTS ---
  getAppointmentsByPortfolioId: (portfolioId) => {
    return store.portfolioAppointments.filter((a) => a.portfolioId === portfolioId);
  },
  bookAppointment: (apptData) => {
    const appt = {
      id: 'appt-' + Math.random().toString(36).substring(2, 8),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      ...apptData,
    };
    store.portfolioAppointments.unshift(appt);
    return appt;
  },
  updateAppointmentStatus: (id, status) => {
    const appt = store.portfolioAppointments.find((a) => a.id === id);
    if (appt) {
      appt.status = status;
      return appt;
    }
    return null;
  },

  // --- MODULE: EXPERIENCES ---
  getExperiencesByPortfolioId: (portfolioId) => {
    return store.portfolioExperiences
      .filter((e) => e.portfolioId === portfolioId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
  createExperience: (expData) => {
    const exp = {
      id: 'exp-' + Math.random().toString(36).substring(2, 8),
      createdAt: new Date().toISOString(),
      ...expData,
    };
    store.portfolioExperiences.push(exp);
    return exp;
  },
  deleteExperience: (id) => {
    const idx = store.portfolioExperiences.findIndex((e) => e.id === id);
    if (idx !== -1) return store.portfolioExperiences.splice(idx, 1)[0];
    return null;
  },

  // --- MODULE: REVIEWS ---
  getReviewsByPortfolioId: (portfolioId) => {
    return store.portfolioReviews.filter((r) => r.portfolioId === portfolioId);
  },
  submitReview: (revData) => {
    const rev = {
      id: 'rev-' + Math.random().toString(36).substring(2, 8),
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      ...revData,
    };
    store.portfolioReviews.unshift(rev);
    return rev;
  },
  moderateReview: (id, status) => {
    const rev = store.portfolioReviews.find((r) => r.id === id);
    if (rev) {
      rev.status = status;
      return rev;
    }
    return null;
  },
  getAllReviews: () => store.portfolioReviews,
  deleteReview: (id) => {
    const idx = store.portfolioReviews.findIndex((r) => r.id === id);
    if (idx !== -1) return store.portfolioReviews.splice(idx, 1)[0];
    return null;
  },

  // --- ADMIN TEAM MANAGEMENT ---
  removeAdmin: (id) => {
    const admins = store.admins;
    if (admins.length <= 1) {
      throw new Error('Cannot remove the last platform administrator.');
    }
    const idx = admins.findIndex((a) => a.id === id);
    if (idx !== -1) return admins.splice(idx, 1)[0];
    return null;
  },
  toggleAdminStatus: (id) => {
    const admin = store.admins.find((a) => a.id === id);
    if (admin) {
      admin.isActive = !admin.isActive;
      return admin;
    }
    return null;
  },

  // --- FEATURES ---
  addFeature: (featData) => {
    const feat = {
      id: 'f' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      ...featData,
    };
    store.features.push(feat);
    return feat;
  },
  deleteFeature: (id) => {
    const idx = store.features.findIndex((f) => f.id === id);
    if (idx !== -1) return store.features.splice(idx, 1)[0];
    return null;
  },

  // --- THEMES ---
  getThemes: () => store.themes || [],
  addTheme: (themeData) => {
    const theme = {
      id: 't' + Math.random().toString(36).substring(2, 9),
      slug: themeData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      isActive: true,
      portfoliosCount: 0,
      createdAt: new Date().toISOString(),
      ...themeData,
    };
    store.themes.push(theme);
    return theme;
  },
  toggleTheme: (id) => {
    const theme = store.themes.find((t) => t.id === id);
    if (theme) {
      theme.isActive = !theme.isActive;
      return theme;
    }
    return null;
  },
  deleteTheme: (id) => {
    const idx = store.themes.findIndex((t) => t.id === id);
    if (idx !== -1) return store.themes.splice(idx, 1)[0];
    return null;
  },

  // --- CONTACTS ---
  getContacts: () => store.contacts || [],
  addContact: (contactData) => {
    const contact = {
      id: 'm' + Math.random().toString(36).substring(2, 9),
      status: 'NEW',
      adminReply: null,
      createdAt: new Date().toISOString(),
      ...contactData,
    };
    store.contacts.unshift(contact);
    return contact;
  },
  replyContact: (id, replyText, adminId) => {
    const contact = store.contacts.find((c) => c.id === id);
    if (contact) {
      contact.adminReply = replyText;
      contact.status = 'REPLIED';
      contact.repliedAt = new Date().toISOString();
      return contact;
    }
    return null;
  },
  archiveContact: (id) => {
    const contact = store.contacts.find((c) => c.id === id);
    if (contact) {
      contact.status = 'ARCHIVED';
      return contact;
    }
    return null;
  },

  // --- REGISTERED USERS ---
  getUsers: () => store.users || [],
  toggleUserStatus: (id) => {
    const user = store.users.find((u) => u.id === id);
    if (user) {
      user.isActive = !user.isActive;
      return user;
    }
    return null;
  },
  banUser: (id, isBanned) => {
    const user = store.users.find((u) => u.id === id);
    if (user) {
      user.isBanned = isBanned;
      return user;
    }
    return null;
  },
  deleteUser: (id) => {
    const idx = store.users.findIndex((u) => u.id === id);
    if (idx !== -1) return store.users.splice(idx, 1)[0];
    return null;
  },

  // --- SPAMS ---
  getSpams: () => store.spams || [],
  resolveSpam: (id) => {
    const spam = store.spams.find((s) => s.id === id);
    if (spam) {
      spam.status = 'RESOLVED';
      return spam;
    }
    return null;
  },
  blockSpam: (id) => {
    const spam = store.spams.find((s) => s.id === id);
    if (spam) {
      spam.status = 'BLOCKED';
      return spam;
    }
    return null;
  },
  deleteSpam: (id) => {
    const idx = store.spams.findIndex((s) => s.id === id);
    if (idx !== -1) return store.spams.splice(idx, 1)[0];
    return null;
  },

  // --- PORTFOLIO BLOG COMMENTS (THREADED) ---
  getBlogComments: (blogId) => {
    return (store.portfolioBlogComments || []).filter((c) => c.blogId === blogId);
  },
  addBlogComment: (commentData) => {
    const comment = {
      id: (store.portfolioBlogComments?.length || 0) + 1,
      isApproved: true,
      isSpam: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId: null,
      ...commentData,
    };
    if (!store.portfolioBlogComments) store.portfolioBlogComments = [];
    store.portfolioBlogComments.push(comment);
    return comment;
  },

  // --- PORTFOLIO SKILLS ---
  getSkillsByPortfolioId: (portfolioId) => {
    return (store.portfolioSkills || [])
      .filter((s) => s.portfolioId === portfolioId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },
  createSkill: (skillData) => {
    const skill = {
      id: (store.portfolioSkills?.length || 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sortOrder: 0,
      proficiency: 80,
      ...skillData,
    };
    if (!store.portfolioSkills) store.portfolioSkills = [];
    store.portfolioSkills.push(skill);
    return skill;
  },
  deleteSkill: (id) => {
    if (!store.portfolioSkills) return null;
    const idx = store.portfolioSkills.findIndex((s) => s.id === id);
    if (idx !== -1) return store.portfolioSkills.splice(idx, 1)[0];
    return null;
  },

  // --- PORTFOLIO CONTACT INQUIRIES ---
  getPortfolioContacts: (portfolioId) => {
    return (store.portfolioContacts || []).filter((c) => c.portfolioId === portfolioId);
  },
  addPortfolioContact: (contactData) => {
    const contact = {
      id: (store.portfolioContacts?.length || 0) + 1,
      isRead: false,
      createdAt: new Date().toISOString(),
      ...contactData,
    };
    if (!store.portfolioContacts) store.portfolioContacts = [];
    store.portfolioContacts.unshift(contact);
    return contact;
  },

  // --- PORTFOLIO SETTINGS ---
  getPortfolioSettings: (portfolioId) => {
    return (store.portfolioSettings || []).find((s) => s.portfolioId === portfolioId) || null;
  },
  updatePortfolioSettings: (portfolioId, settingsData) => {
    if (!store.portfolioSettings) store.portfolioSettings = [];
    const idx = store.portfolioSettings.findIndex((s) => s.portfolioId === portfolioId);
    if (idx !== -1) {
      store.portfolioSettings[idx] = {
        ...store.portfolioSettings[idx],
        ...settingsData,
        updatedAt: new Date().toISOString(),
      };
      return store.portfolioSettings[idx];
    }
    const newSettings = {
      id: store.portfolioSettings.length + 1,
      portfolioId,
      seoTitle: '',
      seoDescription: '',
      googleAnalyticsId: '',
      socialLinks: {},
      customCss: '',
      customJs: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...settingsData,
    };
    store.portfolioSettings.push(newSettings);
    return newSettings;
  },

  // --- GENERIC 20-TABLE ACCESSORS & MUTATORS ---
  getTableRecords: (tableName) => {
    // Map table names to store collection keys
    const map = {
      admin: 'admins',
      admins: 'admins',
      blogs: 'blogs',
      blogs_image: 'blogs_image',
      blog_images: 'blogs_image',
      packages: 'packages',
      feature: 'feature',
      features: 'feature',
      packages_feature: 'packages_feature',
      package_features: 'packages_feature',
      package_image: 'package_image',
      package_images: 'package_image',
      live_chats: 'live_chats',
      live_chat_messages: 'live_chat_messages',
      contacts: 'contacts',
      support: 'support',
      support_messages: 'support_messages',
      support_images: 'support_images',
      payment: 'payment',
      payments: 'payment',
      subscription: 'subscription',
      subscriptions: 'subscription',
      tenant: 'tenant',
      tenants: 'tenant',
      reports: 'reports',
      leads: 'leads',
      subscribers: 'subscribers',
      themes: 'themes',
      session: 'session',
      sessions: 'session',
      login_activity: 'login_activity',
      login_activities: 'login_activity',
    };
    const key = map[tableName] || tableName;
    return store[key] || [];
  },

  addTableRecord: (tableName, data) => {
    const map = {
      admin: 'admins',
      admins: 'admins',
      blogs: 'blogs',
      blogs_image: 'blogs_image',
      blog_images: 'blogs_image',
      packages: 'packages',
      feature: 'feature',
      features: 'feature',
      packages_feature: 'packages_feature',
      package_features: 'packages_feature',
      package_image: 'package_image',
      package_images: 'package_image',
      live_chats: 'live_chats',
      live_chat_messages: 'live_chat_messages',
      contacts: 'contacts',
      support: 'support',
      support_messages: 'support_messages',
      support_images: 'support_images',
      payment: 'payment',
      payments: 'payment',
      subscription: 'subscription',
      subscriptions: 'subscription',
      tenant: 'tenant',
      tenants: 'tenant',
      reports: 'reports',
      leads: 'leads',
      subscribers: 'subscribers',
      themes: 'themes',
      session: 'session',
      sessions: 'session',
      login_activity: 'login_activity',
      login_activities: 'login_activity',
    };
    const key = map[tableName] || tableName;
    if (!store[key]) store[key] = [];
    const newRecord = {
      id: (store[key].length || 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    store[key].unshift(newRecord);
    return newRecord;
  },

  deleteTableRecord: (tableName, id) => {
    const map = {
      admin: 'admins',
      admins: 'admins',
      blogs: 'blogs',
      blogs_image: 'blogs_image',
      blog_images: 'blogs_image',
      packages: 'packages',
      feature: 'feature',
      features: 'feature',
      packages_feature: 'packages_feature',
      package_features: 'packages_feature',
      package_image: 'package_image',
      package_images: 'package_image',
      live_chats: 'live_chats',
      live_chat_messages: 'live_chat_messages',
      contacts: 'contacts',
      support: 'support',
      support_messages: 'support_messages',
      support_images: 'support_images',
      payment: 'payment',
      payments: 'payment',
      subscription: 'subscription',
      subscriptions: 'subscription',
      tenant: 'tenant',
      tenants: 'tenant',
      reports: 'reports',
      leads: 'leads',
      subscribers: 'subscribers',
      themes: 'themes',
      session: 'session',
      sessions: 'session',
      login_activity: 'login_activity',
      login_activities: 'login_activity',
    };
    const key = map[tableName] || tableName;
    if (!store[key]) return false;
    const idx = store[key].findIndex((r) => String(r.id) === String(id));
    if (idx !== -1) {
      store[key].splice(idx, 1);
      return true;
    }
    return false;
  },

  updateTableRecord: (tableName, id, data) => {
    const map = {
      admin: 'admins',
      admins: 'admins',
      blogs: 'blogs',
      blogs_image: 'blogs_image',
      blog_images: 'blogs_image',
      packages: 'packages',
      feature: 'feature',
      features: 'feature',
      packages_feature: 'packages_feature',
      package_features: 'packages_feature',
      package_image: 'package_image',
      package_images: 'package_image',
      live_chats: 'live_chats',
      live_chat_messages: 'live_chat_messages',
      contacts: 'contacts',
      support: 'support',
      support_messages: 'support_messages',
      support_images: 'support_images',
      payment: 'payment',
      payments: 'payment',
      subscription: 'subscription',
      subscriptions: 'subscription',
      tenant: 'tenant',
      tenants: 'tenant',
      reports: 'reports',
      leads: 'leads',
      subscribers: 'subscribers',
      themes: 'themes',
      session: 'session',
      sessions: 'session',
      login_activity: 'login_activity',
      login_activities: 'login_activity',
    };
    const key = map[tableName] || tableName;
    if (!store[key]) return null;
    const idx = store[key].findIndex((r) => String(r.id) === String(id));
    if (idx !== -1) {
      store[key][idx] = {
        ...store[key][idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return store[key][idx];
    }
    return null;
  },
};
