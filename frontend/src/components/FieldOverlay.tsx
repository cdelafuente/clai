import type { Field } from "../../../shared"; // or shared import

interface Props {
  field: Field;
  scale: number;
  onChange: (key: keyof Field, value: string) => void;
}

export default function FieldOverlay({ field, scale, onChange }: Props) {
  const { label, role, type, position } = field;

  return (
    <div
      className="absolute bg-white text-xs px-1 py-[2px] border rounded shadow"
      style={{
        bottom: position.y * scale,
        left: position.x * scale,
      }}
    >
      <div className="font-bold">{label}</div>
      <div className="flex flex-row gap-1 mt-1">
        <select
          className="text-xs border rounded px-1"
          value={role}
          onChange={(e) => onChange("role", e.target.value)}
        >
          <option value="agent">Agent</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
        <select
          className="text-xs border rounded px-1"
          value={type}
          onChange={(e) => onChange("type", e.target.value)}
        >
          <option value="text">Text</option>
          <option value="checkbox">Checkbox</option>
          <option value="date">Date</option>
          <option value="signature">Signature</option>
        </select>
      </div>
    </div>
  );
}
