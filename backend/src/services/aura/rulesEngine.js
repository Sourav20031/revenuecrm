// Aura+ Analysis / Rules Engine.
//
// Pure, deterministic, side-effect free: every function here takes a
// NORMALIZED Intelligence Input Contract (see normalizer.js) and returns
// plain data. This file never imports a Mongoose model, never sees a raw
// CRM document, and never performs I/O — that decoupling is what Day 2
// exists to establish. A rule that lacks the evidence it needs simply
// returns null; nothing here fabricates a conclusion from missing facts.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(a, b) {
  return Math.floor((b.getTime() - a.getTime()) / MS_PER_DAY);
}

/**
 * Signal: FOLLOW_UP_OVERDUE
 * Domain: Follow-up Urgency.
 * Fires when the lead has one or more Scheduled follow-ups whose date has
 * already passed.
 */
function evaluateFollowUpOverdue(contract, config) {
  const { followUp } = contract;
  if (!followUp.mostOverdue) return null;

  const now = new Date(contract.timestamp);
  const daysOverdue = daysBetween(new Date(followUp.mostOverdue.date), now);

  return {
    signal: 'FOLLOW_UP_OVERDUE',
    insight: followUp.overdueCount === 1
      ? 'A scheduled follow-up is overdue'
      : `${followUp.overdueCount} scheduled follow-ups are overdue`,
    reason: `The ${followUp.mostOverdue.type.toLowerCase()} follow-up scheduled for ${new Date(followUp.mostOverdue.date).toLocaleDateString()} is ${daysOverdue} day(s) past due and still marked "Scheduled".`,
    priority: daysOverdue >= config.FOLLOW_UP_OVERDUE_CRITICAL_DAYS ? 'CRITICAL' : 'HIGH',
    recommendation: {
      type: 'COMPLETE_OVERDUE_FOLLOW_UP',
      message: 'Complete, reschedule, or cancel the overdue follow-up so the lead does not stall.',
    },
    confidence: 'High',
    evidence: {
      overdueCount: followUp.overdueCount,
      mostOverdueFollowUpId: followUp.mostOverdue.id,
      mostOverdueDate: followUp.mostOverdue.date,
      daysOverdue,
    },
  };
}

/**
 * Signal: FOLLOW_UP_GAP
 * Domain: Follow-up Urgency ("follow-up incomplete").
 * Fires when an open lead has never had a follow-up scheduled at all —
 * distinct from FOLLOW_UP_OVERDUE, which requires one to have existed and
 * lapsed. The two are mutually exclusive by construction (a lead with
 * totalCount === 0 cannot also have an overdue one), so they never
 * conflict when both are evaluated.
 */
function evaluateFollowUpGap(contract) {
  const { pipeline, followUp } = contract;
  if (pipeline.isClosed) return null;
  if (followUp.totalCount > 0) return null;

  return {
    signal: 'FOLLOW_UP_GAP',
    insight: 'No follow-up has ever been scheduled',
    reason: `This lead is in stage "${pipeline.stage}" but has no follow-up record of any kind — none scheduled, completed, or cancelled.`,
    priority: 'MEDIUM',
    recommendation: {
      type: 'SCHEDULE_FOLLOW_UP',
      message: 'Schedule an initial follow-up to begin actively working this lead.',
    },
    confidence: 'High',
    evidence: {
      stage: pipeline.stage,
      totalFollowUps: followUp.totalCount,
    },
  };
}

/**
 * Signal: PIPELINE_STAGNATION
 * Domain: Pipeline maturity (Day 3).
 * Fires when an open lead has not changed pipeline stage in longer than
 * the configured threshold. This is deliberately distinct from
 * LEAD_INACTIVITY: a lead can have recent notes, tasks, or follow-ups
 * (so LEAD_INACTIVITY stays silent) while still being stuck in the same
 * stage for weeks — that is a pipeline-health problem, not an activity
 * problem, and is backed by real STAGE_CHANGED timeline evidence rather
 * than a duplicate read of the same "last activity" fact.
 */
function evaluatePipelineStagnation(contract, config) {
  const { pipeline } = contract;
  if (pipeline.isClosed) return null;
  if (!pipeline.stageEnteredAt) return null;

  const now = new Date(contract.timestamp);
  const daysInStage = daysBetween(new Date(pipeline.stageEnteredAt), now);
  if (daysInStage < config.STAGNATION_THRESHOLD_DAYS) return null;

  return {
    signal: 'PIPELINE_STAGNATION',
    insight: `Stuck in "${pipeline.stage}" for ${daysInStage} day(s)`,
    reason: `This lead has remained in the "${pipeline.stage}" pipeline stage for ${daysInStage} day(s) without progressing, beyond the ${config.STAGNATION_THRESHOLD_DAYS}-day stagnation threshold.`,
    priority: daysInStage >= config.STAGNATION_HIGH_THRESHOLD_DAYS ? 'HIGH' : 'MEDIUM',
    recommendation: {
      type: 'ADVANCE_PIPELINE_STAGE',
      message: 'Review this lead and either advance it to the next stage or mark it Lost if it is no longer viable.',
    },
    confidence: 'High',
    evidence: {
      stage: pipeline.stage,
      stageEnteredAt: pipeline.stageEnteredAt,
      daysInStage,
      thresholdDays: config.STAGNATION_THRESHOLD_DAYS,
    },
  };
}

/**
 * Signal: LEAD_INACTIVITY
 * Domain: Inactivity.
 * Fires when an open lead has had no timeline activity for longer than the
 * configured threshold. Never fires purely because related data (tasks,
 * follow-ups) is absent — it is driven only by actual recorded activity.
 */
