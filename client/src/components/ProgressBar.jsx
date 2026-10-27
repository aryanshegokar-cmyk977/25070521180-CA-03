// A paper strip that fills up as chapters are read.
export default function ProgressBar({ read, total, label = true }) {
  const percent = total ? Math.round((read / total) * 100) : 0;
  return (
    <div className="progress">
      <div className="progress-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Reading progress">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      {label && (
        <span className="progress-label small muted">
          {read} of {total} chapters · {percent}%
        </span>
      )}
    </div>
  );
}
