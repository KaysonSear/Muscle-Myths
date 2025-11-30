import express from 'express';
import { generateLineup, getLineup } from '../controllers/lineupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:event_id').get(getLineup);
router.route('/:event_id/generate').post(protect, generateLineup);

export default router;

