export function ProgressBar({ value, colorClass = 'from-violet-500 via-blue-500 to-mint-500' }: { value: number; colorClass?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2.5 w-full rounded-full bg-surface-3 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
