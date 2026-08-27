import { useEffect, useState } from 'react';
import KpiCard from '../components/KpiCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { fetchDashboard } from '../services/dashboard.js';
import { useToast } from '../hooks/useToast.jsx';

export default function Analytics() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then((res) => setData(res.data))
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading analytics…" />;

  const kpis = data?.kpis || {};
  const conversion = kpis.totalLeads ? Math.round((kpis.won / kpis.totalLeads) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ink-100">Analytics</h1>
        <p className="text-sm text-ink-500">High-level performance snapshot. Deeper reporting is planned for a future sprint.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Win Rate" value={`${conversion}%`} accent />
        <KpiCard label="Total Leads" value={kpis.totalLeads ?? 0} />
        <KpiCard label="Won Deals" value={kpis.won ?? 0} />
        <KpiCard label="Lost Deals" value={kpis.lost ?? 0} />
      </div>

      <div className="panel p-5">
        <h2 className="text-lg text-ink-100 mb-4">Stage Distribution</h2>
        <div className="space-y-3">
          {(data?.funnel || []).map((stage) => (
            <div key={stage.stage} className="flex items-center gap-3">
              <span className="w-24 text-xs text-ink-500">{stage.stage}</span>
              <div className="flex-1 h-2 rounded-full bg-base-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-600 to-gold-400"
                  style={{ width: `${Math.min((stage.count / Math.max(kpis.totalLeads, 1)) * 100, 100)}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-ink-300">{stage.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
