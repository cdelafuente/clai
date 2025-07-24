import { Low } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node'; // For Node.js (LowDB v7)
import path, { join } from 'path';
import type { Template, Workflow, AuditEntry } from '../../../shared/types.js';

interface DBData {
  templates: Template[];
  workflows: Workflow[];
  audits: AuditEntry[];
}

// Ensure data/ directory exists
const dataDir = path.join(process.cwd(), 'backend/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: Low<DBData, unknown>;

export async function initDatabase() {
  const defaultData = { templates: [], workflows: [], audits: [] };
  db = await JSONFilePreset('data/db.json', defaultData)
  return db;
}

export function getTemplates() {
  return db.data!.templates;
}

export async function insertTemplate(template: Template) {
  db.data!.templates.push(template);
  await db.write();
}

export function findTemplateById(id: string): Template | undefined {
  return db.data!.templates.find(t => t.id === id);
}

export function insertWorkflow(workflow: Workflow) {
  db.data!.workflows.push(workflow);
  return db.write();
}

export function getWorkflowById(id: string): Workflow | undefined {
  return db.data!.workflows.find(w => w.id === id);
}

export async function updateWorkflow(workflow: Workflow) {
  const index = db.data!.workflows.findIndex(w => w.id === workflow.id);
  if (index !== -1) {
    db.data!.workflows[index] = workflow;
    await db.write();
  }
}

export function logAudit(entry: AuditEntry) {
  db.data!.audits.push(entry);
  return db.write();
}

export function getAuditLog(workflowId: string): AuditEntry[] {
  return db.data!.audits.filter(a => a.workflowId === workflowId);
}

export function getWorkflowProgress(template: Template, workflow: Workflow) {
  const roles: Role[] = ['agent', 'buyer', 'seller'];

  const progress = roles.map(role => {
    const assigned = template.fields.filter(f => f.role === role);
    const submitted = workflow.responses[role] || [];
    const filled = submitted.filter(f => f.value !== undefined && f.value !== '').length;
    const percent = assigned.length ? Math.round((filled / assigned.length) * 100) : 0;

    return { role, assigned: assigned.length, filled, percent };
  });

  const isComplete = progress.every(p => p.percent === 100);

  return { progress, isComplete };
}
