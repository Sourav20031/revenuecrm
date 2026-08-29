import { getAuditLog } from '../services/auditService.js';
import { ok } from '../utils/apiResponse.js';

export function getAuditLogs(req, res) {
  return ok(res, getAuditLog());
}
