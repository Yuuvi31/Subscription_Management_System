import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Customer,
  Product,
  Plan,
  Quotation,
  QuotationTemplate,
  Subscription,
  Invoice,
  Payment,
  TaxRule,
  DiscountRule,
  SupportTicket,
  BillingFrequency,
} from '../types';

interface DataContextType {
  customers: Customer[];
  products: Product[];
  plans: Plan[];
  quotations: Quotation[];
  templates: QuotationTemplate[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  taxes: TaxRule[];
  discounts: DiscountRule[];
  tickets: SupportTicket[];

  // Mutators
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalSubscriptions' | 'activeSubscriptions' | 'outstandingAmount'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;

  addPlan: (plan: Omit<Plan, 'id'>) => Plan;
  updatePlan: (id: string, updates: Partial<Plan>) => void;

  addQuotation: (quote: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt' | 'status'>) => Quotation;
  convertQuotationToSubscription: (quotationId: string) => Subscription | null;

  updateSubscriptionStatus: (subscriptionId: string, status: Subscription['status']) => void;
  renewSubscription: (subscriptionId: string) => void;

  runBillingEngine: () => { generatedCount: number; message: string };

  addPayment: (invoiceId: string, amount: number, method: Payment['method'], note: string) => Payment | null;

  addTax: (tax: Omit<TaxRule, 'id'>) => TaxRule;
  addDiscount: (discount: Omit<DiscountRule, 'id' | 'currentUses'>) => DiscountRule;

  addTicket: (subject: string, category: SupportTicket['category'], priority: SupportTicket['priority'], message: string, customerName?: string) => SupportTicket;
  replyTicket: (ticketId: string, message: string, senderName: string, senderRole: 'ADMIN' | 'STAFF' | 'CUSTOMER') => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;

  resetToCleanState: () => void;
  loadStarterData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CUSTOMERS: 'loopbill_customers',
  PRODUCTS: 'loopbill_products',
  PLANS: 'loopbill_plans',
  QUOTATIONS: 'loopbill_quotations',
  TEMPLATES: 'loopbill_templates',
  SUBSCRIPTIONS: 'loopbill_subscriptions',
  INVOICES: 'loopbill_invoices',
  PAYMENTS: 'loopbill_payments',
  TAXES: 'loopbill_taxes',
  DISCOUNTS: 'loopbill_discounts',
  TICKETS: 'loopbill_tickets',
};

// Default minimal starter plans and products for immediate business readiness
const STARTER_TAXES: TaxRule[] = [
  { id: 'tax-gst18', name: 'GST (18% Goods & Services Tax)', percentage: 18, description: 'Standard rate for software services and SaaS in India', isDefault: true, active: true },
  { id: 'tax-zero', name: 'Zero-Rated / Export (0%)', percentage: 0, description: 'SEZ or international cross-border clients', isDefault: false, active: true },
];

const STARTER_CUSTOMERS: Customer[] = [
  {
    id: 'cust-01',
    name: 'Yuvraj Dutt',
    email: 'yuvraj.dutt@enterprise.in',
    company: 'Apex Technologies Pvt Ltd',
    phone: '+91 98765 43210',
    address: 'DLF Cyber City, Tower B, Gurugram, India',
    status: 'ACTIVE',
    totalSubscriptions: 1,
    activeSubscriptions: 1,
    outstandingAmount: 1450,
    createdAt: '2026-01-15',
  },
];

const STARTER_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    name: 'Brightloop ERP Core License',
    type: 'SOFTWARE',
    salesPrice: 850,
    costPrice: 200,
    notes: 'Primary enterprise resource license per tenant',
    status: 'ACTIVE',
    variants: [
      {
        id: 'var-01',
        productId: 'prod-01',
        name: 'Odoo Brand Connector Edition',
        additionalPrice: 560,
        status: 'ACTIVE',
      },
      {
        id: 'var-02',
        productId: 'prod-01',
        name: 'Standard Cloud Edition',
        additionalPrice: 0,
        status: 'ACTIVE',
      },
    ],
  },
  {
    id: 'prod-02',
    name: 'Priority SLA & Dedicated Support Desk',
    type: 'SERVICE',
    salesPrice: 450,
    costPrice: 80,
    notes: '24/7 technical assistance and phone escalation',
    status: 'ACTIVE',
    variants: [],
  },
];

