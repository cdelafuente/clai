import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PDFPage from "../components/PDFPage";
import type { Field, Template } from "../../../shared";

export default function TemplateEditor() {
  const { id } = useParams();
  const [template, setTemplate] = useState<Template | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      const res = await axios.get(`http://localhost:3001/api/templates/${id}`);
      setTemplate(res.data);
    };
    fetchTemplate();
  }, [id]);

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
      {template &&
        [...Array(template.pages)].map((_, i) => (
          <PDFPage
            key={i}
            pageNum={i + 1}
            fileUrl={`http://localhost:3001/uploads/${template.filename}`}
            fields={template.fields.filter((f) => f.position.page === i + 1)}
            onFieldChange={(fieldIndex, key, value) => {
              const pageFields = template.fields.filter(f => f.position.page === i + 1);
              const globalIndex = template.fields.findIndex(f => f.id === pageFields[fieldIndex].id);
              handleFieldChange(globalIndex, key, value);
            }}
          />
        ))}
    </div>
  );
}
