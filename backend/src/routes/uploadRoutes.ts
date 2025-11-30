import express from 'express';
import { upload, uploadFiles } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.array('media'), uploadFiles);

export default router;

