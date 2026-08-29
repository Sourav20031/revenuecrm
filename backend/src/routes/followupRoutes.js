import { Router } from 'express';
import { createFollowUp, getFollowUps, updateFollowUp, deleteFollowUp } from '../controllers/followupController.js';

const router = Router();

router.route('/').post(createFollowUp).get(getFollowUps);
router.route('/:id').put(updateFollowUp).delete(deleteFollowUp);

export default router;
