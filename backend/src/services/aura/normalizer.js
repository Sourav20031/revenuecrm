// Aura+ Input Adapter / Normalizer.
//
// This is the ONLY layer that knows how to translate CRM-specific
// Mongoose document shapes into Aura+'s normalized Intelligence Input
// Contract. The analysis engine (rulesEngine.js) never sees a raw Lead /
// FollowUp / Task / TimelineEvent / Proposal document — only this plain,
// versioned, source-aware contract. That keeps the rules engine reusable
// even if the underlying CRM schema changes shape later.
//
// This module performs no I/O — it is a pure transformation over the
// context object contextService already fetched.

import crypto from 'crypto';
import { AURA_CONFIG, AURA_CONTRACT_VERSION, AURA_SOURCE_SYSTEM } from '../../config/aura.js';

/**
 * @typedef {Object} AuraIntelligenceContract
 * A normalized, CRM-shape-independent view of one business entity, built
 * only from fields that actually exist in the current Revenue CRM data
 * model. Sections are included only when backing data exists for them.
 */

/**
 * Normalizes a raw Aura+ business context (from contextService) into the
 * versioned Intelligence Input Contract the analysis engine consumes.
 */
export function normalizeLeadContext(context, { requestId } = {}) {
  const { lead, followUps, tasks, events, proposals, now } = context;

  const scheduledFollowUps = followUps.filter((f) => f.status === 'Scheduled');
  const overdueFollowUps = scheduledFollowUps.filter((f) => new Date(f.date) < now);
  const mostOverdue = overdueFollowUps.reduce(
    (oldest, f) => (!oldest || new Date(f.date) < new Date(oldest.date) ? f : oldest),
    null
  );
  const nextScheduled = scheduledFollowUps
    .filter((f) => new Date(f.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;

  const lastActivityAt = events.length > 0 ? events[0].createdAt : lead.createdAt;
  const openTasks = tasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress');
  const activeProposals = proposals.filter((p) =>
    AURA_CONFIG.ACTIVE_PROPOSAL_STATUSES.includes(p.status)
  );

  // `events` is sorted newest-first (see contextService), so the first
  // STAGE_CHANGED entry found is the most recent stage transition. A lead
  // that has never had one has been in its initial stage since creation.
  const mostRecentStageChange = events.find((e) => e.type === 'STAGE_CHANGED');
  const stageEnteredAt = mostRecentStageChange ? mostRecentStageChange.createdAt : lead.createdAt;

  return {
    contractVersion: AURA_CONTRACT_VERSION,
    requestId: requestId || crypto.randomUUID(),
    sourceSystem: AURA_SOURCE_SYSTEM,
    timestamp: now.toISOString(),

    entity: {
      type: 'LEAD',
      id: lead._id.toString(),
    },

    lead: {
      id: lead._id.toString(),
      name: lead.name,
      company: lead.company,
      priority: lead.priority,
      qualification: lead.qualification,
      stage: lead.stage,
      leadScore: lead.leadScore,
      owner: lead.owner,
      tags: lead.tags,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    },

    // The Revenue CRM has no separate post-conversion Customer record —
    // Lead is the single business entity end-to-end. This section is a
    // normalized re-projection of the lead's own contact fields, not a
    // fabricated or duplicated record.
    customer: {
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
    },

    // Task data folds into `activity` rather than getting its own
    // top-level contract section — it's evidence of engagement, not a
    // distinct normalized business domain the way lead/followUp/pipeline are.
    activity: {
      lastActivityAt,
      totalEvents: events.length,
      recentEvents: events.slice(0, 5).map((e) => ({
        type: e.type,
        description: e.description,
        occurredAt: e.createdAt,
      })),
      openTaskCount: openTasks.length,
    },

    followUp: {
      totalCount: followUps.length,
      scheduledCount: scheduledFollowUps.length,
      overdueCount: overdueFollowUps.length,
      nextScheduled: nextScheduled
        ? { id: nextScheduled._id.toString(), date: nextScheduled.date, type: nextScheduled.type }
        : null,
      mostOverdue: mostOverdue
        ? { id: mostOverdue._id.toString(), date: mostOverdue.date, type: mostOverdue.type }
        : null,
    },

    pipeline: {
      stage: lead.stage,
      isClosed: AURA_CONFIG.CLOSED_STAGES.includes(lead.stage),
      hasProgressed: AURA_CONFIG.PROGRESSED_STAGES.includes(lead.stage),
      qualification: lead.qualification,
      proposalCount: proposals.length,
      activeProposalCount: activeProposals.length,
      // When this lead entered its CURRENT stage, derived from the most
      // recent real STAGE_CHANGED timeline event (falls back to the lead's
      // own createdAt if it has never changed stage). Backs the
      // PIPELINE_STAGNATION signal.
      stageEnteredAt,
    },
  };
}
