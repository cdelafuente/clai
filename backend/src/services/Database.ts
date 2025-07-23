import { Low } from 'lowdb';
import { JSONFile, JSONFilePreset } from 'lowdb/node'; // For Node.js (LowDB v7)
import { join } from 'path';
import type { Template } from '../../../shared/types.js';

interface DBData {
  templates: Template[];
}

let db: Low<DBData, unknown>;

export async function initDatabase() {
  const defaultData = { templates: [] };
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
