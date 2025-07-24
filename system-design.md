# 🏗️ Real Estate Form Workflow – System Design

## 🗂️ Folder Structure & Key Design Decisions

```
real-estate-form-workflow/
├── backend/              # Express API server (PDF upload, workflows, audit)
│   ├── services/         # PDFParser, Database (lowdb)
│   ├── uploads/          # Local PDF file storage
│   └── server.ts         # API setup
├── frontend/             # React + Tailwind app
│   ├── pages/            # App, TemplateEditor, FillForm
│   └── components/       # UI components (optional)
├── shared/               # TypeScript models shared across backend/frontend
├── data/                 # lowdb JSON DB
└── system-design.md
```

### Design Highlights

- `lowdb` enables rapid prototyping and local development.
- Monorepo structure with `pnpm` workspaces supports shared types and quick iteration.
- Modular service architecture (e.g., `PDFParser`, `Database`) isolates complexity.
- Frontend route-based separation: `/template/:id` (builder), `/fill/:workflowId/:role` (signer).

---

## 📊 Data Model & Field Structure

### Field

```ts
interface Field {
  id: string;
  label: string;
  type: 'text' | 'checkbox' | 'date' | 'signature';
  role: 'agent' | 'buyer' | 'seller';
  position: { x: number; y: number; page: number };
  value?: string | boolean;
}
```

### Template

```ts
interface Template {
  id: string;
  filename: string;
  pages: number;
  fields: Field[];
}
```

### Workflow

```ts
interface Workflow {
  id: string;
  templateId: string;
  participants: Record<Role, { link: string }>;
  status: 'pending' | 'completed';
  responses: Record<Role, Field[]>;
}
```

### AuditEntry

```ts
interface AuditEntry {
  workflowId: string;
  role: Role;
  event: string;
  timestamp: string;
}
```

---

## ✍️ Signature Integration (Anvil, Dropbox Sign)

- Signature fields are flagged using `type: 'signature'`.
- Final PDFs can be sent to Anvil or Dropbox Sign using:
  - Positional tags (`x/y/page`)
  - Anchor strings
- Recipients can sign via embedded experience or email.
- Webhooks update workflow status and trigger audit logging.
- Flattened signed PDFs can be archived, emailed, or versioned.

---

## 🚀 Scaling the System for Real Clients

### Storage

- Move PDFs to S3 or GCS.
- Serve via signed URLs with short expiry.
- Use CDN (e.g., Cloudflare) for public preview access.

### Database

- Migrate `lowdb` to PostgreSQL (relational) or Firestore (NoSQL).
- Index on fields like `workflowId`, `role`, and `templateId`.

### Performance

- Cache rendered PDF pages as image tiles or base64 data.
- Use Redis for frequently accessed template metadata.

### Security

- Add magic link / token-based auth for recipient login.
- Role-based access control on API endpoints and fields.

### Concurrency

- Prevent duplicate submissions with field-level locking.
- Add revision/versioning for fields to detect overwrite conflicts.

---

## ⏱️ Long-Running Tasks

### PDF Parsing

- Offload parsing (e.g., `pdf-lib`) to a worker queue (BullMQ, SQS).
- Return placeholder response to frontend and poll until ready.

### Email Notifications

- Send role invite emails using Postmark, SendGrid, or SES.
- Queue delivery for async processing.
- Store delivery status in workflow metadata.

### Signature Completion

- Webhook from Anvil or Dropbox Sign updates workflow.
- Trigger downstream actions (PDF flattening, archiving).

### Audit Trails

- Events (e.g., views, changes) sent to `/api/audit`.
- Stored in `lowdb` and retrievable via `/api/audit/:workflowId`.
- Could be streamed to BigQuery or S3 for reporting in production.

---

## ✅ Summary

This system is designed to be extensible, secure, and easy to evolve. It simulates a real-world PDF workflow with:
- Role-based field assignment
- Editable templates
- Audit tracking
- Workflow status and progress monitoring

Future improvements include real-time collaboration, PDF flattening, and production-ready integrations.