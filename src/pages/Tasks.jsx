import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import { fetchTasks, createTask, updateTask } from '../services/tasks.js';
import { fetchLeads } from '../services/leads.js';
import { formatDate } from '../utils/format.js';
import { SALESPEOPLE, TASK_PRIORITIES, TASK_STATUSES } from '../utils/constants.js';
import { useToast } from '../hooks/useToast.jsx';

const STATUS_STYLES = {
  Pending: 'bg-state-info/10 text-state-info border border-state-info/30',
  'In Progress': 'bg-gold-500/10 text-gold-300 border border-gold-500/30',
  Completed: 'bg-state-success/10 text-state-success border border-state-success/30',
  Overdue: 'bg-state-danger/10 text-state-danger border border-state-danger/30',
};

export default function Tasks() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    setLoading(true);
    fetchTasks(statusFilter ? { status: statusFilter } : {})
      .then((res) => setTasks(res.data))
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);
  useEffect(() => {
    fetchLeads({ limit: 100 }).then((res) => setLeads(res.data.leads)).catch(() => {});
  }, []);

  const handleStatusChange = async (task, status) => {
    try {
      await updateTask(task._id, { status });
      showToast('Task status updated');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl text-ink-100">Tasks</h1>
          <p className="text-sm text-ink-500">Action items assigned to your sales team.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" /></svg>
          New Task
        </button>
      </div>

      <div className="panel p-4 flex gap-3">
        <select className="input !w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="panel overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading tasks…" />
        ) : tasks.length === 0 ? (
          <EmptyState title="No tasks found" action={<button className="btn-primary" onClick={() => setShowModal(true)}>Create Task</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-base-700">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Lead</th>
                  <th className="px-4 py-3 font-medium">Assigned To</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t._id} className="table-row-hover border-b border-base-800/60">
                    <td className="px-4 py-3 text-ink-100">{t.title}</td>
                    <td className="px-4 py-3 text-ink-300">{t.lead ? `${t.lead.name} (${t.lead.company})` : '—'}</td>
                    <td className="px-4 py-3 text-ink-300">{t.assignedTo || '—'}</td>
                    <td className="px-4 py-3 text-ink-500">{formatDate(t.dueDate)}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-4 py-3">
                      <select
                        className={`badge !py-1 !px-2 border-0 cursor-pointer ${STATUS_STYLES[t.status]}`}
                        value={t.status}
                        onChange={(e) => handleStatusChange(t, e.target.value)}
                      >
                        {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
        <TaskFormModal leads={leads} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />
      )}
    </div>
  );
}

function TaskFormModal({ leads, onClose, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ title: '', description: '', lead: '', assignedTo: '', dueDate: '', priority: 'Medium', status: 'Pending' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return showToast('Task title is required', 'error');
    setSaving(true);
    try {
      await createTask({
        ...form,
        lead: form.lead || null,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
      });
      showToast('Task created successfully');
      onSaved();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Create Task" width="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[70px]" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div>
          <label className="label">Lead</label>
          <select className="input" value={form.lead} onChange={(e) => setForm((f) => ({ ...f, lead: e.target.value }))}>
            <option value="">No lead attached</option>
            {leads.map((l) => <option key={l._id} value={l._id}>{l.name} ({l.company})</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Assigned To</label>
            <select className="input" value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}>
              <option value="">Unassigned</option>
              {SALESPEOPLE.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
              {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Due Date</label>
          <input type="date" className="input" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create Task'}</button>
        </div>
      </form>
    </Modal>
  );
}
