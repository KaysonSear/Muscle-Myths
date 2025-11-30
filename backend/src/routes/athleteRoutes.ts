import express from 'express';
import {
  getAthletes,
  getAthleteById,
  createAthlete,
  updateAthlete,
  deleteAthlete,
} from '../controllers/athleteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getAthletes).post(protect, createAthlete);
router
  .route('/:id')
  .get(protect, getAthleteById)
  .put(protect, updateAthlete)
  .delete(protect, deleteAthlete);

export default router;