const STARTER_PLANS: Plan[] = [
  {
    id: 'plan-01',
    name: 'Standard Business Monthly',
    description: 'Monthly commercial license for growing teams',
    price: 1410,
    billingFrequency: 'MONTHLY',
    minQuantity: 1,
    availableFrom: '2026-01-01',
    availableUntil: null,
    autoClosure: false,
    allowEarlyClosure: true,
    allowPause: true,
    allowRenewal: true,
    status: 'ACTIVE',
  },
  {
    id: 'plan-02',
    name: 'Enterprise Annual Suite',
    description: 'Annual corporate subscription with dedicated account manager',
    price: 14500,
    billingFrequency: 'ANNUALLY',
    minQuantity: 1,
    availableFrom: '2026-01-01',
    availableUntil: null,
    autoClosure: false,
    allowEarlyClosure: true,
    allowPause: true,
    allowRenewal: true,
    status: 'ACTIVE',
  },
];

const STARTER_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-01',
    subscriptionNumber: 'SUB-2026-0001',
    customerId: 'cust-01',
    customerName: 'Yuvraj Dutt',
    customerCompany: 'Apex Technologies Pvt Ltd',
    planId: 'plan-01',
    planName: 'Standard Business Monthly',
    startDate: '2026-02-01',
    expiryDate: '2027-01-31',
    nextBillingDate: '2026-11-01',
    billingFrequency: 'MONTHLY',
    amount: 1410,
    status: 'ACTIVE',
    lines: [
      {
        id: 'sl-01',
        productId: 'prod-01',
        productName: 'Brightloop ERP Core License',
        variantName: 'Odoo Brand Connector Edition',
        quantity: 1,
        unitPrice: 1410,
        taxRate: 18,
        amount: 1410,
      },
    ],
    autoClosure: false,
    allowEarlyClosure: true,
    allowPause: true,
    allowRenewal: true,
    paymentTerms: 'NET_30',
  },
];

const STARTER_INVOICES: Invoice[] = [
  {
    id: 'inv-01',
    invoiceNumber: 'INV-2026-0001',
    customerId: 'cust-01',
    customerName: 'Yuvraj Dutt',
    customerEmail: 'yuvraj.dutt@enterprise.in',
    customerCompany: 'Apex Technologies Pvt Ltd',
    customerAddress: 'DLF Cyber City, Tower B, Gurugram, India',
    subscriptionId: 'sub-01',
    subscriptionNumber: 'SUB-2026-0001',
    issueDate: '2026-10-01',
    dueDate: '2026-10-15',
    status: 'CONFIRMED',
    subtotal: 1410,
    discountAmount: 0,
    taxAmount: 253.8,
    total: 1663.8,
    paidAmount: 213.8,
    outstandingBalance: 1450,
    lines: [
      {
        id: 'il-01',
        productId: 'prod-01',
        description: 'Brightloop ERP Core License (Odoo Brand Connector Edition)',
        quantity: 1,
        unitPrice: 1410,
        taxAmount: 253.8,
        total: 1410,
      },
    ],
    billingPeriodStart: '2026-10-01',
    billingPeriodEnd: '2026-10-31',
  },
];

