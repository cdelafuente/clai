import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';
pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

interface Field {
  id: string;
  label: string;
  type: "text" | "checkbox" | "date" | "signature";
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
  const [error, setError] = useState<string>("");
  const canvasRefs = useRef<HTMLCanvasElement[]>([]);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:3001/api/upload",
        formData
      );
      setTemplate(res.data);
      setSuccess(true);
      setError("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Upload failed");
      setSuccess(false);
    }
  };

  useEffect(() => {
    const renderPDF = async () => {
      if (!template) return;
      const url = `http://localhost:3001/uploads/${template.filename}`;
      const pdf = await pdfjsLib.getDocument(url).promise;

      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = canvasRefs.current[i];
        if (!canvas) continue;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const context = canvas.getContext("2d");
        await page.render({ canvasContext: context!, viewport }).promise;
      }
    };

    renderPDF();
  }, [template]);

  const handleRoleChange = async (index: number, role: string) => {
    if (!template) return;
    const updatedFields = [...template.fields];
    updatedFields[index] = { ...updatedFields[index], role };
    const updatedTemplate = { ...template, fields: updatedFields };
    setTemplate(updatedTemplate);
    await axios.post(
      `http://localhost:3001/api/templates/${template.id}`,
      updatedTemplate
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
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
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleUpload}
      >
        Upload
      </button>

      {template && (
        <div className="mt-8">
          {[...Array(template.pages)].map((_, i) => (
            <div key={i} className="relative mt-6">
              <canvas
                ref={(el) => (canvasRefs.current[i] = el!)}
                className="block border shadow-md"
              />
              {template.fields
                .filter((f) => f.position.page === i + 1)
                .map((field, idx) => (
                  <div
                    key={field.id}
                    className="absolute bg-white text-xs px-1 py-[2px] border rounded shadow"
                    style={{
                      bottom: field.position.y * 1.5,
                      left: field.position.x * 1.5,
                    }}
                  >
                    <select
                      className="text-xs border rounded px-1"
                      value={field.role}
                      onChange={(e) => handleRoleChange(idx, e.target.value)}
                    >
                      <option value="agent">Agent</option>
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                    </select>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
