import express from 'express';
import {
  createRegistration,
  getRegistrations,
  getRegistrationById,
  updateRegistration,
  deleteRegistration,
} from '../controllers/registrationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createRegistration).get(protect, getRegistrations);
router
  .route('/:id')
  .get(protect, getRegistrationById)
  .put(protect, updateRegistration)
  .delete(protect, deleteRegistration);

export default router;
