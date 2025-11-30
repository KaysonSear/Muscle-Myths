import express from 'express';
import {
  authUser,
  registerAdmin,
  getAdmins,
  deleteAdmin,
} from '../controllers/authController.js';
import { protect, superAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/auth/login', authUser);
router
  .route('/admins')
  .post(protect, superAdmin, registerAdmin)
  .get(protect, superAdmin, getAdmins);
router.route('/admins/:id').delete(protect, superAdmin, deleteAdmin);

export default router;

