export type Role = 'agent' | 'buyer' | 'seller';

export interface Field {
  id: string;
  label: string;
  type: 'text' | 'checkbox' | 'date' | 'signature';
  role: Role;
  position: { x: number; y: number; page: number };
  value?: string | boolean;
}

export interface Template {
  id: string;
  filename: string;
  pages: number;
  fields: Field[];
}

export interface Workflow {
  id: string;
  templateId: string;
  participants: Record<Role, { link: string }>;
  status: 'pending' | 'completed';
  responses: Record<Role, Field[]>;
}

export interface AuditEntry {
  workflowId: string;
  role: Role;
  event: string;
  timestamp: string;
}