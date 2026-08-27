import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import StageBadge from '../components/StageBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import QualificationBadge from '../components/QualificationBadge.jsx';
import Timeline from '../components/Timeline.jsx';
import LeadFormFields from '../components/LeadFormFields.jsx';
import { fetchLeadById, updateLead, updateLeadStage, fetchLeadTimeline } from '../services/leads.js';
import { fetchTasks, createTask } from '../services/tasks.js';
import { fetchFollowUps, createFollowUp } from '../services/followups.js';
import { fetchProposals } from '../services/proposals.js';
import { formatDate, formatDateTime, initials } from '../utils/format.js';
import { SALESPEOPLE, QUALIFICATION_STATUSES, LEAD_PRIORITIES, PIPELINE_STAGES, STAGE_LABELS, TASK_PRIORITIES, FOLLOWUP_TYPES } from '../utils/constants.js';
import { useToast } from '../hooks/useToast.jsx';

const TABS = ['Overview', 'Tasks', 'Follow-ups', 'Proposals', 'Timeline'];

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  const [tasks, setTasks] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(true);

  const [modal, setModal] = useState(null);

  const loadLead = useCallback(() => {
    setLoading(true);
    fetchLeadById(id)
      .then((res) => setLead(res.data))
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const loadTimeline = useCallback(() => {
    setTimelineLoading(true);
    fetchLeadTimeline(id)
      .then((res) => setTimelineEvents(res.data))
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setTimelineLoading(false));
  }, [id]);

  useEffect(() => {
    loadLead();
    loadTimeline();
    fetchTasks({ lead: id }).then((res) => setTasks(res.data)).catch(() => {});
    fetchFollowUps({ lead: id }).then((res) => setFollowUps(res.data)).catch(() => {});
    fetchProposals({ lead: id }).then((res) => setProposals(res.data)).catch(() => {});
  }, [id, loadLead, loadTimeline]);

  useEffect(() => {
    if (searchParams.get('edit') === '1') {
      setModal('edit');
      searchParams.delete('edit');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const refreshAll = () => {
    loadLead();
    loadTimeline();
    fetchTasks({ lead: id }).then((res) => setTasks(res.data)).catch(() => {});
    fetchFollowUps({ lead: id }).then((res) => setFollowUps(res.data)).catch(() => {});
  };

  if (loading) return <LoadingSpinner label="Loading lead…" />;
  if (!lead) return <EmptyState title="Lead not found" action={<Link to="/leads" className="btn-primary">Back to Leads</Link>} />;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/leads" className="text-xs text-ink-500 hover:text-gold-300">&larr; Back to Leads</Link>
      </div>

      <div className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-base-800 border border-gold-500/30 text-lg font-display text-gold-300">
              {initials(lead.name)}
            </div>
            <div>
              <h1 className="text-2xl text-ink-100">{lead.name}</h1>
              <p className="text-sm text-ink-500">{lead.company}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <StageBadge stage={lead.stage} />
                <PriorityBadge priority={lead.priority} />
                <QualificationBadge status={lead.qualification} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-ink-500 mr-1">Owner: <span className="text-ink-100">{lead.owner || 'Unassigned'}</span></span>
            <button className="btn-secondary" onClick={() => setModal('assign')}>Assign</button>
            <button className="btn-secondary" onClick={() => setModal('stage')}>Change Stage</button>
            <button className="btn-secondary" onClick={() => setModal('qualify')}>Qualify</button>
            <button className="btn-primary" onClick={() => setModal('edit')}>Edit</button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn-secondary" onClick={() => setModal('task')}>+ Create Task</button>
        <button className="btn-secondary" onClick={() => setModal('followup')}>+ Schedule Follow-up</button>
        <button className="btn-secondary" onClick={() => setModal('note')}>+ Add Note</button>
      </div>

      <div className="panel">
        <div className="flex overflow-x-auto border-b border-base-700">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-gold-400 text-gold-300'
                  : 'border-transparent text-ink-500 hover:text-ink-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'Overview' && <OverviewTab lead={lead} />}

          {activeTab === 'Tasks' && (
            tasks.length === 0 ? (
              <EmptyState title="No tasks yet" action={<button className="btn-primary" onClick={() => setModal('task')}>Create Task</button>} />
            ) : (
              <div className="space-y-3">
                {tasks.map((t) => (
                  <div key={t._id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm text-ink-100 font-medium">{t.title}</p>
                      <p className="text-xs text-ink-500">Due {formatDate(t.dueDate)} · {t.assignedTo || 'Unassigned'}</p>
                    </div>
                    <div className="flex gap-2">
                      <PriorityBadge priority={t.priority} />
                      <span className="badge bg-base-800 border border-base-600 text-ink-300">{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'Follow-ups' && (
            followUps.length === 0 ? (
              <EmptyState title="No follow-ups scheduled" action={<button className="btn-primary" onClick={() => setModal('followup')}>Schedule Follow-up</button>} />
            ) : (
              <div className="space-y-3">
                {followUps.map((f) => (
                  <div key={f._id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm text-ink-100 font-medium">{f.type} with {lead.name}</p>
                      <p className="text-xs text-ink-500">{formatDate(f.date)} {f.time && `at ${f.time}`} · {f.assignedTo || 'Unassigned'}</p>
                    </div>
                    <span className="badge bg-state-warning/10 text-state-warning border border-state-warning/30">{f.status}</span>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'Proposals' && (
            proposals.length === 0 ? (
              <EmptyState title="No proposals tracked" description="Proposals sent to this lead will appear here." />
            ) : (
              <div className="space-y-3">
                {proposals.map((p) => (
                  <div key={p._id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm text-ink-100 font-medium">{p.reference}</p>
                      <p className="text-xs text-ink-500">Sent {formatDate(p.sentDate)}</p>
                    </div>
                    <span className="badge bg-gold-500/10 text-gold-300 border border-gold-500/30">{p.status}</span>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'Timeline' && <Timeline events={timelineEvents} loading={timelineLoading} />}
        </div>
      </div>

      {modal === 'edit' && (
        <EditLeadModal lead={lead} onClose={() => setModal(null)} onSaved={() => { setModal(null); refreshAll(); }} />
      )}
      {modal === 'assign' && (
        <AssignModal lead={lead} onClose={() => setModal(null)} onSaved={() => { setModal(null); refreshAll(); }} />
      )}
      {modal === 'stage' && (
        <StageModal lead={lead} onClose={() => setModal(null)} onSaved={() => { setModal(null); refreshAll(); }} />
      )}
      {modal === 'qualify' && (
        <QualifyModal lead={lead} onClose={() => setModal(null)} onSaved={() => { setModal(null); refreshAll(); }} />
      )}
      {modal === 'task' && (
        <TaskModal lead={lead} onClose={() => setModal(null)} onSaved={() => { setModal(null); refreshAll(); }} />
      )}
      {modal === 'followup' && (
        <FollowUpModal lead={lead} onClose={() => setModal(null)} onSaved={() => { setModal(null); refreshAll(); }} />
      )}
      {modal === 'note' && (
        <NoteModal lead={lead} onClose={() => setModal(null)} onSaved={() => { setModal(null); refreshAll(); }} />
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-base-800/60 last:border-0">
      <span className="text-xs text-ink-500">{label}</span>
      <span className="text-sm text-ink-100 text-right">{value || '—'}</span>
    </div>
  );
}

function OverviewTab({ lead }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-medium text-gold-300 uppercase tracking-wide mb-3">Contact Information</h3>
        <div className="card p-4">
          <InfoRow label="Full Name" value={lead.name} />
          <InfoRow label="Company" value={lead.company} />
          <InfoRow label="Email" value={lead.email} />
          <InfoRow label="Phone" value={lead.phone} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gold-300 uppercase tracking-wide mb-3">Lead Information</h3>
        <div className="card p-4">
          <InfoRow label="Source" value={lead.source} />
          <InfoRow label="Tags" value={lead.tags?.join(', ')} />
          <InfoRow label="Created" value={formatDateTime(lead.createdAt)} />
          <InfoRow label="Last Updated" value={formatDateTime(lead.updatedAt)} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gold-300 uppercase tracking-wide mb-3">Qualification</h3>
        <div className="card p-4">
          <InfoRow label="Status" value={lead.qualification} />
          <InfoRow label="Lead Score" value={`${lead.leadScore ?? 0} / 100`} />
          <InfoRow label="Priority" value={lead.priority} />
          <InfoRow label="Requirements" value={lead.requirements} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gold-300 uppercase tracking-wide mb-3">Sales Information</h3>
        <div className="card p-4">
          <InfoRow label="Owner" value={lead.owner} />
          <InfoRow label="Pipeline Stage" value={STAGE_LABELS[lead.stage]} />
          <InfoRow label="Notes" value={<span className="whitespace-pre-wrap">{lead.notes}</span>} />
        </div>
      </div>
    </div>
  );
}

function EditLeadModal({ lead, onClose, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    priority: lead.priority,
    owner: lead.owner || '',
    qualification: lead.qualification,
    stage: lead.stage,
    leadScore: lead.leadScore,
    tagsInput: (lead.tags || []).join(', '),
    requirements: lead.requirements,
    notes: lead.notes,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const onChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateLead(lead._id, {
        ...form,
        owner: form.owner || null,
        leadScore: Number(form.leadScore) || 0,
        tags: form.tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      });
      showToast('Lead updated successfully');
      onSaved();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Edit Lead" width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <LeadFormFields form={form} errors={errors} onChange={onChange} />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </form>
    </Modal>
  );
}

function AssignModal({ lead, onClose, onSaved }) {
  const { showToast } = useToast();
  const [owner, setOwner] = useState(lead.owner || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateLead(lead._id, { owner: owner || null });
      showToast(`Lead assigned to ${owner || 'Unassigned'}`);
      onSaved();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Assign Salesperson" width="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Salesperson</label>
          <select className="input" value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option value="">Unassigned</option>
            {SALESPEOPLE.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Assigning…' : 'Assign'}</button>
        </div>
      </form>
    </Modal>
  );
}

function StageModal({ lead, onClose, onSaved }) {
  const { showToast } = useToast();
  const [stage, setStage] = useState(lead.stage);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateLeadStage(lead._id, stage);
      showToast(`Stage updated to ${STAGE_LABELS[stage]}`);
      onSaved();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Change Pipeline Stage" width="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Pipeline Stage</label>
          <select className="input" value={stage} onChange={(e) => setStage(e.target.value)}>
            {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Updating…' : 'Update Stage'}</button>
        </div>
      </form>
    </Modal>
  );
}

function QualifyModal({ lead, onClose, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    qualification: lead.qualification,
    leadScore: lead.leadScore,
    priority: lead.priority,
    requirements: lead.requirements,
    notes: lead.notes,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateLead(lead._id, { ...form, leadScore: Number(form.leadScore) || 0 });
      showToast('Qualification updated');
      onSaved();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Update Qualification" width="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Qualification Status</label>
            <select className="input" value={form.qualification} onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))}>
              {QUALIFICATION_STATUSES.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
              {LEAD_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Lead Score (0-100)</label>
          <input type="number" min="0" max="100" className="input" value={form.leadScore} onChange={(e) => setForm((f) => ({ ...f, leadScore: e.target.value }))} />
        </div>
        <div>
          <label className="label">Requirements</label>
          <textarea className="input min-h-[70px]" value={form.requirements} onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))} />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-[70px]" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

function TaskModal({ lead, onClose, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ title: '', description: '', assignedTo: lead.owner || '', dueDate: '', priority: 'Medium' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return showToast('Task title is required', 'error');
    setSaving(true);
    try {
      await createTask({ ...form, lead: lead._id, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null });
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

function FollowUpModal({ lead, onClose, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ date: '', time: '', type: 'Call', assignedTo: lead.owner || '', reminder: true, notes: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date) return showToast('Follow-up date is required', 'error');
    setSaving(true);
    try {
      await createFollowUp({ ...form, lead: lead._id, assignedTo: form.assignedTo || null });
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

function NoteModal({ lead, onClose, onSaved }) {
  const { showToast } = useToast();
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return showToast('Note cannot be empty', 'error');
    setSaving(true);
    try {
      await updateLead(lead._id, { noteText: noteText.trim() });
      showToast('Note added successfully');
      onSaved();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Add Note" width="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea autoFocus className="input min-h-[100px]" placeholder="Write a note about this lead…" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Adding…' : 'Add Note'}</button>
        </div>
      </form>
    </Modal>
  );
}
