import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LeadFormFields from '../components/LeadFormFields.jsx';
import { createLead } from '../services/leads.js';
import { validateLeadForm } from '../utils/validation.js';
import { useToast } from '../hooks/useToast.jsx';

const initialForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  source: 'Website',
  priority: 'Medium',
  owner: '',
  qualification: 'New',
  stage: 'NEW',
  leadScore: 0,
  tagsInput: '',
  requirements: '',
  notes: '',
};

export default function AddLead() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLeadForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast('Please fix the highlighted fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        source: form.source,
        priority: form.priority,
        owner: form.owner || null,
        qualification: form.qualification,
        stage: form.stage,
        leadScore: Number(form.leadScore) || 0,
        tags: form.tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        requirements: form.requirements,
        notes: form.notes,
      };

      const res = await createLead(payload);
      showToast(`Lead "${res.data.name}" created successfully`);
      navigate(`/leads/${res.data._id}`);
    } catch (err) {
      if (err.errors?.length) {
        showToast(err.errors.join(', '), 'error');
      } else {
        showToast(err.message, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <Link to="/leads" className="text-xs text-ink-500 hover:text-gold-300">&larr; Back to Leads</Link>
        <h1 className="text-2xl text-ink-100 mt-1">Add New Lead</h1>
        <p className="text-sm text-ink-500">Capture the details below to bring this lead into the pipeline.</p>
      </div>

      <form onSubmit={handleSubmit} className="panel p-6 space-y-6">
        <LeadFormFields form={form} errors={errors} onChange={onChange} />

        <div className="flex justify-end gap-3 pt-2 border-t border-base-700">
          <Link to="/leads" className="btn-secondary">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Lead'}
          </button>
        </div>
      </form>
    </div>
  );
}