function evaluateLeadInactivity(contract, config) {
  const { pipeline, activity } = contract;
  if (pipeline.isClosed) return null;
  if (!activity.lastActivityAt) return null;

  const now = new Date(contract.timestamp);
  const daysInactive = daysBetween(new Date(activity.lastActivityAt), now);
  if (daysInactive < config.INACTIVITY_THRESHOLD_DAYS) return null;

  return {
    signal: 'LEAD_INACTIVITY',
    insight: `No activity recorded in ${daysInactive} day(s)`,
    reason: `The last recorded timeline activity for this lead was on ${new Date(activity.lastActivityAt).toLocaleDateString()}, which is ${daysInactive} day(s) ago and beyond the ${config.INACTIVITY_THRESHOLD_DAYS}-day inactivity threshold.${activity.openTaskCount > 0 ? ` ${activity.openTaskCount} task(s) remain open.` : ''}`,
    priority: daysInactive >= config.INACTIVITY_HIGH_THRESHOLD_DAYS ? 'HIGH' : 'MEDIUM',
    recommendation: {
      type: 'RE_ENGAGE_LEAD',
      message: 'Reach out to the lead or log an update to confirm the deal is still active.',
    },
    confidence: 'Medium',
    evidence: {
      lastActivityAt: activity.lastActivityAt,
      daysInactive,
      thresholdDays: config.INACTIVITY_THRESHOLD_DAYS,
      stage: pipeline.stage,
      openTaskCount: activity.openTaskCount,
    },
  };
}

/**
 * Signal: HIGH_PRIORITY_ATTENTION_NEEDED
 * Domain: Lead Quality.
 * Fires when a High/Urgent priority lead shows signs of being
 * under-worked: unassigned, or still in an early qualification status.
 * (The "no follow-up scheduled" condition now lives entirely in
 * FOLLOW_UP_GAP so the two signals don't restate the same evidence.)
 */
function evaluateHighPriorityAttention(contract, config) {
  const { lead, pipeline } = contract;
  if (!config.HIGH_PRIORITY_LEVELS.includes(lead.priority)) return null;
  if (pipeline.isClosed) return null;

  const reasons = [];
  if (!lead.owner) reasons.push('no salesperson is assigned');
  if (config.STALE_QUALIFICATION_STATUSES.includes(lead.qualification)) {
    reasons.push(`qualification is still "${lead.qualification}"`);
  }
  if (reasons.length === 0) return null;

  return {
    signal: 'HIGH_PRIORITY_ATTENTION_NEEDED',
    insight: `${lead.priority}-priority lead is under-worked`,
    reason: `This is a ${lead.priority}-priority lead where ${reasons.join(', and ')}.`,
    priority: lead.priority === 'Urgent' ? 'CRITICAL' : 'HIGH',
    recommendation: !lead.owner
      ? { type: 'ASSIGN_OWNER', message: 'Assign a salesperson to this lead as soon as possible.' }
      : { type: 'REVIEW_QUALIFICATION', message: 'Move this lead forward with a qualification update to match its priority.' },
    confidence: 'Medium',
    evidence: {
      priority: lead.priority,
      owner: lead.owner,
      qualification: lead.qualification,
    },
  };
}

/**
 * Signal: CONVERSION_INDICATION
 * Domain: Conversion Signals.
 * A positive-direction signal (the others are all risk/attention signals):
 * fires when a lead shows real forward momentum — it has progressed past
 * NEW, has either an actively-engaged proposal or a Qualified status, and
 * has recent activity. This is phrased as an indication, never certainty,
 * per the brief ("Signal", "Indication", "Recommendation" language only).
 */
function evaluateConversionIndication(contract, config) {
  const { pipeline, lead, activity } = contract;
  if (pipeline.isClosed) return null;
  if (!pipeline.hasProgressed) return null;

  const now = new Date(contract.timestamp);
  const daysInactive = activity.lastActivityAt ? daysBetween(new Date(activity.lastActivityAt), now) : Infinity;
  const hasRecentActivity = daysInactive < config.INACTIVITY_THRESHOLD_DAYS;
  if (!hasRecentActivity) return null;

  const hasEngagementEvidence = pipeline.activeProposalCount > 0 || lead.qualification === 'Qualified';
  if (!hasEngagementEvidence) return null;

  return {
    signal: 'CONVERSION_INDICATION',
    insight: 'Lead shows a positive conversion indication',
    reason: `This lead has progressed to stage "${pipeline.stage}" with recent activity (${daysInactive} day(s) ago)${pipeline.activeProposalCount > 0 ? ` and ${pipeline.activeProposalCount} actively-engaged proposal(s)` : ''}${lead.qualification === 'Qualified' ? ', and is marked Qualified' : ''}.`,
    priority: 'LOW',
    recommendation: {
      type: 'CONTINUE_ENGAGEMENT',
      message: 'Momentum looks positive — continue engagement and consider advancing toward the next pipeline stage.',
    },
    confidence: 'Medium',
    evidence: {
      stage: pipeline.stage,
      qualification: lead.qualification,
      activeProposalCount: pipeline.activeProposalCount,
      daysSinceLastActivity: daysInactive,
    },
  };
}

const RULES = [
  evaluateFollowUpOverdue,
  evaluateFollowUpGap,
  evaluatePipelineStagnation,
  evaluateLeadInactivity,
  evaluateHighPriorityAttention,
  evaluateConversionIndication,
];

/**
 * Evaluates every registered rule against a normalized Intelligence Input
 * Contract and returns the list of signals that fired (empty if none did).
 */
export function evaluateContract(contract, config) {
  return RULES.map((rule) => rule(contract, config)).filter(Boolean);
}
