// Configuration for the Aura+ Intelligence Layer.
// Centralizing thresholds here keeps the rules engine declarative and makes
// tuning behavior a config change rather than a code change.

export const AURA_CONFIG = {
  // A lead with no TimelineEvent newer than this many days is flagged inactive.
  INACTIVITY_THRESHOLD_DAYS: 7,

  // Priority levels considered "high priority" for the attention-needed rule.
  HIGH_PRIORITY_LEVELS: ['High', 'Urgent'],

  // Qualification statuses considered "not yet actively worked".
  STALE_QUALIFICATION_STATUSES: ['New', 'Contacted'],

  // Pipeline stages excluded from inactivity/attention checks — the deal is
  // already closed, so staleness there isn't a signal worth surfacing.
  CLOSED_STAGES: ['WON', 'LOST'],
};
