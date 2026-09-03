// Aura+ Business Context Access.
//
// This is the ONLY place Aura+ touches the Revenue CRM's data. It reads
// existing Lead / FollowUp / Task / TimelineEvent / Proposal documents and
// never writes, updates, or deletes anything — Aura+ observes CRM data, it
// does not own or mutate it.
//
// This raw context is intentionally NOT what the analysis engine consumes
// directly — see normalizer.js, which turns this into the normalized
// Intelligence Input Contract. Keeping this file's output shape close to
// the Mongoose documents (and normalization elsewhere) is what lets the
// rules engine stay decoupled from the CRM's internal model structure.

import Lead from '../../models/Lead.js';
import FollowUp from '../../models/FollowUp.js';
import Task from '../../models/Task.js';
import TimelineEvent from '../../models/TimelineEvent.js';
import Proposal from '../../models/Proposal.js';

/**
 * Builds a read-only business context snapshot for a single lead.
 * Returns null if the lead does not exist — callers decide how to respond.
 */
export async function buildLeadContext(leadId) {
  const lead = await Lead.findById(leadId);
  if (!lead) return null;

  const [followUps, tasks, events, proposals] = await Promise.all([
    FollowUp.find({ lead: lead._id }).sort({ date: -1 }),
    Task.find({ lead: lead._id }).sort({ dueDate: 1 }),
    TimelineEvent.find({ lead: lead._id }).sort({ createdAt: -1 }),
    Proposal.find({ lead: lead._id }).sort({ createdAt: -1 }),
  ]);

  return {
    lead,
    followUps,
    tasks,
    events,
    proposals,
    now: new Date(),
  };
}
