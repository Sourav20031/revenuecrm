import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import KpiCard from '../components/KpiCard.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import StageBadge from '../components/StageBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { fetchDashboard } from '../services/dashboard.js';
import { formatDate, timeAgo } from '../utils/format.js';
import { useToast } from '../hooks/useToast.jsx';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    fetchDashboard()
      .then((res) => mounted && setData(res.data))
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard…" />;

  const kpis = data?.kpis || {};
  const funnel = data?.funnel || [];
  const maxFunnel = Math.max(...funnel.map((f) => f.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl text-ink-100">Dashboard</h1>
          <p className="text-sm text-ink-500">Overview of your sales pipeline and activity.</p>
        </div>
        <Link to="/leads/new" className="btn-primary">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" /></svg>
          Add Lead
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Leads" value={kpis.totalLeads ?? 0} accent />
        <KpiCard label="New Leads" value={kpis.newLeads ?? 0} />
        <KpiCard label="Qualified Leads" value={kpis.qualifiedLeads ?? 0} />
        <KpiCard label="Follow-ups Due" value={kpis.followUpsDue ?? 0} />
        <KpiCard label="Open Tasks" value={kpis.openTasks ?? 0} />
        <KpiCard label="Proposals" value={kpis.proposals ?? 0} />
        <KpiCard label="Won" value={kpis.won ?? 0} />
        <KpiCard label="Lost" value={kpis.lost ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="panel p-5 lg:col-span-1">
          <h2 className="text-lg text-ink-100 mb-4">Lead Funnel</h2>
          <div className="space-y-3">
            {funnel.map((stage) => (
              <div key={stage.stage}>
                <div className="flex justify-between text-xs text-ink-500 mb-1">
                  <span>{stage.stage}</span>
                  <span>{stage.count}</span>
                </div>
                <div className="h-2 rounded-full bg-base-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400"
                    style={{ width: `${(stage.count / maxFunnel) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-ink-100">Recent Leads</h2>
            <Link to="/leads" className="text-xs text-gold-300 hover:text-gold-200">View all</Link>
          </div>
          {(!data?.recentLeads || data.recentLeads.length === 0) ? (
            <EmptyState title="No leads yet" description="Add your first lead to see it here." />
          ) : (
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-base-700">
                    <th className="px-5 py-2 font-medium">Name</th>
                    <th className="px-5 py-2 font-medium">Company</th>
                    <th className="px-5 py-2 font-medium">Source</th>
                    <th className="px-5 py-2 font-medium">Owner</th>
                    <th className="px-5 py-2 font-medium">Stage</th>
                    <th className="px-5 py-2 font-medium">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentLeads.map((lead) => (
                    <tr key={lead._id} className="table-row-hover border-b border-base-800/60 cursor-pointer" onClick={() => (window.location.href = `/leads/${lead._id}`)}>
                      <td className="px-5 py-2.5 text-ink-100">{lead.name}</td>
                      <td className="px-5 py-2.5 text-ink-300">{lead.company}</td>
                      <td className="px-5 py-2.5 text-ink-300">{lead.source}</td>
                      <td className="px-5 py-2.5 text-ink-300">{lead.owner || '—'}</td>
                      <td className="px-5 py-2.5"><StageBadge stage={lead.stage} /></td>
                      <td className="px-5 py-2.5"><PriorityBadge priority={lead.priority} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="panel p-5">
          <h2 className="text-lg text-ink-100 mb-4">Upcoming Follow-ups</h2>
          {(!data?.upcomingFollowUps || data.upcomingFollowUps.length === 0) ? (
            <EmptyState title="No upcoming follow-ups" />
          ) : (
            <div className="space-y-3">
              {data.upcomingFollowUps.map((fu) => (
                <div key={fu._id} className="card p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-ink-100">{fu.lead?.name} <span className="text-ink-500">· {fu.lead?.company}</span></p>
                    <p className="text-xs text-ink-500">{formatDate(fu.date)} {fu.time && `at ${fu.time}`} · {fu.assignedTo || 'Unassigned'}</p>
                  </div>
                  <span className="badge bg-state-warning/10 text-state-warning border border-state-warning/30">{fu.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel p-5">
          <h2 className="text-lg text-ink-100 mb-4">Recent Activity</h2>
          {(!data?.recentActivity || data.recentActivity.length === 0) ? (
            <EmptyState title="No activity yet" />
          ) : (
            <div className="space-y-3">
              {data.recentActivity.map((event) => (
                <div key={event._id} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-ink-100">{event.description}</p>
                    <p className="text-xs text-ink-500">{event.lead?.name ? `${event.lead.name} · ` : ''}{timeAgo(event.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
