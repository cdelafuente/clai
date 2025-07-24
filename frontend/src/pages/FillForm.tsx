import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?worker";
pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

export default function FillForm() {
  const { workflowId, role } = useParams();
  const [template, setTemplate] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const canvasRefs = useRef<HTMLCanvasElement[]>([]);
  const [workflow, setWorkflow] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);

  useEffect(() => {
    const fetchWorkflow = async () => {
      const res = await axios.get(
        `http://localhost:3001/api/workflows/${workflowId}`
      );
      setWorkflow(res.data);
      setProgress(res.data.progress);

      const { templateId, responses } = res.data;
      const templateRes = await axios.get(
        `http://localhost:3001/api/templates/${templateId}`
      );
      setTemplate(templateRes.data);

      const assignedFields = templateRes.data.fields.filter(
        (f: any) => f.role === role
      );
      const savedFields = responses?.[role!] || [];

      const merged = assignedFields.map((field: any) => {
        const saved = savedFields.find((s: any) => s.id === field.id);
        return saved ? { ...field, value: saved.value } : field;
      });
      setFields(merged);

      const auditRes = await axios.get(
        `http://localhost:3001/api/audit/${workflowId}`
      );
      setAuditLog(auditRes.data);
    };
    fetchWorkflow();
  }, [workflowId, role]);

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

  useEffect(() => {
    if (workflowId && role) {
      logAudit("Viewed form page");
    }
  }, [workflowId, role]);

  const handleChange = (index: number, value: string | boolean) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], value };
    setFields(updated);
    logAudit(`Updated field "${fields[index].label}"`);
  };

  const handleSubmit = async () => {
    await axios.post(
      `http://localhost:3001/api/workflows/${workflowId}/submit/${role}`,
      {
        fields,
      }
    );
    alert("Form submitted!");
    await logAudit("Submitted form");

    const res = await axios.get(
      `http://localhost:3001/api/workflows/${workflowId}`
    );
    setWorkflow(res.data);
    setProgress(res.data.progress);

    const auditRes = await axios.get(
      `http://localhost:3001/api/audit/${workflowId}`
    );
    setAuditLog(auditRes.data);
  };

  const logAudit = async (event: string) => {
    await axios.post("http://localhost:3001/api/audit", {
      workflowId,
      role,
      event,
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold mb-4 capitalize">
        Fill Form ({role})
      </h1>

      {progress?.length > 0 && (
        <div className="mb-6 space-y-2">
          {progress
            .filter((p) => p.role == role)
            .map((p: any) => (
              <div key={p.role}>
                <p className="text-sm font-medium capitalize">
                  {p.role}: {p.filled}/{p.assigned} fields ({p.percent}%)
                </p>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div
                    className="h-2 bg-blue-600 rounded"
                    style={{ width: `${p.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
        </div>
      )}
      <div className="flex gap-6">
        <div className="flex-1 space-y-6">
          {template &&
            [...Array(template.pages)].map((_, i) => (
              <div key={i} className="relative mt-6">
                <canvas
                  ref={(el) => (canvasRefs.current[i] = el!)}
                  className="block border shadow-md"
                />
                {fields
                  .filter((f) => f.position.page === i + 1)
                  .map((field, idx) => (
                    <div
                      key={field.id}
                      className="absolute bg-white text-xs px-2 py-1 border rounded shadow"
                      style={{
                        bottom: field.position.y * 1.5,
                        left: field.position.x * 1.5,
                      }}
                    >
                      <label className="block text-[11px] mb-1">
                        {field.label}
                      </label>
                      {field.type === "checkbox" ? (
                        <input
                          type="checkbox"
                          checked={!!field.value}
                          onChange={(e) => handleChange(idx, e.target.checked)}
                        />
                      ) : (
                        <input
                          className="text-xs border px-1 rounded"
                          type={field.type === "date" ? "date" : "text"}
                          value={field.value ?? ""}
                          onChange={(e) => handleChange(idx, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
              </div>
            ))}
          <button
            onClick={handleSubmit}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Submit
          </button>
        </div>
        <div className="w-[300px] max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-3">Activity Log</h2>
          {auditLog.length === 0 ? (
            <p className="text-gray-500 text-sm">No events recorded yet.</p>
          ) : (
            <ul className="space-y-2 text-sm text-gray-800">
              {auditLog
                .sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                )
                .map((entry, i) => (
                  <li key={i} className="border rounded px-3 py-2 bg-gray-50">
                    <strong className="capitalize">{entry.role}</strong> —{" "}
                    {entry.event}
                    <br />
                    <span className="text-gray-500 text-xs">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
