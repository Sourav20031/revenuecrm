// Aura+ Analysis / Rules Engine.
//
// Pure, deterministic, side-effect free: every function here takes a
// business context object and returns plain data. No database access, no
// Express req/res, no mutation of anything passed in. This is what keeps
// "intelligence" testable and separate from both data access
// (contextService) and the API layer (auraController).
//
// Each rule either returns a raw signal object or null. A rule that lacks
// the data it needs to evaluate simply returns null — it never fabricates
// a conclusion from missing facts.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(a, b) {
  return Math.floor((b.getTime() - a.getTime()) / MS_PER_DAY);
}

/**
 * Rule: Follow-up overdue.
 * Fires when the lead has one or more Scheduled follow-ups whose date has
 * already passed.
 */
function evaluateFollowUpOverdue(context) {
  const { followUps, now } = context;
  if (!followUps || followUps.length === 0) return null;

  const overdue = followUps.filter((f) => f.status === 'Scheduled' && new Date(f.date) < now);
  if (overdue.length === 0) return null;

  const mostOverdue = overdue.reduce((oldest, f) =>
    new Date(f.date) < new Date(oldest.date) ? f : oldest
  );
  const daysOverdue = daysBetween(new Date(mostOverdue.date), now);

  return {
    signal: 'FOLLOW_UP_OVERDUE',
    insight: overdue.length === 1
      ? 'A scheduled follow-up is overdue'
      : `${overdue.length} scheduled follow-ups are overdue`,
    reason: `The ${mostOverdue.type.toLowerCase()} follow-up scheduled for ${new Date(mostOverdue.date).toLocaleDateString()} is ${daysOverdue} day(s) past due and still marked "Scheduled".`,
    priority: daysOverdue >= 3 ? 'Critical' : 'High',
    recommendedAction: 'Complete, reschedule, or cancel the overdue follow-up so the lead does not stall.',
    confidence: 'High',
    evidence: {
      overdueCount: overdue.length,
      mostOverdueFollowUpId: mostOverdue._id,
      mostOverdueDate: mostOverdue.date,
      daysOverdue,
    },
  };
}

/**
 * Rule: Lead inactivity.
 * Fires when a lead that isn't already closed (Won/Lost) has had no
 * timeline activity for longer than the configured threshold.
 */
function evaluateLeadInactivity(context, config) {
  const { lead, lastActivityAt, now } = context;
  if (!lastActivityAt) return null;
  if (config.CLOSED_STAGES.includes(lead.stage)) return null;

  const daysInactive = daysBetween(new Date(lastActivityAt), now);
  if (daysInactive < config.INACTIVITY_THRESHOLD_DAYS) return null;

  return {
    signal: 'LEAD_INACTIVITY',
    insight: `No activity recorded in ${daysInactive} day(s)`,
    reason: `The last recorded timeline activity for this lead was on ${new Date(lastActivityAt).toLocaleDateString()}, which is ${daysInactive} day(s) ago and beyond the ${config.INACTIVITY_THRESHOLD_DAYS}-day inactivity threshold.`,
    priority: daysInactive >= config.INACTIVITY_THRESHOLD_DAYS * 2 ? 'High' : 'Medium',
    recommendedAction: 'Reach out to the lead or log an update to confirm the deal is still active.',
    confidence: 'Medium',
    evidence: {
      lastActivityAt,
      daysInactive,
      thresholdDays: config.INACTIVITY_THRESHOLD_DAYS,
      stage: lead.stage,
    },
  };
}

/**
 * Rule: High-priority lead needs attention.
 * Fires when a High/Urgent priority lead shows one or more signs of being
 * under-worked: unassigned, still in an early qualification status, or with
 * no follow-up currently scheduled.
 */
function evaluateHighPriorityAttention(context, config) {
  const { lead, followUps } = context;
  if (!config.HIGH_PRIORITY_LEVELS.includes(lead.priority)) return null;
  if (config.CLOSED_STAGES.includes(lead.stage)) return null;

  const reasons = [];
  if (!lead.owner) reasons.push('no salesperson is assigned');
  if (config.STALE_QUALIFICATION_STATUSES.includes(lead.qualification)) {
    reasons.push(`qualification is still "${lead.qualification}"`);
  }
  const hasScheduledFollowUp = (followUps || []).some((f) => f.status === 'Scheduled');
  if (!hasScheduledFollowUp) reasons.push('no follow-up is currently scheduled');

  if (reasons.length === 0) return null;

  return {
    signal: 'HIGH_PRIORITY_ATTENTION_NEEDED',
    insight: `${lead.priority}-priority lead is under-worked`,
    reason: `This is a ${lead.priority}-priority lead where ${reasons.join(', and ')}.`,
    priority: lead.priority === 'Urgent' ? 'Critical' : 'High',
    recommendedAction: !lead.owner
      ? 'Assign a salesperson to this lead as soon as possible.'
      : 'Move this lead forward with a follow-up or qualification update to match its priority.',
    confidence: 'Medium',
    evidence: {
      priority: lead.priority,
      owner: lead.owner,
      qualification: lead.qualification,
      hasScheduledFollowUp,
    },
  };
}

const RULES = [evaluateFollowUpOverdue, evaluateLeadInactivity, evaluateHighPriorityAttention];

/**
 * Evaluates every registered rule against a business context and returns
 * the list of signals that fired (empty array if none did).
 */
export function evaluateLeadRules(context, config) {
  return RULES.map((rule) => rule(context, config)).filter(Boolean);
}
