# LoopBill API Contract

This document defines the REST API contract between the **React Frontend** and the **Node.js/Express Backend**.

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://api.loopbill.example.com/api`

## Authentication Header
All authenticated requests must include:
```http
Authorization: Bearer <supabase_access_token>
```

## Standard Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable message",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Detailed error description",
    "details": []
  }
}
```

---

## 1. Authentication & Identity
### `GET /api/me`
Returns current authenticated user profile and role (`ADMIN`, `STAFF`, `CUSTOMER`).

---

## 2. Dashboard & Analytics
### `GET /api/dashboard/summary`
Query params: `period=7d | 30d | 90d | custom`, `startDate`, `endDate`.
Returns:
- `activeSubscriptionsCount`: number
- `revenueCollected`: number
- `outstandingBalance`: number
- `overdueInvoicesCount`: number
- `revenueTrend`: array of `{ date, revenue, invoicesCount }`
- `statusDistribution`: array of `{ status, count }`
- `recentInvoices`: array
- `recentPayments`: array
- `upcomingRenewals`: array
- `overdueInvoices`: array

---

## 3. Customers
### `GET /api/customers`
Query params: `page`, `limit`, `search`, `status`
### `POST /api/customers`
Payload: `{ name, email, company, phone, address, taxId }`
### `GET /api/customers/:id`
Returns customer profile, subscription summary, recent invoices, and payment history.

---

## 4. Products & Variants
### `GET /api/products`
Query params: `search`, `status`
### `POST /api/products`
Payload: `{ name, type, salesPrice, costPrice, notes, status }`
### `POST /api/products/:id/variants`
Payload: `{ name, additionalPrice, status }`

---

## 5. Subscription Plans
### `GET /api/plans`
Query params: `billingFrequency`, `status`
### `POST /api/plans`
Payload:
```json
{
  "name": "Standard Business Monthly",
  "description": "Full access to core suite",
  "price": 499.00,
  "billingFrequency": "MONTHLY", // DAILY | WEEKLY | MONTHLY | YEARLY
  "minQuantity": 1,
  "availableFrom": "2026-01-01",
  "availableUntil": null,
  "autoClosure": false,
  "allowEarlyClosure": true,
  "allowPause": true,
  "allowRenewal": true
}
```

---

## 6. Quotation Templates & Quotations
### `GET /api/quotation-templates`
### `POST /api/quotation-templates`
Payload: `{ name, planId, defaultProducts: [{ productId, variantId, quantity }], validityDays }`
### `GET /api/quotations`
### `POST /api/quotations`
Payload:
```json
{
  "customerId": "uuid",
  "templateId": "uuid-optional",
  "planId": "uuid",
  "lines": [
    { "productId": "uuid", "variantId": "uuid-optional", "quantity": 5 }
  ],
  "paymentTerms": "NET_30",
  "validityDays": 15
}
```
### `POST /api/quotations/:id/confirm`
Converts quotation into a confirmed subscription.

---

## 7. Subscriptions
### `GET /api/subscriptions`
Query params: `page`, `limit`, `status`, `customerId`, `search`
### `GET /api/subscriptions/:id`
Detailed subscription record with lines, invoices, and activity logs.
### `POST /api/subscriptions/:id/pause`
### `POST /api/subscriptions/:id/resume`
### `POST /api/subscriptions/:id/close`
### `POST /api/subscriptions/:id/renew`

---

## 8. Billing Run
### `POST /api/billing/run`
Authoritative server endpoint that checks due subscriptions and generates invoices without skipping or duplicate billing.

---

## 9. Invoices
### `GET /api/invoices`
Query params: `page`, `limit`, `status`, `customerId`, `search`, `overdue`
### `GET /api/invoices/:id`
Detailed print-ready invoice data with subtotal, discounts, taxes, paid amount, and outstanding amount.
### `POST /api/invoices/:id/confirm`
### `POST /api/invoices/:id/cancel`
### `POST /api/invoices/:id/send`

---

## 10. Taxes & Discounts
### `GET /api/taxes` & `POST /api/taxes`
Payload: `{ name, percentage, description, isDefault, active }`
### `GET /api/discounts` & `POST /api/discounts`
Payload: `{ name, type: "FIXED"|"PERCENTAGE", value, minPurchase, startDate, endDate, maxUses, productId, active }`

---

## 11. Payments
### `GET /api/payments`
### `POST /api/invoices/:id/payments`
Payload: `{ amount, method: "BANK_TRANSFER"|"CREDIT_CARD"|"CASH"|"CHEQUE", paymentDate, note }`
