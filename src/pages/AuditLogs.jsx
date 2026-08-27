import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { fetchAuditLogs } from '../services/audit.js';
import { formatDateTime } from '../utils/format.js';
import { useToast } from '../hooks/useToast.jsx';

const TYPE_STYLES = {
  LEAD_CREATED: 'bg-state-info/10 text-state-info border border-state-info/30',
  LEAD_UPDATED: 'bg-base-800 text-ink-300 border border-base-600',
  LEAD_ASSIGNED: 'bg-gold-500/10 text-gold-300 border border-gold-500/30',
  STAGE_CHANGED: 'bg-purple-500/10 text-purple-300 border border-purple-500/30',
  QUALIFICATION_CHANGED: 'bg-state-success/10 text-state-success border border-state-success/30',
};

export default function AuditLogs() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs()
      .then((res) => setLogs(res.data))
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl text-ink-100">Audit Logs</h1>
        <p className="text-sm text-ink-500">
          A basic, in-memory audit trail of key CRM actions for this Sprint 1 demo. Persisted audit storage is planned for a future sprint.
        </p>
      </div>

      <div className="panel overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading audit logs…" />
        ) : logs.length === 0 ? (
          <EmptyState title="No audit events yet" description="Actions like creating, assigning, and qualifying leads will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-base-700">
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">Details</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx} className="table-row-hover border-b border-base-800/60">
                    <td className="px-4 py-3"><span className={`badge ${TYPE_STYLES[log.type] || TYPE_STYLES.LEAD_UPDATED}`}>{log.type.replace(/_/g, ' ')}</span></td>
                    <td className="px-4 py-3 text-ink-300">{log.entity} #{log.entityId?.slice(-6)}</td>
                    <td className="px-4 py-3 text-ink-300">{log.details}</td>
                    <td className="px-4 py-3 text-ink-300">{log.user}</td>
                    <td className="px-4 py-3 text-ink-500 whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
