import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?worker";
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

export default function TemplateEditor() {
  const { id } = useParams();
  const [template, setTemplate] = useState<Template | null>(null);
  const canvasRefs = useRef<HTMLCanvasElement[]>([]);

  useEffect(() => {
    const fetchTemplate = async () => {
      const res = await axios.get(`http://localhost:3001/api/templates/${id}`);
      setTemplate(res.data);
    };
    fetchTemplate();
  }, [id]);

  useEffect(() => {
    const renderPages = async () => {
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
    renderPages();
  }, [template]);

const handleFieldChange = async (index: number, key: keyof Field, value: string) => {
  if (!template) return;
  const updatedFields = [...template.fields];
  updatedFields[index] = { ...updatedFields[index], [key]: value };
  const updatedTemplate = { ...template, fields: updatedFields };
  setTemplate(updatedTemplate);
  await axios.post(`http://localhost:3001/api/templates/${template.id}`, updatedTemplate);
};

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Edit PDF Template</h1>
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
                    <div className="font-bold">{field.label}</div>
                    <div className="flex flex-row gap-1">
                      <select
                        className="text-xs border rounded px-1"
                        value={field.role}
                        onChange={(e) =>
                          handleFieldChange(idx, "role", e.target.value)
                        }
                      >
                        <option value="agent">Agent</option>
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                      </select>
                      <select
                        className="text-xs border rounded px-1"
                        value={field.type}
                        onChange={(e) =>
                          handleFieldChange(idx, "type", e.target.value)
                        }
                      >
                        <option value="text">Text</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="date">Date</option>
                        <option value="signature">Signature</option>
                      </select>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
