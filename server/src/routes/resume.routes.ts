import { Router } from 'express';
import multer from 'multer';
import { resumeController } from '../controllers/resume.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

router.post('/upload', upload.single('resume'), resumeController.uploadResume);
router.get('/profile', resumeController.getMasterProfile);

export default router;
