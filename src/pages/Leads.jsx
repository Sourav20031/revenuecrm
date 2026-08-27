import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StageBadge from '../components/StageBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import QualificationBadge from '../components/QualificationBadge.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { fetchLeads, deleteLead } from '../services/leads.js';
import { formatDate } from '../utils/format.js';
import { PIPELINE_STAGES, LEAD_PRIORITIES, QUALIFICATION_STATUSES, STAGE_LABELS } from '../utils/constants.js';
import { useToast } from '../hooks/useToast.jsx';

const PAGE_SIZE = 10;

export default function Leads() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [priority, setPriority] = useState('');
  const [qualification, setQualification] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadLeads = useCallback(() => {
    setLoading(true);
    fetchLeads({ search, stage, priority, qualification, sortBy, sortDir, page, limit: PAGE_SIZE })
      .then((res) => {
        setLeads(res.data.leads);
        setPagination(res.data.pagination);
      })
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [search, stage, priority, qualification, sortBy, sortDir, page]);

  useEffect(() => {
    const timer = setTimeout(loadLeads, 300);
    return () => clearTimeout(timer);
  }, [loadLeads]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleDelete = async () => {
    try {
      await deleteLead(deleteTarget._id);
      showToast(`Lead "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      loadLeads();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const sortIndicator = (field) => (sortBy === field ? (sortDir === 'asc' ? '▲' : '▼') : '');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl text-ink-100">Leads</h1>
          <p className="text-sm text-ink-500">{pagination.total} total leads</p>
        </div>
        <Link to="/leads/new" className="btn-primary">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" /></svg>
          Add Lead
        </Link>
      </div>

      <div className="panel p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z" />
          </svg>
          <input
            className="input !pl-9"
            placeholder="Search name, company, email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="input !w-auto" value={stage} onChange={(e) => { setStage(e.target.value); setPage(1); }}>
          <option value="">All Stages</option>
          {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
        </select>
        <select className="input !w-auto" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}>
          <option value="">All Priorities</option>
          {LEAD_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="input !w-auto" value={qualification} onChange={(e) => { setQualification(e.target.value); setPage(1); }}>
          <option value="">All Qualification</option>
          {QUALIFICATION_STATUSES.map((q) => <option key={q} value={q}>{q}</option>)}
        </select>
      </div>

      <div className="panel overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading leads…" />
        ) : leads.length === 0 ? (
          <EmptyState
            title="No leads found"
            description="Try adjusting your filters, or add a new lead to get started."
            action={<Link to="/leads/new" className="btn-primary">Add Lead</Link>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-base-700">
                    <th className="px-4 py-3 font-medium cursor-pointer select-none" onClick={() => toggleSort('name')}>Name {sortIndicator('name')}</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium cursor-pointer select-none" onClick={() => toggleSort('priority')}>Priority {sortIndicator('priority')}</th>
                    <th className="px-4 py-3 font-medium">Stage</th>
                    <th className="px-4 py-3 font-medium">Qualification</th>
                    <th className="px-4 py-3 font-medium cursor-pointer select-none" onClick={() => toggleSort('createdAt')}>Created {sortIndicator('createdAt')}</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id} className="table-row-hover border-b border-base-800/60">
                      <td className="px-4 py-3 text-ink-100 font-medium">
                        <button className="hover:text-gold-300" onClick={() => navigate(`/leads/${lead._id}`)}>{lead.name}</button>
                      </td>
                      <td className="px-4 py-3 text-ink-300">{lead.company}</td>
                      <td className="px-4 py-3 text-ink-300">{lead.email}</td>
                      <td className="px-4 py-3 text-ink-300">{lead.phone}</td>
                      <td className="px-4 py-3 text-ink-300">{lead.source}</td>
                      <td className="px-4 py-3 text-ink-300">{lead.owner || '—'}</td>
                      <td className="px-4 py-3"><PriorityBadge priority={lead.priority} /></td>
                      <td className="px-4 py-3"><StageBadge stage={lead.stage} /></td>
                      <td className="px-4 py-3"><QualificationBadge status={lead.qualification} /></td>
                      <td className="px-4 py-3 text-ink-500 whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button className="btn-ghost !px-2 !py-1" onClick={() => navigate(`/leads/${lead._id}`)}>View</button>
                          <button className="btn-ghost !px-2 !py-1" onClick={() => navigate(`/leads/${lead._id}?edit=1`)}>Edit</button>
                          <button className="btn-ghost !px-2 !py-1 text-state-danger" onClick={() => setDeleteTarget(lead)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-base-700 text-sm text-ink-500">
              <span>Page {pagination.page} of {pagination.totalPages}</span>
              <div className="flex gap-2">
                <button className="btn-secondary !py-1.5" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
                <button className="btn-secondary !py-1.5" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete lead"
        description={`This will permanently remove "${deleteTarget?.name}" and its timeline history.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
