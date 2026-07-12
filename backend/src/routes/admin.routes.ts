import { Router } from 'express';
import {
  getAnalytics,
  exportRegistrationsExcel,
  exportAbstractsExcel,
  exportRegistrationsPDF,
  exportAbstractsPDF
} from '../controllers/admin.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/analytics', authenticateJWT, getAnalytics);
router.get('/export/registrations/excel', authenticateJWT, exportRegistrationsExcel);
router.get('/export/abstracts/excel', authenticateJWT, exportAbstractsExcel);
router.get('/export/registrations/pdf', authenticateJWT, exportRegistrationsPDF);
router.get('/export/abstracts/pdf', authenticateJWT, exportAbstractsPDF);

export default router;
