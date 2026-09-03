// Aura+ Intelligence Service.
//
// Orchestrates the full Day 2 flow:
//
//   Business Context (contextService)
//     -> Input Adapter / Normalizer (normalizer.js)
//     -> Normalized Intelligence Input Contract
//     -> Analysis / Rules Engine (rulesEngine.js)
//     -> Signal Detection + Rule Evaluation
//     -> Insight Generation + Priority Assignment
//     -> Structured Recommendation (this file)
//     -> Confidence
//
// This stays the single entry point the API layer talks to, so
// contextService, normalizer, and rulesEngine each stay independently
// testable and the controller never has to know how any of it works.

import crypto from 'crypto';
import { buildLeadContext } from './contextService.js';
import { normalizeLeadContext } from './normalizer.js';
import { evaluateContract } from './rulesEngine.js';
import { AURA_CONFIG, AURA_RECOMMENDATION_SOURCE } from '../../config/aura.js';

const PRIORITY_RANK = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

/**
 * Turns one raw rule signal into a structured, automation-ready
 * recommendation record. This is the only place recommendationId/source
 * get attached, keeping rulesEngine.js focused purely on detection.
 */
function toStructuredRecommendation(signal, entity, generatedAt) {
  return {
    recommendationId: crypto.randomUUID(),
    entity,
    insight: signal.signal,
    reason: signal.reason,
    priority: signal.priority,
    recommendation: signal.recommendation,
    confidence: signal.confidence,
    source: AURA_RECOMMENDATION_SOURCE,
    generatedAt,
    // Kept for readability alongside the machine-readable `insight` code.
    summary: signal.insight,
    evidence: signal.evidence,
  };
}

/**
 * Generates structured Aura+ intelligence for a single lead.
 *
 * Returns `{ notFound: true }` if the lead does not exist so the controller
 * can respond with a proper 404 instead of a fabricated empty result.
 */
export async function generateLeadIntelligence(leadId, { requestId } = {}) {
  const context = await buildLeadContext(leadId);
  if (!context) return { notFound: true };

  const contract = normalizeLeadContext(context, { requestId });
  const rawSignals = evaluateContract(contract, AURA_CONFIG);
  const generatedAt = new Date().toISOString();

  const recommendations = rawSignals
    .map((signal) => toStructuredRecommendation(signal, contract.entity, generatedAt))
    .sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);

  // Lightweight observability line — no personal/sensitive field values,
  // just enough to trace one intelligence request through logs. Mirrors
  // the existing [db]/[server] console.log tagging convention.
  console.log(
    `[aura] requestId=${contract.requestId} entity=${contract.entity.type}:${contract.entity.id} signals=${recommendations.map((r) => r.insight).join(',') || 'none'}`
  );

  return {
    notFound: false,
    result: {
      entity: contract.entity,
      generatedAt,
      recommendations,
      summary: {
        totalRecommendations: recommendations.length,
        highestPriority: recommendations.length > 0 ? recommendations[0].priority : null,
      },
      trace: {
        requestId: contract.requestId,
        contractVersion: contract.contractVersion,
        sourceSystem: contract.sourceSystem,
        signalsFired: recommendations.map((r) => r.insight),
      },
    },
  };
}
