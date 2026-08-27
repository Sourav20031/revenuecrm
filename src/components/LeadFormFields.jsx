import { LEAD_SOURCES, LEAD_PRIORITIES, SALESPEOPLE, QUALIFICATION_STATUSES, PIPELINE_STAGES, STAGE_LABELS } from '../utils/constants.js';

function Field({ label, error, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-state-danger">{error}</p>}
    </div>
  );
}

export default function LeadFormFields({ form, errors, onChange }) {
  const set = (key) => (e) => onChange(key, e.target.value);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Full Name *" error={errors.name}>
        <input className="input" value={form.name} onChange={set('name')} placeholder="e.g. Rahul Sharma" />
      </Field>

      <Field label="Company Name *" error={errors.company}>
        <input className="input" value={form.company} onChange={set('company')} placeholder="e.g. ABC Events" />
      </Field>

      <Field label="Email *" error={errors.email}>
        <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="name@company.com" />
      </Field>

      <Field label="Phone *" error={errors.phone}>
        <input className="input" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
      </Field>

      <Field label="Lead Source">
        <select className="input" value={form.source} onChange={set('source')}>
          {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>

      <Field label="Priority">
        <select className="input" value={form.priority} onChange={set('priority')}>
          {LEAD_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </Field>

      <Field label="Assigned Salesperson">
        <select className="input" value={form.owner || ''} onChange={set('owner')}>
          <option value="">Unassigned</option>
          {SALESPEOPLE.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>

      <Field label="Qualification Status">
        <select className="input" value={form.qualification} onChange={set('qualification')}>
          {QUALIFICATION_STATUSES.map((q) => <option key={q} value={q}>{q}</option>)}
        </select>
      </Field>

      <Field label="Pipeline Stage">
        <select className="input" value={form.stage} onChange={set('stage')}>
          {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
        </select>
      </Field>

      <Field label="Lead Score (0-100)">
        <input
          className="input"
          type="number"
          min="0"
          max="100"
          value={form.leadScore}
          onChange={set('leadScore')}
        />
      </Field>

      <Field label="Tags (comma separated)">
        <input className="input" value={form.tagsInput} onChange={set('tagsInput')} placeholder="corporate, premium" />
      </Field>

      <div className="sm:col-span-2">
        <Field label="Requirements">
          <textarea className="input min-h-[80px]" value={form.requirements} onChange={set('requirements')} placeholder="Event scope, headcount, dates…" />
        </Field>
      </div>

      <div className="sm:col-span-2">
        <Field label="Notes">
          <textarea className="input min-h-[80px]" value={form.notes} onChange={set('notes')} placeholder="Internal notes about this lead…" />
        </Field>
      </div>
    </div>
  );
}
