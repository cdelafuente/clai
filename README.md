# 🏡 Clai Coding Challenge
This project simulates a real estate document workflow system where agents, buyers, and sellers can fill out PDF forms online. It includes features like PDF upload, form field detection, role-based assignment, fillable links, audit logging, and workflow progress tracking.

---

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + TailwindCSS + React Router
- **Backend**: Node.js + Express + lowdb
- **PDF Parsing**: `pdf-lib`, `pdfjs-dist`
- **File Uploads**: `multer`
- **Database**: `lowdb` (JSON-based for simplicity)

---

## 📦 Prerequisites

- Node.js ≥ 18
- pnpm (recommended)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/cdelafuente/clai.git
cd clai
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start the Backend

```bash
pnpm --filter backend dev
```

Backend will start at [http://localhost:3001](http://localhost:3001)

### 4. Start the Frontend

```bash
pnpm --filter frontend dev
```

Frontend will start at [http://localhost:5173](http://localhost:5173)

---

## 📂 Folder Structure

```
real-estate-form-workflow/
├── backend/          # Express.js backend
    ├── uploads/      # PDF file uploads
├── frontend/         # React frontend with Vite
├── shared/           # Shared TypeScript types
├── data/             # lowdb JSON store
└── README.md
```

---

## ✅ Features

- Upload PDF and auto-detect form fields
- Assign each field to agent, buyer, or seller
- Generate unique fill links per role
- Track audit events: views, edits, submissions
- Track per-role progress and form completion
- Visual template editor with live overlay

---

## 📤 API Overview

- `POST /api/upload` — Upload a PDF and detect fields
- `GET /api/templates/:id` — Get parsed template
- `POST /api/templates/:id` — Update field types or roles
- `POST /api/workflows` — Create a new workflow
- `GET /api/workflows/:id` — Get workflow + progress
- `POST /api/workflows/:id/submit/:role` — Submit role's filled fields
- `GET /api/audit/:workflowId` — Get audit log for a workflow

---

## 🧪 Sample Flow

1. Upload a PDF
2. Assign fields in the template editor (`/template/:id`)
3. Create a workflow
4. Share fill links (`/fill/:workflowId/:role`)
5. Recipients complete their sections
6. Monitor audit logs and completion status
