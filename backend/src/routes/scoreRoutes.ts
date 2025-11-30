import express from 'express';
import { getScores, submitScore } from '../controllers/scoreController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, submitScore);
router.route('/:event_id').get(getScores);

export default router;

