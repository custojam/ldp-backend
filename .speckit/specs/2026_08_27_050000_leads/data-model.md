# Data Model — Leads

---

## Tables

### `leads`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | int | no | auto | Primary key |
| name | varchar(255) | no | — | Visitor's full name |
| email | varchar(255) | no | — | Normalized to lowercase |
| phone | varchar(255) | no | — | Raw string |
| ipAddress | varchar(45) | no | — | Captured from request headers |
| formId | int | no | — | FK → forms.id |
| formName | varchar(255) | no | — | Snapshot of form name at submission time |
| brokerId | int | yes | null | FK → brokers.id; null if unassigned |
| distributionId | int | yes | null | FK → distributions.id |
| status | enum | no | unsent | `sent`, `unsent`, `duplicate`, `failed` |
| createdAt | datetime | no | now() | Auto-set |
| updatedAt | datetime | no | now() | Auto-updated |

> `formName` is stored directly on the lead (not just via FK) so the historical form name is
> preserved even if the form record is later changed.

**Indexes:**

| Column | Type | Purpose |
|--------|------|---------|
| email | INDEX | Fast duplicate email check |
| brokerId | INDEX | Fast lookup of leads per broker |
| status | INDEX | Fast status filtering |

---

## Prisma Model

```prisma
enum LeadStatus {
  sent
  unsent
  duplicate
  failed
}

model Lead {
  id             Int        @id @default(autoincrement())
  name           String
  email          String
  phone          String
  ipAddress      String     @map("ip_address")
  formId         Int        @map("form_id")
  formName       String     @map("form_name")
  brokerId       Int?       @map("broker_id")
  distributionId Int?       @map("distribution_id")
  status         LeadStatus @default(unsent)
  createdAt      DateTime   @default(now()) @map("created_at")
  updatedAt      DateTime   @updatedAt      @map("updated_at")

  form         Form          @relation(fields: [formId], references: [id])
  broker       Broker?       @relation(fields: [brokerId], references: [id])
  distribution Distribution? @relation(fields: [distributionId], references: [id])

  @@map("leads")
}
```

---

## Status Lifecycle

| Status | Set When |
|--------|----------|
| `sent` | Broker selected successfully |
| `unsent` | No eligible broker at submission time |
| `duplicate` | Email was previously sent to a broker (`status = 'sent'` check) |
| `failed` | Unexpected error during routing |

> **Duplicate check:** Only leads with `status = 'sent'` trigger the duplicate flag. A visitor
> whose previous submission was `unsent` or `failed` is not considered a duplicate.
