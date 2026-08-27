import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import { fetchFollowUps, createFollowUp, updateFollowUp } from '../services/followups.js';
import { fetchLeads } from '../services/leads.js';
import { formatDate } from '../utils/format.js';
import { SALESPEOPLE, FOLLOWUP_TYPES, FOLLOWUP_STATUSES } from '../utils/constants.js';
import { useToast } from '../hooks/useToast.jsx';

const STATUS_STYLES = {
  Scheduled: 'bg-state-warning/10 text-state-warning border border-state-warning/30',
  Completed: 'bg-state-success/10 text-state-success border border-state-success/30',
  Cancelled: 'bg-base-800 text-ink-300 border border-base-600',
  Overdue: 'bg-state-danger/10 text-state-danger border border-state-danger/30',
};

export default function FollowUps() {
  const { showToast } = useToast();
  const [followUps, setFollowUps] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    setLoading(true);
    fetchFollowUps(statusFilter ? { status: statusFilter } : {})
      .then((res) => setFollowUps(res.data))
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);
  useEffect(() => {
    fetchLeads({ limit: 100 }).then((res) => setLeads(res.data.leads)).catch(() => {});
  }, []);

  const handleStatusChange = async (fu, status) => {
    try {
      await updateFollowUp(fu._id, { status });
      showToast('Follow-up status updated');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl text-ink-100">Follow-ups</h1>
          <p className="text-sm text-ink-500">Stay on top of every scheduled customer touchpoint.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" /></svg>
          Schedule Follow-up
        </button>
      </div>

      <div className="panel p-4 flex gap-3">
        <select className="input !w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {FOLLOWUP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="panel overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading follow-ups…" />
        ) : followUps.length === 0 ? (
          <EmptyState title="No follow-ups scheduled" action={<button className="btn-primary" onClick={() => setShowModal(true)}>Schedule Follow-up</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-base-700">
                  <th className="px-4 py-3 font-medium">Lead</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Salesperson</th>
                  <th className="px-4 py-3 font-medium">Reminder</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {followUps.map((fu) => (
                  <tr key={fu._id} className="table-row-hover border-b border-base-800/60">
                    <td className="px-4 py-3 text-ink-100">{fu.lead ? `${fu.lead.name} (${fu.lead.company})` : '—'}</td>
                    <td className="px-4 py-3 text-ink-300">{formatDate(fu.date)}</td>
                    <td className="px-4 py-3 text-ink-300">{fu.time || '—'}</td>
                    <td className="px-4 py-3 text-ink-300">{fu.type}</td>
                    <td className="px-4 py-3 text-ink-300">{fu.assignedTo || '—'}</td>
                    <td className="px-4 py-3 text-ink-500">{fu.reminder ? 'On' : 'Off'}</td>
                    <td className="px-4 py-3">
                      <select
                        className={`badge !py-1 !px-2 border-0 cursor-pointer ${STATUS_STYLES[fu.status]}`}
                        value={fu.status}
                        onChange={(e) => handleStatusChange(fu, e.target.value)}
                      >
                        {FOLLOWUP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <FollowUpFormModal leads={leads} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />
      )}
    </div>
  );
}

function FollowUpFormModal({ leads, onClose, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ lead: '', date: '', time: '', type: 'Call', assignedTo: '', reminder: true, notes: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lead) return showToast('Please select a lead', 'error');
    if (!form.date) return showToast('Follow-up date is required', 'error');
    setSaving(true);
    try {
      await createFollowUp({ ...form, assignedTo: form.assignedTo || null });
      showToast('Follow-up scheduled successfully');
      onSaved();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Schedule Follow-up" width="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Lead *</label>
          <select className="input" value={form.lead} onChange={(e) => setForm((f) => ({ ...f, lead: e.target.value }))}>
            <option value="">Select a lead</option>
            {leads.map((l) => <option key={l._id} value={l._id}>{l.name} ({l.company})</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date *</label>
            <input type="date" className="input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="label">Time</label>
            <input type="time" className="input" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {FOLLOWUP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Assigned Salesperson</label>
            <select className="input" value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}>
              <option value="">Unassigned</option>
              {SALESPEOPLE.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-300">
          <input type="checkbox" checked={form.reminder} onChange={(e) => setForm((f) => ({ ...f, reminder: e.target.checked }))} />
          Set reminder
        </label>
        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-[70px]" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Scheduling…' : 'Schedule'}</button>
        </div>
      </form>
    </Modal>
  );
}
