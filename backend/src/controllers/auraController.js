import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';
import { generateLeadIntelligence } from '../services/aura/insightService.js';

// Aura+ is a read-only Intelligence Layer: this controller never creates,
// updates, or deletes Lead / Pipeline / Follow-up / Task records. It only
// returns analysis derived from existing Revenue CRM data.
export const getLeadIntelligence = asyncHandler(async (req, res) => {
  // Honor an inbound X-Request-Id for cross-system tracing if the caller
  // supplies one; otherwise insightService generates one.
  const requestId = req.headers['x-request-id'] || undefined;
  const { notFound, result } = await generateLeadIntelligence(req.params.id, { requestId });

  if (notFound) return fail(res, 'Lead not found', 404);

  return ok(res, result, 'Aura+ intelligence generated successfully');
});
