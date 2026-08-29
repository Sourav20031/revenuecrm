import { Router } from 'express';
import leadRoutes from './leadRoutes.js';
import taskRoutes from './taskRoutes.js';
import followupRoutes from './followupRoutes.js';
import proposalRoutes from './proposalRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import auditRoutes from './auditRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StarVnt Revenue CRM API is running',
  });
});

router.use('/leads', leadRoutes);
router.use('/tasks', taskRoutes);
router.use('/followups', followupRoutes);
router.use('/proposals', proposalRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit-logs', auditRoutes);

export default router;
