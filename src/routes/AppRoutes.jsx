import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Leads from '../pages/Leads.jsx';
import AddLead from '../pages/AddLead.jsx';
import LeadDetails from '../pages/LeadDetails.jsx';
import Pipeline from '../pages/Pipeline.jsx';
import Tasks from '../pages/Tasks.jsx';
import FollowUps from '../pages/FollowUps.jsx';
import Proposals from '../pages/Proposals.jsx';
import Notifications from '../pages/Notifications.jsx';
import Analytics from '../pages/Analytics.jsx';
import AuditLogs from '../pages/AuditLogs.jsx';
import NotFound from '../pages/NotFound.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/leads/new" element={<AddLead />} />
        <Route path="/leads/:id" element={<LeadDetails />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/follow-ups" element={<FollowUps />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
