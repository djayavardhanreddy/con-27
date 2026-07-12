import { Router } from 'express';
import { createContactMessage, getContactMessages, updateContactMessageStatus } from '../controllers/contact.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/', createContactMessage);
router.get('/', authenticateJWT, getContactMessages);
router.patch('/:id/status', authenticateJWT, updateContactMessageStatus);

export default router;