const STARTER_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-01',
    ticketNumber: 'TKT-2026-001',
    customerId: 'cust-01',
    customerName: 'Yuvraj Dutt',
    customerCompany: 'Apex Technologies Pvt Ltd',
    subject: 'Assistance with Odoo connector API webhook endpoint',
    category: 'TECHNICAL',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-28',
    updatedAt: '2026-10-29',
    messages: [
      {
        id: 'msg-01',
        senderName: 'Yuvraj Dutt',
        senderRole: 'CUSTOMER',
        message: 'Hello Brightloop team, our accounting server is getting a 401 when sending payload to the sync webhook.',
        timestamp: '2026-10-28 14:32',
      },
      {
        id: 'msg-02',
        senderName: 'Support Staff (x182)',
        senderRole: 'STAFF',
        message: 'Hi Yuvraj, we checked the endpoint headers and noticed the bearer token format needed updating. Could you test now with the updated token in your dashboard?',
        timestamp: '2026-10-29 09:15',
      },
    ],
  },
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : STARTER_CUSTOMERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : STARTER_PRODUCTS;
  });

  const [plans, setPlans] = useState<Plan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLANS);
    return saved ? JSON.parse(saved) : STARTER_PLANS;
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [templates, setTemplates] = useState<QuotationTemplate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return saved ? JSON.parse(saved) : [];
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    return saved ? JSON.parse(saved) : STARTER_SUBSCRIPTIONS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : STARTER_INVOICES;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [taxes, setTaxes] = useState<TaxRule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TAXES);
    return saved ? JSON.parse(saved) : STARTER_TAXES;
  });

  const [discounts, setDiscounts] = useState<DiscountRule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DISCOUNTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return saved ? JSON.parse(saved) : STARTER_TICKETS;
  });

  // Persist each collection on change
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans)); }, [plans]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations)); }, [quotations]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates)); }, [templates]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions)); }, [subscriptions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TAXES, JSON.stringify(taxes)); }, [taxes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DISCOUNTS, JSON.stringify(discounts)); }, [discounts]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets)); }, [tickets]);

  // Recalculate customer counters (totalSubscriptions, activeSubscriptions, outstandingAmount)
  useEffect(() => {
    if (customers.length === 0) return;
    let hasChanges = false;
    const updated = customers.map((c) => {
      const custSubs = subscriptions.filter((s) => s.customerId === c.id);
      const activeSubs = custSubs.filter((s) => s.status === 'ACTIVE').length;
      const custInvoices = invoices.filter((i) => i.customerId === c.id);
      const outstanding = custInvoices.reduce((acc, inv) => acc + (inv.status !== 'PAID' && inv.status !== 'CANCELLED' ? inv.outstandingBalance : 0), 0);

      if (c.totalSubscriptions !== custSubs.length || c.activeSubscriptions !== activeSubs || c.outstandingAmount !== outstanding) {
        hasChanges = true;
        return {
          ...c,
          totalSubscriptions: custSubs.length,
          activeSubscriptions: activeSubs,
          outstandingAmount: outstanding,
        };
      }
      return c;
    });

    if (hasChanges) {
      setCustomers(updated);
    }
  }, [subscriptions, invoices]);

  // Customer Mutators
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalSubscriptions' | 'activeSubscriptions' | 'outstandingAmount'>): Customer => {
    const newCust: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      outstandingAmount: 0,
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // Product Mutators
  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  // Plan Mutators
  const addPlan = (planData: Omit<Plan, 'id'>): Plan => {
    const newPlan: Plan = {
      ...planData,
      id: `plan-${Date.now()}`,
    };
    setPlans((prev) => [newPlan, ...prev]);
    return newPlan;
  };

  const updatePlan = (id: string, updates: Partial<Plan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  // Quotation Mutators
  const addQuotation = (quoteData: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt' | 'status'>): Quotation => {
    const count = quotations.length + 1;
    const pad = String(count).padStart(4, '0');
    const newQuote: Quotation = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      quotationNumber: `QT-2026-${pad}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'SENT',
    };
    setQuotations((prev) => [newQuote, ...prev]);
    return newQuote;
  };

  const convertQuotationToSubscription = (quotationId: string): Subscription | null => {
    const quote = quotations.find((q) => q.id === quotationId);
    if (!quote) return null;

    const count = subscriptions.length + 1;
    const subNumber = `SUB-2026-${String(count).padStart(4, '0')}`;
    const today = new Date();
    const expiry = new Date();
    expiry.setFullYear(today.getFullYear() + 1);

    const nextBilling = new Date();
    nextBilling.setMonth(today.getMonth() + 1);

    const plan = plans.find((p) => p.id === quote.planId);

    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      subscriptionNumber: subNumber,
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerCompany: quote.customerCompany,
      planId: quote.planId,
      planName: quote.planName,
      startDate: today.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      nextBillingDate: nextBilling.toISOString().split('T')[0],
      billingFrequency: plan?.billingFrequency || 'MONTHLY',
      amount: quote.total,
      status: 'ACTIVE',
      lines: quote.lines.map((l) => ({
        id: `sl-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        productId: l.productId,
        productName: l.productName,
        variantId: l.variantId,
        variantName: l.variantName,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxRate: l.taxRate,
        amount: l.total,
      })),
      autoClosure: plan?.autoClosure ?? false,
      allowEarlyClosure: plan?.allowEarlyClosure ?? true,
      allowPause: plan?.allowPause ?? true,
      allowRenewal: plan?.allowRenewal ?? true,
      paymentTerms: quote.paymentTerms || 'NET_30',
    };

    // Update quotation status to CONVERTED
    setQuotations((prev) => prev.map((q) => (q.id === quotationId ? { ...q, status: 'CONVERTED' } : q)));
    setSubscriptions((prev) => [newSub, ...prev]);

    // Also auto-generate initial invoice for this confirmed subscription
    const invCount = invoices.length + 1;
    const invNumber = `INV-2026-${String(invCount).padStart(4, '0')}`;
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 15);

    const initialInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerEmail: quote.customerEmail,
      customerCompany: quote.customerCompany,
      customerAddress: 'Corporate Office',
      subscriptionId: newSub.id,
      subscriptionNumber: newSub.subscriptionNumber,
      issueDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'CONFIRMED',
      subtotal: quote.subtotal,
      discountAmount: quote.discountAmount,
      taxAmount: quote.taxAmount,
      total: quote.total,
      paidAmount: 0,
      outstandingBalance: quote.total,
      lines: quote.lines.map((l) => ({
        id: `il-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        productId: l.productId,
        description: `${l.productName}${l.variantName ? ` (${l.variantName})` : ''}`,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxAmount: (l.total * (l.taxRate || 18)) / 100,
        total: l.total,
      })),
      billingPeriodStart: today.toISOString().split('T')[0],
      billingPeriodEnd: nextBilling.toISOString().split('T')[0],
    };

    setInvoices((prev) => [initialInvoice, ...prev]);

    return newSub;
  };

  const updateSubscriptionStatus = (subscriptionId: string, status: Subscription['status']) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === subscriptionId ? { ...s, status } : s)));
  };

  const renewSubscription = (subscriptionId: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === subscriptionId) {
          const currentExpiry = new Date(s.expiryDate);
          currentExpiry.setFullYear(currentExpiry.getFullYear() + 1);
          return {
            ...s,
            status: 'ACTIVE',
            expiryDate: currentExpiry.toISOString().split('T')[0],
          };
        }
        return s;
      })
    );
  };

  // Automated Recurring Billing Engine
  const runBillingEngine = (): { generatedCount: number; message: string } => {
    const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE');
    if (activeSubs.length === 0) {
      return {
        generatedCount: 0,
        message: 'Billing run completed: No active subscriptions require invoicing right now.',
      };
    }

    let createdCount = 0;
    const newInvoices: Invoice[] = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    activeSubs.forEach((sub) => {
      // Check if an invoice was already issued for this subscription this month
      const alreadyBilled = invoices.some(
        (inv) =>
          inv.subscriptionId === sub.id &&
          inv.issueDate.startsWith(todayStr.substring(0, 7))
      );

      if (!alreadyBilled) {
        createdCount++;
        const invCount = invoices.length + createdCount;
        const invNumber = `INV-2026-${String(invCount).padStart(4, '0')}`;
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + 15);

        const cust = customers.find((c) => c.id === sub.customerId);
        const subtotal = sub.lines.reduce((acc, l) => acc + l.amount, 0) || sub.amount;
        const taxRate = 18;
        const taxAmount = (subtotal * taxRate) / 100;
        const total = subtotal + taxAmount;

        const newInv: Invoice = {
          id: `inv-${Date.now()}-${createdCount}`,
          invoiceNumber: invNumber,
          customerId: sub.customerId,
          customerName: sub.customerName,
          customerEmail: cust?.email || 'accounts@client.in',
          customerCompany: sub.customerCompany,
          customerAddress: cust?.address || 'Corporate Billing Address',
          subscriptionId: sub.id,
          subscriptionNumber: sub.subscriptionNumber,
          issueDate: todayStr,
          dueDate: dueDate.toISOString().split('T')[0],
          status: 'CONFIRMED',
          subtotal,
          discountAmount: 0,
          taxAmount,
          total,
          paidAmount: 0,
          outstandingBalance: total,
          lines: sub.lines.map((l) => ({
            id: `il-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            productId: l.productId,
            description: `${l.productName}${l.variantName ? ` (${l.variantName})` : ''}`,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            taxAmount: (l.amount * (l.taxRate || 18)) / 100,
            total: l.amount,
          })),
          billingPeriodStart: todayStr,
        };

        newInvoices.push(newInv);
      }
    });

    if (newInvoices.length > 0) {
      setInvoices((prev) => [...newInvoices, ...prev]);
    }

    return {
      generatedCount: createdCount,
      message: `Billing run complete: Checked ${activeSubs.length} active contracts, generated ${createdCount} new tax invoice(s).`,
    };
  };

  // Payment Recording
  const addPayment = (invoiceId: string, amount: number, method: Payment['method'], note: string): Payment | null => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv || amount <= 0) return null;

    const newPayment: Payment = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      customerName: inv.customerName,
      amount,
      method,
      paymentDate: new Date().toISOString().split('T')[0],
      note: note || 'Verified payment ledger entry',
      status: 'COMPLETED',
    };

    const newPaidAmount = inv.paidAmount + amount;
    const newOutstanding = Math.max(0, inv.total - newPaidAmount);
    const newStatus = newOutstanding === 0 ? 'PAID' : 'CONFIRMED';

    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              paidAmount: newPaidAmount,
              outstandingBalance: newOutstanding,
              status: newStatus,
            }
          : i
      )
    );

    setPayments((prev) => [newPayment, ...prev]);
    return newPayment;
  };

  // Tax and Discount Mutators
  const addTax = (taxData: Omit<TaxRule, 'id'>): TaxRule => {
    const newTax: TaxRule = { ...taxData, id: `tax-${Date.now()}` };
    setTaxes((prev) => [newTax, ...prev]);
    return newTax;
  };

  const addDiscount = (discData: Omit<DiscountRule, 'id' | 'currentUses'>): DiscountRule => {
    const newDisc: DiscountRule = { ...discData, id: `disc-${Date.now()}`, currentUses: 0 };
    setDiscounts((prev) => [newDisc, ...prev]);
    return newDisc;
  };

  // Support Tickets
  const addTicket = (
    subject: string,
    category: SupportTicket['category'],
    priority: SupportTicket['priority'],
    message: string,
    customerName: string = 'Customer'
  ): SupportTicket => {
    const count = tickets.length + 1;
    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-2026-${String(count).padStart(4, '0')}`,
      customerId: 'cust-current',
      customerName,
      subject,
      category,
      priority,
      status: 'OPEN',
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderName: customerName,
          senderRole: 'CUSTOMER',
          message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const replyTicket = (ticketId: string, message: string, senderName: string, senderRole: 'ADMIN' | 'STAFF' | 'CUSTOMER') => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderName,
      senderRole,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: senderRole === 'CUSTOMER' ? 'OPEN' : 'IN_PROGRESS',
              messages: [...t.messages, newMsg],
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : t
      )
    );
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString().split('T')[0] } : t))
    );
  };

  // Reset to empty database
  const resetToCleanState = () => {
    setCustomers([]);
    setProducts([]);
    setPlans([]);
    setQuotations([]);
    setSubscriptions([]);
    setInvoices([]);
    setPayments([]);
    setTickets([]);
    setDiscounts([]);
    setTaxes(STARTER_TAXES);
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  };

  // Optional: Clean starter template data if user wants to see an example of real Indian data
  const loadStarterData = () => {
    setCustomers(STARTER_CUSTOMERS);
    setProducts(STARTER_PRODUCTS);
    setPlans(STARTER_PLANS);
    setSubscriptions(STARTER_SUBSCRIPTIONS);
    setInvoices(STARTER_INVOICES);
    setTickets(STARTER_TICKETS);
    setTaxes(STARTER_TAXES);
  };

  return (
    <DataContext.Provider
      value={{
        customers,
        products,
        plans,
        quotations,
        templates,
        subscriptions,
        invoices,
        payments,
        taxes,
        discounts,
        tickets,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addProduct,
        updateProduct,
        addPlan,
        updatePlan,
        addQuotation,
        convertQuotationToSubscription,
        updateSubscriptionStatus,
        renewSubscription,
        runBillingEngine,
        addPayment,
        addTax,
        addDiscount,
        addTicket,
        replyTicket,
        updateTicketStatus,
        resetToCleanState,
        loadStarterData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
