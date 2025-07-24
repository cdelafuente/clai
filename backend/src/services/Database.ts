import { Low } from 'lowdb';
import { JSONFile, JSONFilePreset } from 'lowdb/node'; // For Node.js (LowDB v7)
import { join } from 'path';
import type { Template, Workflow, AuditEntry } from '../../../shared/types.js';

interface DBData {
  templates: Template[];
  workflows: Workflow[];
  audits: AuditEntry[];
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
