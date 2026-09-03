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

  // Stages that represent real forward movement, used by the conversion
  // indication signal to confirm the lead has actually progressed.
  PROGRESSED_STAGES: ['QUALIFIED', 'FOLLOW_UP', 'PROPOSAL'],

  // Proposal statuses that represent active buyer-side engagement.
  ACTIVE_PROPOSAL_STATUSES: ['Sent', 'Viewed', 'Negotiation'],
};

// Normalized Intelligence Input Contract metadata (Day 2).
// Bumping CONTRACT_VERSION is a breaking-change signal for any consumer
// (including a future Automation Engine) parsing the normalized shape.
export const AURA_CONTRACT_VERSION = '1.0';
export const AURA_SOURCE_SYSTEM = 'STARVNT_REVENUE';
export const AURA_RECOMMENDATION_SOURCE = 'AURA_PLUS';
