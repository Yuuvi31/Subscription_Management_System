# LoopBill Backend Service

This backend service is developed with **Node.js + Express + Prisma + PostgreSQL + Supabase Auth**.

## Responsibilities & Financial Authority
The backend is the sole authority for:
- Role verification and RBAC checks (`ADMIN`, `STAFF`, `CUSTOMER`).
- Authoritative financial math (quantities × prices, tax rules, discount validation).
- Subscription state transitions (`DRAFT` → `QUOTATION` → `CONFIRMED` → `ACTIVE` → `CLOSED`).
- Recurring billing runs (automated invoice generation without duplication).
- Invoice status transitions (`DRAFT` → `CONFIRMED` → `PAID`).
- Payment logging and outstanding balance calculation.

## Architecture & Authentication
- Frontend authenticates with Supabase Auth.
- Frontend includes JWT Bearer token in `Authorization: Bearer <token>`.
- Express backend verifies token with Supabase Auth and queries the `users` profile table for role and tenant isolation.

## API Specification
Refer to [docs/API_CONTRACT.md](../docs/API_CONTRACT.md) for endpoint contracts, request payloads, and response envelopes.

## Database Schema
Refer to [docs/DATABASE_DESIGN.md](../docs/DATABASE_DESIGN.md) for Prisma models and relationships.
