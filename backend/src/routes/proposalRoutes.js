import { Router } from 'express';
import { createProposal, getProposals, updateProposal } from '../controllers/proposalController.js';

const router = Router();

router.route('/').post(createProposal).get(getProposals);
router.route('/:id').put(updateProposal);

export default router;
