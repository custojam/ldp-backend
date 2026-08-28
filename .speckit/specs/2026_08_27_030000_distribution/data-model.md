# Data Model — Distribution

---

## Tables

### `distributions`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | int | no | auto | Primary key |
| name | varchar(255) | no | — | Display name for the distribution |
| formId | int | no | — | FK → forms.id; UNIQUE (one distribution per form) |
| createdAt | datetime | no | now() | Auto-set |
| updatedAt | datetime | no | now() | Auto-updated |

**Indexes:**

| Column | Type | Purpose |
|--------|------|---------|
| formId | UNIQUE | Enforce one distribution per form |

---

### `distribution_brokers`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | int | no | auto | Primary key |
| distributionId | int | no | — | FK → distributions.id |
| brokerId | int | no | — | FK → brokers.id |
| percentage | float | no | 0 | Broker's share of leads (e.g. 50.0) |
| isActive | boolean | no | true | Active/inactive **inside this distribution** (separate from broker's global status) |
| createdAt | datetime | no | now() | Auto-set |
| updatedAt | datetime | no | now() | Auto-updated |

**Indexes:**

| Column | Type | Purpose |
|--------|------|---------|
| (distributionId, brokerId) | UNIQUE | No duplicate broker assignments |

---

## Prisma Models

```prisma
model Distribution {
  id        Int      @id @default(autoincrement())
  name      String
  formId    Int      @unique @map("form_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  form                Form                 @relation(fields: [formId], references: [id])
  distributionBrokers DistributionBroker[]
  leads               Lead[]

  @@map("distributions")
}

model DistributionBroker {
  id             Int      @id @default(autoincrement())
  distributionId Int      @map("distribution_id")
  brokerId       Int      @map("broker_id")
  percentage     Float    @default(0)
  isActive       Boolean  @default(true) @map("is_active")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt      @map("updated_at")

  distribution Distribution @relation(fields: [distributionId], references: [id])
  broker       Broker       @relation(fields: [brokerId], references: [id])

  @@unique([distributionId, brokerId])
  @@map("distribution_brokers")
}
```

---

## Constraints

- Only one Distribution record may exist (enforced by `formId @unique` and service-level check).
- A broker can only appear once per distribution (compound unique constraint).
- `isActive` on `DistributionBroker` is independent of the broker's global `isActive` flag — a broker can be globally active but paused within a specific distribution.
