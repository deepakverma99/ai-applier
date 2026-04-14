import { Router } from 'express';
import { credentialsController } from '../controllers/credentials.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware as any);

router.post('/', credentialsController.addCredentials);
router.get('/', credentialsController.getCredentials);
router.delete('/:id', credentialsController.deleteCredentials); // Added delete route

export default router;
