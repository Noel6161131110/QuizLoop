import { Router } from 'express';
import MCQController from '../controllers/MCQController.ts';

const router = Router();


router.post('', MCQController.getAllMCQsGroupedBySegment)

router.put('', MCQController.editMCQById);

export default router;