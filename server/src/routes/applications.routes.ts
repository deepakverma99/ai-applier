import { Router } from 'express';
import { applicationsController } from '../controllers/applications.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware as any);

router.get('/', applicationsController.getApplications);
router.post('/', applicationsController.createApplication);
router.post('/bulk', applicationsController.bulkCreateApplications); // New bulk endpoint
router.get('/:id', applicationsController.getApplicationById);

export default router;
