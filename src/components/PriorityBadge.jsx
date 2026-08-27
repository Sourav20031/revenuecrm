const STYLES = {
  Low: 'bg-base-800 text-ink-300 border border-base-600',
  Medium: 'bg-state-info/10 text-state-info border border-state-info/30',
  High: 'bg-gold-500/10 text-gold-300 border border-gold-500/30',
  Urgent: 'bg-state-danger/10 text-state-danger border border-state-danger/30',
};

export default function PriorityBadge({ priority }) {
  return <span className={`badge ${STYLES[priority] || STYLES.Low}`}>{priority || 'Low'}</span>;
}
