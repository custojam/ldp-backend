# Data Model — Lead Form

---

## Tables

### `forms`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | int | no | auto | Primary key |
| name | varchar(255) | no | — | Display name, e.g. "Lead Registration" |
| slug | varchar(255) | no | — | Unique; URL-safe; e.g. "lead-registration" |
| createdAt | datetime | no | now() | Auto-set |
| updatedAt | datetime | no | now() | Auto-updated |

**Indexes:**

| Column | Type | Purpose |
|--------|------|---------|
| slug | UNIQUE | Enforce unique slugs; fast public form lookup |

---

## Prisma Model

```prisma
model Form {
  id        Int      @id @default(autoincrement())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  distributions Distribution[]
  leads         Lead[]

  @@map("forms")
}
```

---

## Constraints

- Only one Form record may exist in the system at any time.
- Enforced in `formService.createForm()` by calling `getForm()` (`prisma.form.findFirst()`) before insert.
- Slug pattern: `[a-z0-9-]+` (validated server-side with `express-validator`).
