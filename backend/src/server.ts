import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { parsePDFFormFields } from './services/PDFParser.js';
import {
  initDatabase,
  insertTemplate,
  findTemplateById,
  insertWorkflow,
  getWorkflowById,
  updateWorkflow,
  logAudit,
  getAuditLog,
  getWorkflowProgress,
} from './services/Database.js';
import { nanoid } from 'nanoid';
import { Role, Workflow } from '../../shared/types.js';


const app = express();
const upload = multer({ dest: 'uploads/' });
await initDatabase();

app.use(cors());
app.use(express.json());

app.post('/api/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const template = await parsePDFFormFields(file.path, file.filename);
    await insertTemplate(template);
    res.status(200).json(template);
  } catch (err) {
    console.error('PDF parsing failed:', err);
    res.status(500).json({ error: 'Failed to parse PDF file', detail: (err as Error).message });
  }
});

app.get('/api/templates/:id', async (req, res) => {
  const template = findTemplateById(req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json(template);
});

app.post('/api/templates/:id', async (req, res) => {
  const template = findTemplateById(req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  Object.assign(template, req.body);
  await insertTemplate(template); // or replace/update logic
  res.json({ message: 'Template updated' });
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads/')));

app.post('/api/workflows', async (req, res) => {
  const { templateId } = req.body;
  const template = findTemplateById(templateId);

  if (!template) return res.status(404).json({ error: 'Template not found' });

  const id = nanoid();
  const participants = {
    agent: { link: `/fill/${id}/agent` },
    buyer: { link: `/fill/${id}/buyer` },
    seller: { link: `/fill/${id}/seller` },
  };

  const workflow: Workflow = {
    id,
    templateId,
    participants,
    status: 'pending',
    responses: {
      agent: [],
      buyer: [],
      seller: [],
    },
  };

  await insertWorkflow(workflow);
  res.status(201).json(workflow);
});

app.get('/api/workflows/:id', (req, res) => {
  const workflow = getWorkflowById(req.params.id);
  if (!workflow) return res.status(404).json({ error: 'Workflow not found' });

  const template = findTemplateById(workflow.templateId);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  const { progress, isComplete } = getWorkflowProgress(template, workflow);

  // update workflow status if complete
  if (isComplete && workflow.status !== 'completed') {
    workflow.status = 'completed';
    updateWorkflow(workflow);
  }

  res.json({
    ...workflow,
    progress,
  });
});

app.post('/api/workflows/:workflowId/submit/:role', async (req, res) => {
  const { workflowId, role } = req.params;
  const workflow = getWorkflowById(workflowId);
  if (!workflow) return res.status(404).json({ error: 'Workflow not found' });

  workflow.responses[role as Role] = req.body.fields;
  await updateWorkflow(workflow);

  res.json({ message: 'Submission saved' });
});

app.post('/api/audit', (req, res) => {
  const { workflowId, role, event } = req.body;
  logAudit({
    workflowId,
    role,
    event,
    timestamp: new Date().toISOString(),
  });
  res.status(201).json({ message: 'Audit logged' });
});

app.get('/api/audit/:workflowId', (req, res) => {
  const log = getAuditLog(req.params.workflowId);
  res.json(log);
});

app.listen(3001, () => console.log('Backend listening on http://localhost:3001'));
