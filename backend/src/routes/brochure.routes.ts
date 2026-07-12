import { Router } from 'express';
import { createBrochureDownload, getBrochureDownloads } from '../controllers/brochure.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/', createBrochureDownload);
router.get('/', authenticateJWT, getBrochureDownloads);

export default router;
