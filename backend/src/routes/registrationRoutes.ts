import express from 'express';
import {
  createRegistration,
  getRegistrations,
} from '../controllers/registrationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createRegistration).get(protect, getRegistrations);

export default router;

