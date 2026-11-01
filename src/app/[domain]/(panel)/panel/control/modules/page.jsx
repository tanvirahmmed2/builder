import { useParams } from 'next/navigation';
'use client'
import React, { useContext } from 'react'
import Link from 'next/link'
import { Context } from '@/components/helper/Context'
import { ROLE_PERMISSIONS } from '../layout'
import { 
  BiCart,
  BiTime,
  BiCheckCircle,
  BiDollarCircle,
  BiHistory,
  BiMessageSquareDetail,
  BiChevronRight,
  BiLoaderAlt,
  BiSolidTruck,
  BiUndo,
  BiHome,
  BiStoreAlt,
  BiUser,
  BiCategory,
  BiTag,
  BiPackage,
  BiFile,
  BiCloudDownload,
  BiCog,
  BiUserVoice,
  BiListUl,
  BiShieldQuarter,
  BiGridAlt,
  BiBriefcase,
  BiDish,
  BiBuilding,
  BiCompass,
  BiBuildingHouse,
  BiBus,
  BiNews,
  BiBookOpen,
  BiPurchaseTag,
  BiGift,
  BiShareAlt,
  BiBookBookmark,
  BiMessageRoundedDots,
  BiBoltCircle,
  BiImage
} from 'react-icons/bi'

const ROLE_TITLES = {
  admin: 'Administrator Console',
  manager: 'Manager Console',
  sales: 'Sales Desk Console',
  staff: 'Staff Console'
}

const ROLE_CENTER_NAMES = {
  admin: 'Administrator Navigation Center',
  manager: 'Manager Navigation Center',
  sales: 'Sales Agent Navigation Center',
  staff: 'Staff Navigation Center'
}

