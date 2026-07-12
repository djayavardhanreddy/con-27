import { Router } from 'express';
import { createRegistration, getRegistrations, updateRegistrationStatus } from '../controllers/registration.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/', createRegistration);
router.get('/', authenticateJWT, getRegistrations);
router.patch('/:id/status', authenticateJWT, updateRegistrationStatus);

export default router;
