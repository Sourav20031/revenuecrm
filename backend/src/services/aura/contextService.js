// Aura+ Business Context Access.
//
// This is the ONLY place Aura+ touches the Revenue CRM's data. It reads
// existing Lead / FollowUp / Task / TimelineEvent documents and never
// writes, updates, or deletes anything — Aura+ observes CRM data, it does
// not own or mutate it.

import Lead from '../../models/Lead.js';
import FollowUp from '../../models/FollowUp.js';
import Task from '../../models/Task.js';
import TimelineEvent from '../../models/TimelineEvent.js';

/**
 * Builds a read-only business context snapshot for a single lead.
 * Returns null if the lead does not exist — callers decide how to respond.
 */
export async function buildLeadContext(leadId) {
  const lead = await Lead.findById(leadId);
  if (!lead) return null;

  const [followUps, tasks, latestEvent] = await Promise.all([
    FollowUp.find({ lead: lead._id }).sort({ date: -1 }),
    Task.find({ lead: lead._id }).sort({ dueDate: 1 }),
    TimelineEvent.findOne({ lead: lead._id }).sort({ createdAt: -1 }),
  ]);

  return {
    lead,
    followUps,
    tasks,
    lastActivityAt: latestEvent ? latestEvent.createdAt : lead.createdAt,
    now: new Date(),
  };
}