const ALL_MODULE_CARDS = {
  balance: {
    key: 'balance',
    name: 'Balance Management',
    description: 'View current available balance, total income/expenses breakdown, and manage manual deposits.',
    path: 'balance',
    icon: <BiDollarCircle />
  },
  overview: {
    key: 'overview',
    name: 'System Overview',
    description: 'View real-time analytics, overall revenue statistics, order metrics, and business summaries.',
    path: 'overview',
    icon: <BiHome />
  },
  branches: {
    key: 'branches',
    name: 'Branch Outlets',
    description: 'Manage store branches, outlet locations, contact info, and operational settings.',
    path: 'branches',
    icon: <BiStoreAlt />
  },
  people: {
    key: 'people',
    name: 'People & Accounts',
    description: 'Manage staff user accounts, role assignments, access permissions, and user profiles.',
    path: 'people',
    icon: <BiUser />
  },
  category: {
    key: 'category',
    name: 'Product Categories',
    description: 'Organize catalog categories, sub-categories, taxonomies, and visual site groups.',
    path: 'category',
    icon: <BiCategory />
  },
  brands: {
    key: 'brands',
    name: 'Brands & Manufacturers',
    description: 'Manage product brand lists, manufacturer details, logos, and vendor affiliations.',
    path: 'brands',
    icon: <BiTag />
  },
  product: {
    key: 'product',
    name: 'Products Catalog',
    description: 'Create and update products, manage pricing, inventory SKUs, and product assets.',
    path: 'product',
    icon: <BiPackage />
  },
  stock: {
    key: 'stock',
    name: 'Stock & Inventory',
    description: 'Monitor stock levels, low inventory warnings, reorder thresholds, and adjustments.',
    path: 'stock',
    icon: <BiPackage />
  },
  purchase: {
    key: 'purchase',
    name: 'Purchases & Procurement',
    description: 'Create purchase orders, track inbound inventory shipments, and vendor invoices.',
    path: 'purchase',
    icon: <BiDollarCircle />
  },
  supplier: {
    key: 'supplier',
    name: 'Suppliers Directory',
    description: 'Manage vendor contacts, supplier profiles, purchase terms, and supply contracts.',
    path: 'supplier',
    icon: <BiStoreAlt />
  },
  customers: {
    key: 'customers',
    name: 'Customer Directory',
    description: 'View registered customer profiles, purchase history, loyalty metrics, and contacts.',
    path: 'customers',
    icon: <BiUser />
  },
  support: {
    key: 'support',
    name: 'Support Tickets',
    description: 'Handle customer helpdesk tickets, customer service requests, and issue logs.',
    path: 'support',
    icon: <BiMessageSquareDetail />
  },
  contact: {
    key: 'contact',
    name: 'Contact Messages',
    description: 'Review web contact form submissions, customer inquiries, and lead communications.',
    path: 'contact',
    icon: <BiMessageSquareDetail />
  },
  reviews: {
    key: 'reviews',
    name: 'Customer Reviews',
    description: 'Moderate product ratings, customer feedback, and store experience reviews.',
    path: 'reviews',
    icon: <BiUserVoice />
  },
  payments: {
    key: 'payments',
    name: 'Register Payments',
    description: 'Post direct cash collections, mobile banking payments, and invoice receipts.',
    path: 'payments',
    icon: <BiDollarCircle />
  },
  return: {
    key: 'return',
    name: 'Returns & Refunds',
    description: 'Process product returns, restock inventory items, and log customer refunds.',
    path: 'return',
    icon: <BiUndo />
  },
  report: {
    key: 'report',
    name: 'Reports & Analytics',
    description: 'Generate comprehensive financial, sales performance, and operational reports.',
    path: 'report',
    icon: <BiFile />
  },
  backup: {
    key: 'backup',
    name: 'System Backups',
    description: 'Export database snapshots, system data archives, and recovery backups.',
    path: 'backup',
    icon: <BiCloudDownload />
  },
  settings: {
    key: 'settings',
    name: 'Platform Settings',
    description: 'Configure store parameters, tax policies, payment methods, and system preferences.',
    path: 'settings',
    icon: <BiCog />
  },
  sale: {
    key: 'sale',
    name: 'Create Invoice Sale',
    description: 'Generate new POS checkouts, assign customer cards, and register transactions.',
    path: 'sale',
    icon: <BiCart />
  },
  'pending-sale': {
    key: 'pending-sale',
    name: 'Pending Sales Orders',
    description: 'Review cash-on-delivery orders waiting for dispatch confirmation or payments.',
    path: 'pending-sale',
    icon: <BiTime />
  },
  'confirmed-sale': {
    key: 'confirmed-sale',
    name: 'Confirmed Orders',
    description: 'Review and process confirmed orders, dispatch for delivery, or fulfill directly.',
    path: 'confirmed-sale',
    icon: <BiCheckCircle />
  },
  out_for_delivery: {
    key: 'out_for_delivery',
    name: 'Out for Delivery',
    description: 'Manage orders currently with couriers. Update delivery status or process returns.',
    path: 'out_for_delivery',
    icon: <BiSolidTruck />
  },
  'completed-sale': {
    key: 'completed-sale',
    name: 'Completed Orders',
    description: 'Track finalized invoices, transaction receipts, and order histories.',
    path: 'completed-sale',
    icon: <BiCheckCircle />
  },
  'returned-sale': {
    key: 'returned-sale',
    name: 'Returned Orders',
    description: 'Review returned sales orders where products were restocked and order amounts set to zero.',
    path: 'returned-sale',
    icon: <BiUndo />
  },
  history: {
    key: 'history',
    name: 'My Sales History',
    description: 'Check personal checkouts ledger history and transaction logs.',
    path: 'history',
    icon: <BiHistory />
  },
  issue: {
    key: 'issue',
    name: 'Report Technical Issue',
    description: 'Submit issue tickets, system bugs, or catalog reports to management board.',
    path: 'issue',
    icon: <BiMessageSquareDetail />
  },
  profile: {
    key: 'profile',
    name: 'My Account Profile',
    description: 'View and update personal profile, security details, and staff credentials.',
    path: 'profile',
    icon: <BiUser />
  },
  orders: {
    key: 'orders',
    name: 'Order Management',
    description: 'Browse, filter, and track all incoming customer order statuses and updates.',
    path: 'orders',
    icon: <BiListUl />
  },
  'activity-logs': {
    key: 'activity-logs',
    name: 'Login & Activity Logs',
    description: 'Audit system login history, staff access logs, client IP addresses, and device user-agents.',
    path: 'activity-logs',
    icon: <BiShieldQuarter />
  },
  investor: {
    key: 'investor',
    name: 'Investors Management',
    description: 'Manage capital investors, funding profiles, contact details, and account statuses.',
    path: 'investor',
    icon: <BiUser />
  },
  investments: {
    key: 'investments',
    name: 'Investments System',
    description: 'Record capital injections, bank transfers, and investor equity additions.',
    path: 'investments',
    icon: <BiDollarCircle />
  },
  withdrawals: {
    key: 'withdrawals',
    name: 'Capital Withdrawals',
    description: 'Track money withdrawals, profit distributions, and capital returns.',
    path: 'withdrawals',
    icon: <BiUndo />
  },
  profits: {
    key: 'profits',
    name: 'Investor Profits',
    description: 'Manage daily gross profit allocations based on equity share percentages.',
    path: 'profits',
    icon: <BiDollarCircle />
  },
  salaries: {
    key: 'salaries',
    name: 'Salary Structures',
    description: 'Configure grade structures, base salary levels, allowances, and deductions.',
    path: 'salaries',
    icon: <BiDollarCircle />
  },
  'staff-salaries': {
    key: 'staff-salaries',
    name: 'Staff Salary Assignments',
    description: 'Assign salary structures to staff members and manage effective dates.',
    path: 'staff-salaries',
    icon: <BiUser />
  },
  'salary-payments': {
    key: 'salary-payments',
    name: 'Salary Payments Management',
    description: 'Disburse staff salaries, generate monthly payroll entries, and record payments.',
    path: 'salary-payments',
    icon: <BiFile />
  },
  'my-salary': {
    key: 'my-salary',
    name: 'My Salary & Payments',
    description: 'View your assigned salary structure, allowance breakdown, and payment history.',
    path: 'my-salary',
    icon: <BiDollarCircle />
  },
  portfolio: {
    key: 'portfolio',
    name: 'Portfolio Showcase',
    description: 'Showcase projects, portfolio galleries, client case studies, skills, and service tiers.',
    path: 'portfolio',
    icon: <BiBriefcase />
  },
  restaurant: {
    key: 'restaurant',
    name: 'Restaurant & POS/KDS',
    description: 'Digital food menus, table reservations, floor plans, and live Kitchen Display System (KDS).',
    path: 'restaurant',
    icon: <BiDish />
  },
  organization: {
    key: 'organization',
    name: 'Organization & HR Directory',
    description: 'Departments, team member profiles, career job postings, and employee leave requests.',
    path: 'organization',
    icon: <BiBuilding />
  },
  tours: {
    key: 'tours',
    name: 'Tours & Travel Management',
    description: 'Curate vacation packages, sightseeing destinations, and passenger booking manifests.',
    path: 'tours',
    icon: <BiCompass />
  },
  'real-estate': {
    key: 'real-estate',
    name: 'Real Estate & Properties',
    description: 'Residential & commercial property listings, developments, agents, and viewing appointments.',
    path: 'real-estate',
    icon: <BiBuildingHouse />
  },
  transport: {
    key: 'transport',
    name: 'Transport & Fleet Logistics',
    description: 'Transit routes, vehicle fleet, trip departures schedules, and passenger ticket bookings.',
    path: 'transport',
    icon: <BiBus />
  },
  blogs: {
    key: 'blogs',
    name: 'Articles & Blog Publishing',
    description: 'Publish blog articles, brand stories, SEO guides, and manage reader comments.',
    path: 'blogs',
    icon: <BiNews />
  },
  tutorials: {
    key: 'tutorials',
    name: 'Tutorials & Knowledge Base',
    description: 'Create step-by-step guides, user tutorials, FAQs, and structured learning paths.',
    path: 'tutorials',
    icon: <BiBookOpen />
  },
  coupons: {
    key: 'coupons',
    name: 'Discount Coupons & Promos',
    description: 'Create promotional voucher codes, percentage discounts, minimum spends, and limits.',
    path: 'coupons',
    icon: <BiPurchaseTag />
  },
  loyalty: {
    key: 'loyalty',
    name: 'Customer Loyalty & Points',
    description: 'Reward repeat buyers with points, VIP membership tier perks, and automated discounts.',
    path: 'loyalty',
    icon: <BiGift />
  },
  affiliates: {
    key: 'affiliates',
    name: 'Affiliates & Referral Marketing',
    description: 'Onboard affiliate partners, track referral commissions, and disburse payout balances.',
    path: 'affiliates',
    icon: <BiShareAlt />
  },
  'tali-khata': {
    key: 'tali-khata',
    name: 'Tali Khata Digital Ledger',
    description: 'Maintain customer credit dues (baki/khoroch), vendor balances, and payment records.',
    path: 'tali-khata',
    icon: <BiBookBookmark />
  },
  'meta-inbox': {
    key: 'meta-inbox',
    name: 'Meta & Social Channels Inbox',
    description: 'Unified social inbox for Facebook Messenger, Instagram DMs, and WhatsApp chats.',
    path: 'meta-inbox',
    icon: <BiMessageRoundedDots />
  },
  automation: {
    key: 'automation',
    name: 'Enterprise Automation & Hooks',
    description: 'Trigger workflows on business events and stream real-time webhooks to external services.',
    path: 'automation',
    icon: <BiBoltCircle />
  },
  media: {
    key: 'media',
    name: 'Media Library & Files',
    description: 'Manage centralized photos, logos, banners, documents, and asset URLs.',
    path: 'media',
    icon: <BiImage />
  }
}

