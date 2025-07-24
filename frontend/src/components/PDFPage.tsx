
import FieldOverlay from "./FieldOverlay";
import type { Field } from "../../../shared"; // or shared import
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?worker";
import { useEffect, useRef } from "react";
pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

interface Props {
  pageNum: number;
  fileUrl: string;
  fields: Field[];
  scale?: number;
  onFieldChange: (fieldIndex: number, key: keyof Field, value: string) => void;
}

export default function PDFPage({
  pageNum,
  fileUrl,
  fields,
  scale = 1.5,
  onFieldChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const render = async () => {
      const pdf = await pdfjsLib.getDocument(fileUrl).promise;
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx!, viewport }).promise;
    };
    render();
  }, [fileUrl, pageNum, scale]);

  return (
    <div className="relative mt-6">
      <canvas ref={canvasRef} className="block border shadow-md" />
      {fields.map((field, idx) => (
        <FieldOverlay
          key={field.id}
          field={field}
          scale={scale}
          onChange={(key, value) => onFieldChange(idx, key, value)}
        />
      ))}
    </div>
  );
}
