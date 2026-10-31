# LoopBill Database Setup & Schema Management

LoopBill uses PostgreSQL hosted on **Supabase**, with schema managed by **Prisma ORM**.

## Recommended Setup Steps
1. Create a Supabase project named `LoopBill`.
2. Retrieve connection string from **Project Settings → Database → Connection string** (Transaction pooler for `DATABASE_URL`, direct for `DIRECT_URL`).
3. Set up Prisma schema based on [docs/DATABASE_DESIGN.md](../docs/DATABASE_DESIGN.md).
4. Run `npx prisma db push` or `npx prisma migrate dev` from the backend directory.
5. Seed initial admin user and baseline tax/discount definitions.