export default function DashboardModulesPage() {
  const params = useParams();
  const domain = params?.domain || '';
  const basePath = domain ? `/${domain}/panel/control` : '/panel/control';

  const { user, loading, dashSidebar, logout } = useContext(Context)

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <BiLoaderAlt className="animate-spin text-4xl text-slate-800" />
          <p className="text-slate-600 text-sm font-semibold animate-pulse">Loading module center...</p>
        </div>
      </div>
    )
  }

  const role = user?.role || 'staff'
  const allowedKeys = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.staff
  const centerName = ROLE_CENTER_NAMES[role] || 'Staff Navigation Center'

  const moduleCards = allowedKeys
    .map(key => ALL_MODULE_CARDS[key])
    .filter(Boolean)

  return (
    <div className={`w-full min-h-screen bg-slate-50 pt-20 pb-12 px-4 md:px-8 transition-all duration-300 ${dashSidebar ? 'lg:pl-64' : 'lg:pl-8'}`}>
      <div className="w-full flex flex-col gap-8">
        
        <div className="bg-white border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary text-white flex items-center justify-center text-2xl font-bold">
              <BiGridAlt />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Module Navigation Center
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.name || 'Staff'} ({user?.role?.toUpperCase()})</p>
            </div>
          </div>

          <div className="flex flex-col gap-1 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 text-xs text-slate-500 font-medium">
            <div><span className="font-bold text-slate-700">Email:</span> {user?.email || 'N/A'}</div>
            <div><span className="font-bold text-slate-700">Phone:</span> {user?.phone || 'N/A'}</div>
            <button 
              onClick={() => logout()}
              className="mt-2 text-xs font-bold text-rose-600 hover:underline text-left cursor-pointer"
            >
              Logout Session
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-800 mb-6">{centerName}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moduleCards.map((link) => (
              <div 
                key={link.key}
                className="bg-white border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition group"
              >
                <div>
                  <div className="w-10 h-10 flex items-center justify-center text-xl mb-4 text-white font-bold bg-primary">
                    {link.icon}
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">{link.name}</h3>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                    {link.description}
                  </p>
                </div>
                
                <Link 
                  href={`${basePath}/${link.path}`} 
                  className="mt-6 flex items-center gap-1.5 font-bold text-xs hover:gap-2.5 transition-all text-primary"
                >
                  Access Module <BiChevronRight className="text-base" />
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
