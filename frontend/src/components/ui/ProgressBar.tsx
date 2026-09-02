type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between text-xs text-text-secondary mb-1.5">
        <span>
          {current}/{total}
        </span>
        <span>{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        className="h-1.5 bg-border rounded-[3px]"
      >
        <div
          className="h-1.5 bg-primary rounded-[3px] transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
