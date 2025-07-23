import { useState, useEffect } from 'react';
import axios from 'axios';

interface Field {
  id: string;
  label: string;
  type: 'text' | 'checkbox' | 'date' | 'signature';
  role: string;
  position: { x: number; y: number; page: number };
}

interface Template {
  id: string;
  filename: string;
  pages: number;
  fields: Field[];
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:3001/api/upload', formData);
      setTemplate(res.data);
      setSuccess(true);
      setError('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
      setSuccess(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          PDF successfully processed!
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">PDF Template Builder</h1>
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded" onClick={handleUpload}>
        Upload
      </button>

      {template && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Fields</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {template.fields.map(field => (
              <div key={field.id} className="border p-4 rounded bg-white shadow">
                <p><strong>Label:</strong> {field.label}</p>
                <p><strong>Type:</strong> {field.type}</p>
                <p><strong>Role:</strong> {field.role}</p>
                <p><strong>Page:</strong> {field.position.page}</p>
                <p><strong>Position:</strong> ({field.position.x}, {field.position.y})</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}