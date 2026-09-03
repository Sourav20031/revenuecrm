import { Router } from 'express';
import leadRoutes from './leadRoutes.js';
import taskRoutes from './taskRoutes.js';
import followupRoutes from './followupRoutes.js';
import proposalRoutes from './proposalRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import auditRoutes from './auditRoutes.js';
import auraRoutes from './auraRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StarVnt Revenue CRM API is running',
  });
});

router.use('/leads', leadRoutes);
// Aura+ Intelligence Layer: a separate router mounted on the same /leads
// prefix so GET /api/v1/leads/:id/intelligence sits alongside the existing
// lead endpoints, while its controller/service code stays fully isolated
// from leadController.js (Aura+ never touches leadRoutes.js or its logic).
router.use('/leads', auraRoutes);
router.use('/tasks', taskRoutes);
router.use('/followups', followupRoutes);
router.use('/proposals', proposalRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit-logs', auditRoutes);

export default router;
