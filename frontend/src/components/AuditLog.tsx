interface Props {
  entries: any[];
}

export default function AuditLog({ entries }: Props) {
  return (
    <div className="w-[300px] max-h-[80vh] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-3">Activity Log</h2>
      {entries.length === 0 ? (
        <p className="text-gray-500 text-sm">No events recorded yet.</p>
      ) : (
        <ul className="space-y-2 text-sm text-gray-800">
          {entries
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )
            .map((entry, i) => (
              <li key={i} className="border rounded px-3 py-2 bg-gray-50">
                <strong className="capitalize">{entry.role}</strong> — {entry.event}
                <br />
                <span className="text-gray-500 text-xs">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
