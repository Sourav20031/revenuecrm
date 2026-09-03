// Configuration for the Aura+ Intelligence Layer.
// Centralizing thresholds here keeps the rules engine declarative and makes
// tuning behavior a config change rather than a code change.

export const AURA_CONFIG = {
  // A lead with no TimelineEvent newer than this many days is flagged inactive.
  INACTIVITY_THRESHOLD_DAYS: 7,

  // Inactivity duration (days) beyond which the signal escalates from
  // MEDIUM to HIGH priority. Was previously a magic "x2" multiplier inline
  // in the rules engine — centralized here per the Day 3 priority-engine
  // requirement that thresholds not be scattered outside config.
  INACTIVITY_HIGH_THRESHOLD_DAYS: 14,

  // Days overdue beyond which an overdue follow-up escalates from HIGH to
  // CRITICAL. Previously a magic number inline in the rules engine.
  FOLLOW_UP_OVERDUE_CRITICAL_DAYS: 3,

  // A lead that has not changed pipeline stage in this many days is
  // flagged as stagnant, independent of whether other activity (notes,
  // tasks) has occurred — see PIPELINE_STAGNATION in rulesEngine.js.
  STAGNATION_THRESHOLD_DAYS: 14,

  // Days-in-stage beyond which stagnation escalates from MEDIUM to HIGH.
  STAGNATION_HIGH_THRESHOLD_DAYS: 28,

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
