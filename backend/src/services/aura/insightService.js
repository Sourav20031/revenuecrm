// Aura+ Intelligence Service.
//
// Orchestrates the flow: Business Context -> Rules Engine -> Structured
// Insight Output. This is the only entry point the API layer talks to —
// it stays intentionally thin so contextService (data access) and
// rulesEngine (analysis) remain independently testable.

import { buildLeadContext } from './contextService.js';
import { evaluateLeadRules } from './rulesEngine.js';
import { AURA_CONFIG } from '../../config/aura.js';

const PRIORITY_RANK = { Critical: 4, High: 3, Medium: 2, Low: 1 };

/**
 * Generates structured Aura+ intelligence for a single lead.
 *
 * Returns `{ notFound: true }` if the lead does not exist so the controller
 * can respond with a proper 404 instead of a fabricated empty result.
 */
export async function generateLeadIntelligence(leadId) {
  const context = await buildLeadContext(leadId);
  if (!context) return { notFound: true };

  const rawSignals = evaluateLeadRules(context, AURA_CONFIG);
  const generatedAt = new Date().toISOString();

  const insights = rawSignals
    .map((signal) => ({ ...signal, generatedAt }))
    .sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);

  return {
    notFound: false,
    result: {
      entity: {
        type: 'Lead',
        id: context.lead._id,
        name: context.lead.name,
        company: context.lead.company,
      },
      generatedAt,
      insights,
      summary: {
        totalInsights: insights.length,
        highestPriority: insights.length > 0 ? insights[0].priority : null,
      },
    },
  };
}
