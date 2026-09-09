// In-Memory Reactive Store mirroring postgresql/schema.psql
// Fully powers the Next.js runtime, API routes, and frontends

const initialData = {
  admins: [
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Platform Chief Admin',
      email: 'admin@saasplatform.com',
      passwordHash: '$2b$10$X8m1d16/171O0w6x01oA2.t0j/gT6qH86.4xG8e4C9bBw9l8tqSXe',
      role: 'SUPER_ADMIN',
      isVerified: true,
      twoFactorEnabled: false,
      loginAttempts: 0,
      lockedUntil: null,
      recoveryToken: null,
      isActive: true,
      createdAt: '2026-09-01T00:00:00Z',
    },
  ],
  features: [
    { id: 'f0000000-0000-0000-0000-000000000001', name: 'Drag & Drop Canvas', key: 'drag_drop_builder', description: 'Full visual section reordering and live customizer' },
    { id: 'f0000000-0000-0000-0000-000000000002', name: 'Blogging System', key: 'blog_module', description: 'Publish full case studies, articles, and updates' },
    { id: 'f0000000-0000-0000-0000-000000000003', name: 'Appointment Booking', key: 'appointment_module', description: 'Enable clients to schedule consultation sessions' },
    { id: 'f0000000-0000-0000-0000-000000000004', name: 'Experience Timeline', key: 'experience_module', description: 'Structured career history and achievements roadmap' },
    { id: 'f0000000-0000-0000-0000-000000000005', name: 'Custom Domain Access', key: 'custom_domain', description: 'Connect your personal domain with edge SSL' },
  ],
  packages: [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      name: 'Starter Creator',
      slug: 'starter-creator',
      description: 'Essential toolkit for emerging independent talent.',
      priceInCents: 1500,
      currency: 'USD',
      billingInterval: 'MONTHLY',
      maxPortfolios: 1,
      isActive: true,
      createdAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      name: 'Pro Studio',
      slug: 'pro-studio',
      description: 'Complete power with appointments, blogging, and custom domains.',
      priceInCents: 3500,
      currency: 'USD',
      billingInterval: 'MONTHLY',
      maxPortfolios: 5,
      isActive: true,
      createdAt: '2026-09-01T00:00:00Z',
    },
  ],
  packageFeatures: [
    { id: 'pf-1', packageId: 'b0000000-0000-0000-0000-000000000001', featureId: 'f0000000-0000-0000-0000-000000000001', value: 'true', isEnabled: true },
    { id: 'pf-2', packageId: 'b0000000-0000-0000-0000-000000000001', featureId: 'f0000000-0000-0000-0000-000000000004', value: 'true', isEnabled: true },
    { id: 'pf-3', packageId: 'b0000000-0000-0000-0000-000000000002', featureId: 'f0000000-0000-0000-0000-000000000001', value: 'true', isEnabled: true },
    { id: 'pf-4', packageId: 'b0000000-0000-0000-0000-000000000002', featureId: 'f0000000-0000-0000-0000-000000000002', value: 'true', isEnabled: true },
    { id: 'pf-5', packageId: 'b0000000-0000-0000-0000-000000000002', featureId: 'f0000000-0000-0000-0000-000000000003', value: 'true', isEnabled: true },
    { id: 'pf-6', packageId: 'b0000000-0000-0000-0000-000000000002', featureId: 'f0000000-0000-0000-0000-000000000004', value: 'true', isEnabled: true },
    { id: 'pf-7', packageId: 'b0000000-0000-0000-0000-000000000002', featureId: 'f0000000-0000-0000-0000-000000000005', value: 'true', isEnabled: true },
  ],
  creators: [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Alex Vance',
      email: 'alex.creator@designcraft.com',
      passwordHash: '$2b$10$X8m1d16/171O0w6x01oA2.t0j/gT6qH86.4xG8e4C9bBw9l8tqSXe',
      role: 'creator', // 'creator' or 'manager'
      phone: '+1 555-0199',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isVerified: true,
      createdAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      name: 'Sarah Jenkins',
      email: 'sarah.manager@designcraft.com',
      passwordHash: '$2b$10$X8m1d16/171O0w6x01oA2.t0j/gT6qH86.4xG8e4C9bBw9l8tqSXe',
      role: 'manager', // 'creator' or 'manager'
      phone: '+1 555-0245',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isVerified: true,
      createdAt: '2026-09-01T00:00:00Z',
    },
  ],
  portfolios: [
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      creatorId: 'c0000000-0000-0000-0000-000000000001',
      title: 'Alex Vance – Design Architect & Engineer',
      subdomain: 'alex-design',
      customDomain: 'alexvance.design',
      themeConfig: {
        primaryColor: '#6366f1',
        backgroundColor: '#090d16',
        textColor: '#f8fafc',
        fontFamily: 'Inter',
      },
      isPublished: true,
      createdAt: '2026-09-01T00:00:00Z',
    },
  ],
  subscriptions: [
    {
      id: 's0000000-0000-0000-0000-000000000001',
      creatorId: 'c0000000-0000-0000-0000-000000000001',
      packageId: 'b0000000-0000-0000-0000-000000000002',
      status: 'ACTIVE',
      currentPeriodStart: '2026-09-01T00:00:00Z',
      currentPeriodEnd: '2026-10-01T00:00:00Z',
      cancelAtPeriodEnd: false,
      createdAt: '2026-09-01T00:00:00Z',
    },
  ],
  payments: [
    {
      id: 'p0000000-0000-0000-0000-000000000001',
      creatorId: 'c0000000-0000-0000-0000-000000000001',
      packageId: 'b0000000-0000-0000-0000-000000000002',
      subscriptionId: 's0000000-0000-0000-0000-000000000001',
      amountInCents: 3500,
      currency: 'USD',
      paymentMethod: 'CARD',
      transactionId: 'txn_demo_99881',
      status: 'COMPLETED',
      createdAt: '2026-09-01T12:00:00Z',
    },
  ],
  reports: [
    {
      id: 'r0000000-0000-0000-0000-000000000001',
      reporterName: 'David Miller',
      reporterEmail: 'david@startup.io',
      subject: 'Appointment reminder webhook delivery',
      description: 'Can we receive automated calendar invites via Google Calendar when an appointment is booked?',
      category: 'INTEGRATIONS',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      adminResponse: 'Google Calendar integration is now activated in settings.',
      createdAt: '2026-09-02T10:00:00Z',
    },
  ],
  portfolioSections: [
    {
      id: 'sec-1',
      portfolioId: 'd0000000-0000-0000-0000-000000000001',
      moduleType: 'HERO',
      sortOrder: 0,
      isVisible: true,
      title: 'Hero Introduction',
      contentData: {
        headline: 'Engineering High-Impact Web Software',
        subheadline: 'Full-stack developer and design architect specializing in scalable web systems.',
        ctaText: 'Book an Appointment',
        ctaLink: '#appointment',
      },
      styles: { paddingTop: '80px', paddingBottom: '80px', textAlign: 'center' },
    },
    {
      id: 'sec-2',
      portfolioId: 'd0000000-0000-0000-0000-000000000001',
      moduleType: 'ABOUT',
      sortOrder: 1,
      isVisible: true,
      title: 'About Alex',
      contentData: {
        bio: 'Over 8 years crafting digital products from high-concurrency cloud backends to fluid drag-and-drop interfaces.',
        stats: [
          { label: 'Years Experience', value: '8+' },
          { label: 'Completed Products', value: '42' },
          { label: 'Client Satisfaction', value: '99%' },
        ],
      },
      styles: { paddingTop: '64px', paddingBottom: '64px', textAlign: 'left' },
    },
    {
      id: 'sec-3',
      portfolioId: 'd0000000-0000-0000-0000-000000000001',
      moduleType: 'EXPERIENCE',
      sortOrder: 2,
      isVisible: true,
      title: 'Career Timeline',
      contentData: { heading: 'Work History & Milestones' },
      styles: { paddingTop: '64px', paddingBottom: '64px', textAlign: 'left' },
    },
    {
      id: 'sec-4',
      portfolioId: 'd0000000-0000-0000-0000-000000000001',
      moduleType: 'BLOG',
      sortOrder: 3,
      isVisible: true,
      title: 'Case Studies & Blog',
      contentData: { heading: 'Articles & Architecture Breakdown' },
      styles: { paddingTop: '64px', paddingBottom: '64px', textAlign: 'left' },
    },
    {
      id: 'sec-5',
      portfolioId: 'd0000000-0000-0000-0000-000000000001',
      moduleType: 'APPOINTMENT',
      sortOrder: 4,
      isVisible: true,
      title: 'Schedule Consultation',
      contentData: { heading: 'Book a 1-on-1 Strategy Session' },
      styles: { paddingTop: '64px', paddingBottom: '64px', textAlign: 'center' },
    },
    {
      id: 'sec-6',
      portfolioId: 'd0000000-0000-0000-0000-000000000001',
      moduleType: 'REVIEWS',
      sortOrder: 5,
      isVisible: true,
      title: 'Client Feedback',
      contentData: { heading: 'Verified Reviews & Ratings' },
      styles: { paddingTop: '64px', paddingBottom: '64px', textAlign: 'center' },
    },
    {
      id: 'sec-7',
      portfolioId: 'd0000000-0000-0000-0000-000000000001',
      moduleType: 'CONTACT',
      sortOrder: 6,
      isVisible: true,
      title: 'Get in Touch',
      contentData: { email: 'alex@alexvance.design' },
      styles: { paddingTop: '64px', paddingBottom: '80px', textAlign: 'center' },
    },
  ],
  portfolioBlogs: [
    {
      id: 'b-1',
      portfolioId: 'd0000000-0000-0000-0000-000000000001',
      creatorId: 'c0000000-0000-0000-0000-000000000001',
      title: 'Designing Low-Latency Canvas Engines for the Modern Web',
      slug: 'low-latency-canvas-engines',
      summary: 'How we achieved 60fps drag-and-drop performance without blocking the main browser thread.',
      content: 'Optimistic UI mutations combined with virtualized section trees enable interactive web applications to feel instantaneous. In this post, we explore state reconciliation patterns and PostgreSQL JSONB storage.',
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      isPublished: true,
      publishedAt: '2026-09-02T10:00:00Z',
      createdAt: '2026-09-02T10:00:00Z',
    },
  ],
  portfolioAppointments: [
    {
      id: 'appt-1',
      portfolioId: 'd0000000-0000-0000-0000-000000000001',
      clientName: 'Sarah Lin',
      clientEmail: 'sarah.lin@fintech.co',
      appointmentDate: '2026-09-15',
      timeSlot: '02:00 PM - 02:45 PM',
      status: 'CONFIRMED',
      notes: 'Discussion on SaaS MVP development and architecture review.',
      createdAt: '2026-09-03T11:00:00Z',
    },
  ],
  portfolioExperiences: [
    {
      id: 'exp-1',
      portfolioId: 'd0000000-0000-0000-0000-000000000001',
      company: 'CloudScale Technologies',
      role: 'Principal Software Architect',
      location: 'San Francisco, CA',
      startDate: '2023',
      endDate: 'Present',
      isCurrent: true,
      description: 'Lead development of distributed multi-tenant cloud platforms serving 4M+ daily active sessions.',
      sortOrder: 0,
    },
    {
      id: 'exp-2',
      portfolioId: 'd0000000-0000-0000-0000-000000000001',
      company: 'Studio Precision',
      role: 'Senior Frontend Engineer',
      location: 'New York, NY',
      startDate: '2020',
      endDate: '2023',
      isCurrent: false,
      description: 'Spearheaded canvas drag-and-drop interactions, component libraries, and GraphQL API orchestration.',
      sortOrder: 1,
    },
  ],
  portfolioReviews: [
    {
      id: 'rev-1',
      portfolioId: 'd0000000-0000-0000-0000-000000000001',
      clientName: 'Marcus Thorne',
      clientEmail: 'marcus@vc.com',
      rating: 5,
      reviewTitle: 'Unsurpassed technical and design execution',
      reviewText: 'Alex delivered our complete startup portfolio and appointment booking engine with perfection.',
      status: 'APPROVED',
      createdAt: '2026-09-03T16:00:00Z',
    },
  ],
  themes: [
    {
      id: 't0000000-0000-0000-0000-000000000001',
      name: 'Obsidian Slate',
      slug: 'obsidian-slate',
      description: 'Sleek dark-mode aesthetic tailored for high-end digital architects and lead engineers.',
      category: 'Dark Mode',
      previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      themeConfig: { primaryColor: '#6366f1', backgroundColor: '#090d16', textColor: '#f8fafc', fontFamily: 'Inter' },
      isActive: true,
      isPremium: false,
      portfoliosCount: 14,
    },
    {
      id: 't0000000-0000-0000-0000-000000000002',
      name: 'Cyber Neon',
      slug: 'cyber-neon',
      description: 'High-voltage cyberpunk aesthetics with glowing neon accents and glassmorphic cards.',
      category: 'Creative',
      previewImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
      themeConfig: { primaryColor: '#06b6d4', backgroundColor: '#050814', textColor: '#e2e8f0', fontFamily: 'JetBrains Mono' },
      isActive: true,
      isPremium: true,
      portfoliosCount: 8,
    },
    {
      id: 't0000000-0000-0000-0000-000000000003',
      name: 'Nordic Minimal',
      slug: 'nordic-minimal',
      description: 'Clean, high-whitespace editorial layout designed for creative directors and authors.',
      category: 'Minimal',
      previewImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600',
      themeConfig: { primaryColor: '#10b981', backgroundColor: '#0a0f12', textColor: '#f1f5f9', fontFamily: 'Outfit' },
      isActive: true,
      isPremium: false,
      portfoliosCount: 22,
    },
    {
      id: 't0000000-0000-0000-0000-000000000004',
      name: 'Studio Vanguard',
      slug: 'studio-vanguard',
      description: 'Bold editorial typography with dynamic portfolio carousels and smooth micro-interactions.',
      category: 'Agency',
      previewImage: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600',
      themeConfig: { primaryColor: '#ec4899', backgroundColor: '#0f0715', textColor: '#faf5ff', fontFamily: 'Inter' },
      isActive: true,
      isPremium: true,
      portfoliosCount: 19,
    },
  ],
  contacts: [
    {
      id: 'm0000000-0000-0000-0000-000000000001',
      name: 'Elena Rostova',
      email: 'elena@vanguard-design.de',
      subject: 'Enterprise Custom Domain SLA',
      message: 'Inquiring about multi-tenant custom domain provisioning with dedicated reverse proxy.',
      status: 'REPLIED',
      adminReply: 'Our enterprise tiers support custom SSL edge certificates and dedicated wildcard routing.',
      createdAt: '2026-09-05T14:30:00Z',
    },
    {
      id: 'm0000000-0000-0000-0000-000000000002',
      name: 'Kenji Sato',
      email: 'kenji@tokyocreative.jp',
      subject: 'Team Collaboration and Manager Roles',
      message: 'Can two managers edit the drag and drop canvas simultaneously?',
      status: 'NEW',
      adminReply: null,
      createdAt: '2026-09-08T09:15:00Z',
    },
  ],
  users: [
    {
      id: 'u0000000-0000-0000-0000-000000000001',
      name: 'Liam Parker',
      email: 'liam.reviewer@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      isActive: true,
      isBanned: false,
      reviewsCount: 3,
      commentsCount: 5,
      createdAt: '2026-09-02T12:00:00Z',
    },
    {
      id: 'u0000000-0000-0000-0000-000000000002',
      name: 'Sophia Chen',
      email: 'sophia.designer@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      isActive: true,
      isBanned: false,
      reviewsCount: 1,
      commentsCount: 2,
      createdAt: '2026-09-04T15:20:00Z',
    },
  ],
  spams: [
    {
      id: 'sp-1',
      targetType: 'REVIEW',
      targetId: 'rev_fake_1',
      reporterIp: '192.168.1.105',
      contentSnippet: 'Earn $5000 working from home click this link http://spam.crypto.link',
      reason: 'Automated crypto phishing scam link',
      status: 'BLOCKED',
      createdAt: '2026-09-07T18:00:00Z',
    },
    {
      id: 'sp-2',
      targetType: 'CONTACT',
      targetId: 'm-spam-2',
      reporterIp: '45.33.32.156',
      contentSnippet: 'Bulk backlink sales offer for ranking portfolios fast',
      reason: 'Promotional bulk SEO unsolicited outreach',
      status: 'FLAGGED',
      createdAt: '2026-09-08T11:45:00Z',
    },
  ],
};

if (!globalThis.__saasStoreV3) {
  globalThis.__saasStoreV3 = JSON.parse(JSON.stringify(initialData));
}
for (const key of Object.keys(initialData)) {
  if (!globalThis.__saasStoreV3[key]) {
    globalThis.__saasStoreV3[key] = JSON.parse(JSON.stringify(initialData[key]));
  }
}
const store = globalThis.__saasStoreV3;

export const dbStore = {
  // --- ADMINS ---
  getAdmins: () => store.admins,
  getAdminById: (id) => store.admins.find((a) => a.id === id),
  getAdminByEmail: (email) => store.admins.find((a) => a.email.toLowerCase() === email.toLowerCase()),
  createAdmin: ({ name, email, password, role = 'ADMIN' }) => {
    const existing = dbStore.getAdminByEmail(email);
    if (existing) throw new Error('An admin with this email already exists.');
    const newAdmin = {
      id: 'a' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      name,
      email,
      passwordHash: '$2b$10$X8m1d16/171O0w6x01oA2.t0j/gT6qH86.4xG8e4C9bBw9l8tqSXe',
      role,
      isVerified: true,
      twoFactorEnabled: false,
      loginAttempts: 0,
      lockedUntil: null,
      recoveryToken: null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
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
};
