// Minimal in-memory audit trail for the Sprint 1 demo.
// In production this should be persisted (e.g. its own AuditLog collection)
// and tied to StarVnt Core Identity users.

const AUDIT_EVENT_TYPES = [
  'LEAD_CREATED',
  'LEAD_UPDATED',
  'LEAD_ASSIGNED',
  'STAGE_CHANGED',
  'QUALIFICATION_CHANGED',
];

const auditLog = [];
const MAX_ENTRIES = 500;

export function recordAuditEvent({ type, entity, entityId, user = 'dev-user', details = '' }) {
  if (!AUDIT_EVENT_TYPES.includes(type)) return;

  auditLog.unshift({
    type,
    entity,
    entityId,
    user,
    details,
    timestamp: new Date(),
  });

  if (auditLog.length > MAX_ENTRIES) auditLog.length = MAX_ENTRIES;
}

export function getAuditLog(limit = 100) {
  return auditLog.slice(0, limit);
}
