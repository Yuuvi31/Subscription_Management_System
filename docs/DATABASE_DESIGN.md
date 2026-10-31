# LoopBill Database Design

Target Database: **PostgreSQL (via Supabase)** with **Prisma ORM**.

## Entity Relationship Overview

```
User (Supabase Auth & Profile)
  |-- CustomerProfile (1:1 with User role CUSTOMER)
        |-- Subscriptions (1:N)
        |     |-- SubscriptionLines (1:N) --> Product / Variant
        |     |-- Invoices (1:N)
        |           |-- InvoiceLines (1:N)
        |           |-- Payments (1:N)
        |-- Quotations (1:N)
              |-- QuotationLines (1:N)
```

## Key Tables & Schemas

### 1. `User` (Profile mapped to auth.users.id)
- `id` (UUID, PK)
- `email` (String, unique)
- `name` (String)
- `role` (`ADMIN`, `STAFF`, `CUSTOMER`)
- `createdAt`, `updatedAt`

### 2. `Customer`
- `id` (UUID, PK)
- `userId` (UUID, FK -> User, optional for guest/company contacts)
- `name` (String)
- `email` (String, unique)
- `company` (String)
- `phone` (String)
- `address` (String)
- `status` (`ACTIVE`, `INACTIVE`)
- `createdAt`, `updatedAt`

### 3. `Product` & `ProductVariant`
- `Product`: `id`, `name`, `type` (`SOFTWARE`, `SERVICE`, `ADDON`), `salesPrice` (Decimal), `costPrice` (Decimal), `notes` (String), `status` (`ACTIVE`, `ARCHIVED`)
- `ProductVariant`: `id`, `productId` (FK), `name`, `additionalPrice` (Decimal), `status`

### 4. `Plan`
- `id` (UUID, PK)
- `name` (String)
- `description` (Text)
- `price` (Decimal)
- `billingFrequency` (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`)
- `minQuantity` (Int)
- `availableFrom` (DateTime)
- `availableUntil` (DateTime, nullable)
- `autoClosure` (Boolean)
- `allowEarlyClosure` (Boolean)
- `allowPause` (Boolean)
- `allowRenewal` (Boolean)
- `status` (`ACTIVE`, `ARCHIVED`)

### 5. `Quotation` & `QuotationTemplate`
- `QuotationTemplate`: `id`, `name`, `planId` (FK), `validityDays` (Int), `defaultLines` (JSON)
- `Quotation`: `id`, `quotationNumber` (String, unique), `customerId` (FK), `planId` (FK), `status` (`DRAFT`, `SENT`, `ACCEPTED`, `REJECTED`, `CONVERTED`), `subtotal`, `taxAmount`, `total`, `validUntil`, `paymentTerms`

### 6. `Subscription` & `SubscriptionLine`
- `Subscription`: `id`, `subscriptionNumber` (String, unique), `customerId` (FK), `planId` (FK), `quotationId` (FK, nullable), `status` (`DRAFT`, `QUOTATION`, `CONFIRMED`, `ACTIVE`, `PAUSED`, `CLOSED`), `startDate`, `expiryDate`, `nextBillingDate`, `billingFrequency`, `totalAmount`, `paymentTerms`
- `SubscriptionLine`: `id`, `subscriptionId` (FK), `productId` (FK), `variantId` (FK, nullable), `quantity` (Int), `unitPrice` (Decimal), `taxRate` (Decimal), `amount` (Decimal)

### 7. `Invoice` & `InvoiceLine`
- `Invoice`: `id`, `invoiceNumber` (String, unique), `customerId` (FK), `subscriptionId` (FK, nullable), `issueDate`, `dueDate`, `status` (`DRAFT`, `CONFIRMED`, `PAID`, `CANCELLED`), `subtotal`, `discountAmount`, `taxAmount`, `totalAmount`, `paidAmount`, `outstandingBalance`, `billingPeriodStart`, `billingPeriodEnd`
- `InvoiceLine`: `id`, `invoiceId` (FK), `productId` (FK, nullable), `description`, `quantity`, `unitPrice`, `taxAmount`, `total`

### 8. `Payment`
- `id` (UUID, PK)
- `invoiceId` (FK -> Invoice)
- `customerId` (FK -> Customer)
- `amount` (Decimal)
- `paymentMethod` (`BANK_TRANSFER`, `CREDIT_CARD`, `CASH`, `CHEQUE`)
- `paymentDate` (DateTime)
- `notes` (String)
- `recordedById` (FK -> User)

### 9. `TaxRule` & `DiscountRule`
- `TaxRule`: `id`, `name`, `percentage` (Decimal), `description`, `isDefault`, `active`
- `DiscountRule`: `id`, `name`, `type` (`FIXED`, `PERCENTAGE`), `value` (Decimal), `minPurchase` (Decimal), `minQuantity` (Int), `startDate`, `endDate`, `maxUses` (Int), `currentUses` (Int), `productId` (nullable), `subscriptionWide` (Boolean), `active` (Boolean)
