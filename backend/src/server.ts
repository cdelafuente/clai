import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { parsePDFFormFields } from './services/PDFParser.js';
import { initDatabase, getTemplates, insertTemplate, findTemplateById } from './services/Database.js';

const app = express();
const upload = multer({ dest: 'uploads/' });
await initDatabase();

app.use(cors());
app.use(express.json());

app.post('/api/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const template = await parsePDFFormFields(file.path, file.originalname);
    await insertTemplate(template);
    res.status(200).json(template);
  } catch (err) {
    console.error('PDF parsing failed:', err);
    res.status(500).json({ error: 'Failed to parse PDF file', detail: (err as Error).message });
  }
});

app.get('/api/templates/:id', async (req, res) => {
  const template = findTemplateById(req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  res.json(template);
});

app.listen(3001, () => console.log('Backend listening on http://localhost:3001'));
