import { Router } from 'express';
import {
  getSpeakers, createSpeaker, updateSpeaker, deleteSpeaker,
  getAgenda, createAgenda, updateAgenda, deleteAgenda,
  getFAQs, createFAQ, updateFAQ, deleteFAQ,
  getSponsors, createSponsor, deleteSponsor,
  getGallery, createGallery, deleteGallery,
  subscribeNewsletter, getSubscribers,
  getSettings, updateSetting
} from '../controllers/content.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Speakers
router.get('/speakers', getSpeakers);
router.post('/speakers', authenticateJWT, createSpeaker);
router.put('/speakers/:id', authenticateJWT, updateSpeaker);
router.delete('/speakers/:id', authenticateJWT, deleteSpeaker);

// Agenda
router.get('/agenda', getAgenda);
router.post('/agenda', authenticateJWT, createAgenda);
router.put('/agenda/:id', authenticateJWT, updateAgenda);
router.delete('/agenda/:id', authenticateJWT, deleteAgenda);

// FAQ
router.get('/faqs', getFAQs);
router.post('/faqs', authenticateJWT, createFAQ);
router.put('/faqs/:id', authenticateJWT, updateFAQ);
router.delete('/faqs/:id', authenticateJWT, deleteFAQ);

// Sponsors
router.get('/sponsors', getSponsors);
router.post('/sponsors', authenticateJWT, createSponsor);
router.delete('/sponsors/:id', authenticateJWT, deleteSponsor);

// Gallery
router.get('/gallery', getGallery);
router.post('/gallery', authenticateJWT, createGallery);
router.delete('/gallery/:id', authenticateJWT, deleteGallery);

// Newsletter
router.post('/newsletter/subscribe', subscribeNewsletter);
router.get('/newsletter/subscribers', authenticateJWT, getSubscribers);

// Settings
router.get('/settings', getSettings);
router.post('/settings', authenticateJWT, updateSetting);

export default router;
