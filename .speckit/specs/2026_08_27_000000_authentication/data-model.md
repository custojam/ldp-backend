# Data Model — Authentication

---

## Tables

### `users`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | int | no | auto | Primary key |
| name | varchar(255) | no | — | Display name |
| email | varchar(255) | no | — | Unique; used as login username |
| password | varchar(255) | no | — | bcrypt hash (12 rounds) |
| createdAt | datetime | no | now() | Auto-set by Prisma |
| updatedAt | datetime | no | now() | Auto-updated by Prisma |

**Indexes:**

| Column | Type | Purpose |
|--------|------|---------|
| email | UNIQUE | Enforce unique emails; fast login lookup |

---

## Prisma Model

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String   @default("Admin")
  email     String   @unique
  password  String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  @@map("users")
}
```

---

## Seed

Admin user seeded via `backend/prisma/seed.ts`:

| Field | Value |
|-------|-------|
| name | Admin |
| email | admin@leadplatform.com |
| password | `Admin@123` (hashed with bcrypt, 12 rounds) |
