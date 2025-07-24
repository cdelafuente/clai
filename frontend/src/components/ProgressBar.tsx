interface ProgressBarProps {
  role: string;
  assigned: number;
  filled: number;
  percent: number;
}

export default function ProgressBar({ role, assigned, filled, percent }: ProgressBarProps) {
  return (
    <div className="mb-3">
      <p className="text-sm font-medium capitalize">
        {role}: {filled}/{assigned} fields ({percent}%)
      </p>
      <div className="w-full bg-gray-200 h-2 rounded">
        <div
          className="h-2 bg-blue-600 rounded"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}
