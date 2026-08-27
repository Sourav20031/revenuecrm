import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import { fetchProposals, createProposal, updateProposal } from '../services/proposals.js';
import { fetchLeads } from '../services/leads.js';
import { formatDate } from '../utils/format.js';
import { PROPOSAL_STATUSES } from '../utils/constants.js';
import { useToast } from '../hooks/useToast.jsx';

const STATUS_STYLES = {
  Draft: 'bg-base-800 text-ink-300 border border-base-600',
  Sent: 'bg-state-info/10 text-state-info border border-state-info/30',
  Viewed: 'bg-gold-500/10 text-gold-300 border border-gold-500/30',
  Negotiation: 'bg-state-warning/10 text-state-warning border border-state-warning/30',
  Accepted: 'bg-state-success/10 text-state-success border border-state-success/30',
  Rejected: 'bg-state-danger/10 text-state-danger border border-state-danger/30',
};

export default function Proposals() {
  const { showToast } = useToast();
  const [proposals, setProposals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    setLoading(true);
    fetchProposals()
      .then((res) => setProposals(res.data))
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useEffect(() => {
    fetchLeads({ limit: 100 }).then((res) => setLeads(res.data.leads)).catch(() => {});
  }, []);

  const handleStatusChange = async (proposal, status) => {
    try {
      await updateProposal(proposal._id, { status });
      showToast('Proposal status updated');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl text-ink-100">Proposals</h1>
          <p className="text-sm text-ink-500">
            Lightweight tracking for sales proposals. Commercial quote generation lives in the Core Commerce platform.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" /></svg>
          Track Proposal
        </button>
      </div>

      <div className="panel overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading proposals…" />
        ) : proposals.length === 0 ? (
          <EmptyState title="No proposals tracked yet" action={<button className="btn-primary" onClick={() => setShowModal(true)}>Track Proposal</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-base-700">
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Lead</th>
                  <th className="px-4 py-3 font-medium">Sent Date</th>
                  <th className="px-4 py-3 font-medium">Customer Engagement</th>
                  <th className="px-4 py-3 font-medium">Follow-up</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => (
                  <tr key={p._id} className="table-row-hover border-b border-base-800/60">
                    <td className="px-4 py-3 text-ink-100 font-medium">{p.reference}</td>
                    <td className="px-4 py-3 text-ink-300">{p.lead ? `${p.lead.name} (${p.lead.company})` : '—'}</td>
                    <td className="px-4 py-3 text-ink-500">{formatDate(p.sentDate)}</td>
                    <td className="px-4 py-3 text-ink-300 max-w-xs truncate">{p.customerEngagement || '—'}</td>
                    <td className="px-4 py-3 text-ink-300 max-w-xs truncate">{p.followUp || '—'}</td>
                    <td className="px-4 py-3">
                      <select
                        className={`badge !py-1 !px-2 border-0 cursor-pointer ${STATUS_STYLES[p.status]}`}
                        value={p.status}
                        onChange={(e) => handleStatusChange(p, e.target.value)}
                      >
                        {PROPOSAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
        <ProposalFormModal leads={leads} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />
      )}
    </div>
  );
}

function ProposalFormModal({ leads, onClose, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ lead: '', reference: '', status: 'Draft', sentDate: '', customerEngagement: '', followUp: '', salesNotes: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lead) return showToast('Please select a lead', 'error');
    if (!form.reference.trim()) return showToast('Proposal reference is required', 'error');
    setSaving(true);
    try {
      await createProposal({ ...form, sentDate: form.sentDate || null });
      showToast('Proposal tracked successfully');
      onSaved();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Track Proposal" width="max-w-lg">
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
            <label className="label">Proposal Reference *</label>
            <input className="input" placeholder="PROP-2026-1001" value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} />
          </div>
          <div>
            <label className="label">Sent Date</label>
            <input type="date" className="input" value={form.sentDate} onChange={(e) => setForm((f) => ({ ...f, sentDate: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            {PROPOSAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Customer Engagement</label>
          <textarea className="input min-h-[60px]" value={form.customerEngagement} onChange={(e) => setForm((f) => ({ ...f, customerEngagement: e.target.value }))} />
        </div>
        <div>
          <label className="label">Follow-up</label>
          <textarea className="input min-h-[60px]" value={form.followUp} onChange={(e) => setForm((f) => ({ ...f, followUp: e.target.value }))} />
        </div>
        <div>
          <label className="label">Sales Notes</label>
          <textarea className="input min-h-[60px]" value={form.salesNotes} onChange={(e) => setForm((f) => ({ ...f, salesNotes: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}
