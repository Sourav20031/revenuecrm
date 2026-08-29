import { Router } from 'express';
import { createTask, getTasks, updateTask, deleteTask } from '../controllers/taskController.js';

const router = Router();

router.route('/').post(createTask).get(getTasks);
router.route('/:id').put(updateTask).delete(deleteTask);

export default router;
