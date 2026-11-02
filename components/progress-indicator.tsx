type ProgressIndicatorProps = {
  value: number;
  max: number;
  label: string;
  className?: string;
};

/** Presentation only: the caller supplies the existing, persisted counts. */
export function ProgressIndicator({ value, max, label, className = '' }: ProgressIndicatorProps) {
  return (
    <div
      className={`progress-track ${className}`.trim()}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value} จาก ${max} ด่าน`}
    >
      <span style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
    </div>
  );
}
