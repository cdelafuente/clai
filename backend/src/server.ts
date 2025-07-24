import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { parsePDFFormFields } from './services/PDFParser.js';
import { initDatabase, insertTemplate, findTemplateById } from './services/Database.js';


const app = express();
const upload = multer({ dest: 'uploads/' });
await initDatabase();

app.use(cors());
app.use(express.json());

app.post('/api/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  console.log(req.file);

  try {
    const template = await parsePDFFormFields(file.path, file.filename);
    await insertTemplate(template);
    res.status(200).json(template);
  } catch (err) {
    console.error('PDF parsing failed:', err);
    res.status(500).json({ error: 'Failed to parse PDF file', detail: (err as Error).message });
  }
});

app.post('/api/templates/:id', async (req, res) => {
  const template = findTemplateById(req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  Object.assign(template, req.body);
  await insertTemplate(template); // or replace/update logic
  res.json({ message: 'Template updated' });
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads/')));

app.listen(3001, () => console.log('Backend listening on http://localhost:3001'));
