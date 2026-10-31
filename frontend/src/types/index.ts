export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  customerId?: string;
}

export type SubscriptionStatus = 'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'BANK_TRANSFER' | 'CREDIT_CARD' | 'CASH' | 'CHEQUE';
export type BillingFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type ProductType = 'SOFTWARE' | 'SERVICE' | 'ADDON';
export type DiscountType = 'FIXED' | 'PERCENTAGE';

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalSubscriptions: number;
  activeSubscriptions: number;
  outstandingAmount: number;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  additionalPrice: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  salesPrice: number;
  costPrice: number;
  notes: string;
  status: 'ACTIVE' | 'ARCHIVED';
  variants?: ProductVariant[];
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingFrequency: BillingFrequency;
  minQuantity: number;
  availableFrom: string;
  availableUntil?: string | null;
  autoClosure: boolean;
  allowEarlyClosure: boolean;
  allowPause: boolean;
  allowRenewal: boolean;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface QuotationLine {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerCompany: string;
  templateId?: string;
  templateName?: string;
  planId: string;
  planName: string;
  lines: QuotationLine[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentTerms: string;
  createdAt: string;
  validUntil: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED';
}

export interface QuotationTemplate {
  id: string;
  name: string;
  planId: string;
  planName: string;
  validityDays: number;
  defaultLines: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
}

export interface SubscriptionLine {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export interface Subscription {
  id: string;
  subscriptionNumber: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  planId: string;
  planName: string;
  startDate: string;
  expiryDate: string;
  nextBillingDate: string;
  billingFrequency: BillingFrequency;
  amount: number;
  status: SubscriptionStatus;
  lines: SubscriptionLine[];
  autoClosure: boolean;
  allowEarlyClosure: boolean;
  allowPause: boolean;
  allowRenewal: boolean;
  paymentTerms: string;
}

export interface InvoiceLine {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerCompany: string;
  customerAddress: string;
  subscriptionId?: string;
  subscriptionNumber?: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  outstandingBalance: number;
  lines: InvoiceLine[];
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  note: string;
  status: 'COMPLETED' | 'REFUNDED';
}

export interface TaxRule {
  id: string;
  name: string;
  percentage: number;
  description: string;
  isDefault: boolean;
  active: boolean;
}

export interface DiscountRule {
  id: string;
  name: string;
  type: DiscountType;
  value: number;
  minPurchase: number;
  minQuantity?: number;
  startDate: string;
  endDate: string;
  maxUses: number;
  currentUses: number;
  productId?: string;
  productName?: string;
  subscriptionWide: boolean;
  active: boolean;
}

export interface DashboardSummary {
  activeSubscriptionsCount: number;
  revenueCollected: number;
  outstandingBalance: number;
  overdueInvoicesCount: number;
  revenueTrend: {
    date: string;
    revenue: number;
    invoicesCount: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
    color: string;
  }[];
  recentInvoices: Invoice[];
  recentPayments: Payment[];
  upcomingRenewals: Subscription[];
  overdueInvoicesList: Invoice[];
}

export type TicketCategory = 'BILLING' | 'SUBSCRIPTION' | 'TECHNICAL' | 'GENERAL';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

