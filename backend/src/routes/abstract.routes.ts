import { Router } from 'express';
import { createAbstract, getAbstracts, updateAbstractStatus, downloadAbstractFile } from '../controllers/abstract.controller';
import { upload } from '../middleware/upload';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/', upload.single('file'), createAbstract);
router.get('/', authenticateJWT, getAbstracts);
router.patch('/:id/status', authenticateJWT, updateAbstractStatus);
router.get('/download/:id', authenticateJWT, downloadAbstractFile);

export default router;
