export default function KpiCard({ label, value, hint, accent = false }) {
  return (
    <div className="card p-4 sm:p-5 flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className={`font-display text-3xl leading-none ${accent ? 'text-gold-300' : 'text-ink-100'}`}>
        {value}
      </p>
      {hint && <p className="text-xs text-ink-500">{hint}</p>}
    </div>
  );
}
