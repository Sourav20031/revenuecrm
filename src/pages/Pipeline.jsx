import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import { fetchLeads, updateLeadStage } from '../services/leads.js';
import { PIPELINE_STAGES, STAGE_LABELS } from '../utils/constants.js';
import { useToast } from '../hooks/useToast.jsx';

const COLUMN_ACCENTS = {
  NEW: 'border-t-state-info',
  QUALIFIED: 'border-t-gold-400',
  FOLLOW_UP: 'border-t-state-warning',
  PROPOSAL: 'border-t-purple-400',
  WON: 'border-t-state-success',
  LOST: 'border-t-state-danger',
};

export default function Pipeline() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLeads = () => {
    setLoading(true);
    fetchLeads({ limit: 100 })
      .then((res) => setLeads(res.data.leads))
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(loadLeads, []);

  const handleStageChange = async (lead, newStage) => {
    if (newStage === lead.stage) return;
    try {
      await updateLeadStage(lead._id, newStage);
      showToast(`${lead.name} moved to ${STAGE_LABELS[newStage]}`);
      setLeads((prev) => prev.map((l) => (l._id === lead._id ? { ...l, stage: newStage } : l)));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingSpinner label="Loading pipeline…" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl text-ink-100">Pipeline</h1>
        <p className="text-sm text-ink-500">Track every lead's progress across the sales pipeline.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage);
          return (
            <div key={stage} className={`panel border-t-2 ${COLUMN_ACCENTS[stage]} flex flex-col min-h-[200px]`}>
              <div className="px-4 py-3 border-b border-base-700 flex items-center justify-between">
                <h2 className="text-sm font-medium text-ink-100">{STAGE_LABELS[stage]}</h2>
                <span className="text-xs text-ink-500 bg-base-800 rounded-full px-2 py-0.5">{stageLeads.length}</span>
              </div>
              <div className="p-3 space-y-3 flex-1">
                {stageLeads.length === 0 ? (
                  <p className="text-xs text-ink-500 text-center py-6">No leads</p>
                ) : (
                  stageLeads.map((lead) => (
                    <div key={lead._id} className="card p-3 space-y-2 cursor-pointer" onClick={() => navigate(`/leads/${lead._id}`)}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm text-ink-100 font-medium leading-tight">{lead.name}</p>
                          <p className="text-xs text-ink-500">{lead.company}</p>
                        </div>
                        <PriorityBadge priority={lead.priority} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-ink-500">
                        <span>{lead.owner || 'Unassigned'}</span>
                        <span className="text-gold-300">Score {lead.leadScore ?? 0}</span>
                      </div>
                      <select
                        className="input !text-xs !py-1.5"
                        value={lead.stage}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStageChange(lead, e.target.value)}
                      >
                        {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                      </select>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
