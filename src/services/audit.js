import api from './api.js';

export function fetchAuditLogs() {
  return api.get('/audit-logs');
}
