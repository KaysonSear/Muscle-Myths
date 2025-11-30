import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getEvents).post(protect, createEvent);
router
  .route('/:id')
  .get(getEventById)
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

export default router;

