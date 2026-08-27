const STYLES = {
  New: 'bg-state-info/10 text-state-info border border-state-info/30',
  Contacted: 'bg-gold-500/10 text-gold-300 border border-gold-500/30',
  Qualified: 'bg-state-success/10 text-state-success border border-state-success/30',
  Unqualified: 'bg-state-danger/10 text-state-danger border border-state-danger/30',
};

export default function QualificationBadge({ status }) {
  return <span className={`badge ${STYLES[status] || STYLES.New}`}>{status || 'New'}</span>;
}
