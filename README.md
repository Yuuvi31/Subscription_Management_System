# LOOPBILL — Unified Subscription Management Platform

LoopBill is a professional B2B subscription and recurring billing management platform built for **Brightloop Software**. It replaces fragmented spreadsheets, manual invoice drafting, and bank-statement payment matching with an automated end-to-end system.

---

## 🚀 Key Modules
1. **Authentication & RBAC**: Admin, Staff, and Customer roles with Supabase Auth integration.
2. **Product Catalog**: Products, pricing models, notes, and variants (e.g. brand add-ons).
3. **Plan Management**: Daily, Weekly, Monthly, and Yearly plans with configurable closure, pause, and renewal permissions.
4. **Quotations & Templates**: Multi-step quotation builder and one-click quotation-to-subscription conversion.
5. **Subscription Lifecycle**: `Draft` → `Quotation` → `Confirmed` → `Active` → `Closed`, with pause, resume, and early closure controls.
6. **Recurring Billing Engine**: Automated invoice creation without duplicate billing or skipped periods.
7. **Invoicing & Taxes**: Print-ready invoices, automated tax calculations, and discount rules.
8. **Manual Payment Recording**: Bank transfer, cheque, card, and cash tracking with live balance reconciliation.
9. **Executive Analytics**: Recharts dashboard tracking active subscriptions, revenue trends, outstanding dues, and overdue receivables.
10. **Customer Self-Service Portal**: Customers view active subscriptions, download invoices, and inspect payment receipts.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18 / 19 + TypeScript (Vite)
- **Styling**: Tailwind CSS with custom design tokens
- **Routing**: React Router DOM v6
- **State & Data Fetching**: TanStack Query (React Query)
- **Forms & Validation**: React Hook Form + Zod
- **Icons & Charts**: Lucide React + Recharts
- **HTTP Client**: Axios with Bearer token interceptor
- **Auth Client**: Supabase JavaScript SDK

### Backend (Separately Developed)
- Node.js + Express
- Prisma ORM
- PostgreSQL on Supabase
- Supabase Auth

---

## 📦 Getting Started

### Prerequisites
- Node.js LTS (v20+ or v24+)
- npm (v10+)
- Supabase project credentials (for live mode)

### 1. Setup Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 2. Demo Mode
For standalone testing or presentations without a live backend:
Set `VITE_DEMO_MODE=true` in `frontend/.env`.
- Displays a visible **DEMO MODE** banner in the top navigation.
- Provides sample customers, subscriptions, invoices, and analytics.
- Allows role switching (Admin, Staff, Customer) directly from the UI header to demonstrate workflows.

Set `VITE_DEMO_MODE=false` when connecting to the live Express backend.

---

## 👥 Roles & Permissions
- **Admin**: Full system control (Customers, Staff, Products, Variants, Plans, Quotations, Subscriptions, Invoices, Taxes, Discounts, Reports, Settings).
- **Staff**: Operational access (Customers, Quotations, Subscriptions, Invoices, Payments).
- **Customer**: Self-service portal (My Subscriptions, My Invoices, Payment History, Profile).

---

## 📄 Documentation Links
- [API Contract](docs/API_CONTRACT.md)
- [Database Design](docs/DATABASE_DESIGN.md)
- [Backend README](backend/README.md)
- [Database Setup](database/README.md)
