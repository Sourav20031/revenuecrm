import { Router } from 'express';
import { getLeadIntelligence } from '../controllers/auraController.js';

const router = Router();

// Mounted at /leads in routes/index.js, alongside (not inside) leadRoutes.js.
// GET /api/v1/leads/:id/intelligence — Aura+ structured insight output for one lead.
router.get('/:id/intelligence', getLeadIntelligence);

export default router;
