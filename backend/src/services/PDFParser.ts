import { PDFDocument } from 'pdf-lib';
import { readFile } from 'fs/promises';
import { nanoid } from 'nanoid';
import type { Template, Field } from '../../../shared/types.js';

export async function parsePDFFormFields(filePath: string, originalName: string): Promise<Template> {
  const fileBuffer = await readFile(filePath);
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  const pages = pdfDoc.getPages();

  const detectedFields: Field[] = fields.map(f => {
    const typeName = f.constructor.name.toLowerCase();
    const fieldType: Field['type'] =
      typeName.includes('checkbox') ? 'checkbox' :
      typeName.includes('text') ? 'text' :
      typeName.includes('button') ? 'signature' : 'text';

    const name = f.getName();
    const acroField: any = (f as any).acroField;
    const widgets = acroField?.getWidgets?.() || [];
    const widget = widgets[0];
    const rect = widget?.getRectangle?.();
    const pageRef = widget?.P();
    const pageIndex = pages.findIndex(p => p.ref === pageRef);

    return {
      id: nanoid(),
      label: name,
      type: fieldType,
      role: 'buyer',
      position: {
        x: rect?.x ?? 0,
        y: rect?.y ?? 0,
        page: pageIndex + 1 || 1,
      },
    };
  });

  return {
    id: nanoid(),
    filename: originalName,
    pages: pdfDoc.getPageCount(),
    fields: detectedFields,
  };
}
