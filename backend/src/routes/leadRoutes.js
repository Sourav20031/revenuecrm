import { Router } from 'express';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  updateLeadStage,
  getLeadTimeline,
} from '../controllers/leadController.js';

const router = Router();

router.route('/').post(createLead).get(getLeads);
router.route('/:id').get(getLeadById).put(updateLead).delete(deleteLead);
router.put('/:id/stage', updateLeadStage);
router.get('/:id/timeline', getLeadTimeline);

export default router;
