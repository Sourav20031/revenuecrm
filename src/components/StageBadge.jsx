import { STAGE_LABELS } from '../utils/constants.js';

const STYLES = {
  NEW: 'bg-state-info/10 text-state-info border border-state-info/30',
  QUALIFIED: 'bg-gold-500/10 text-gold-300 border border-gold-500/30',
  FOLLOW_UP: 'bg-state-warning/10 text-state-warning border border-state-warning/30',
  PROPOSAL: 'bg-purple-500/10 text-purple-300 border border-purple-500/30',
  WON: 'bg-state-success/10 text-state-success border border-state-success/30',
  LOST: 'bg-state-danger/10 text-state-danger border border-state-danger/30',
};

export default function StageBadge({ stage }) {
  return <span className={`badge ${STYLES[stage] || STYLES.NEW}`}>{STAGE_LABELS[stage] || stage}</span>;
}
