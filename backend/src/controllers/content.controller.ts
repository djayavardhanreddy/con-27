import { Request, Response } from 'express';
import prisma from '../config/db';

// --- SPEAKERS ---
export const getSpeakers = async (req: Request, res: Response) => {
  try {
    const speakers = await prisma.speaker.findMany({
      orderBy: { order: 'asc' }
    });
    return res.status(200).json(speakers);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch speakers' });
  }
};

export const createSpeaker = async (req: Request, res: Response) => {
  const { name, designation, organization, country, imagePath, bio, twitter, linkedin, order } = req.body;
  if (!name || !designation || !organization || !country) {
    return res.status(400).json({ message: 'Missing required speaker fields' });
  }
  try {
    const speaker = await prisma.speaker.create({
      data: { name, designation, organization, country, imagePath, bio, twitter, linkedin, order: Number(order) || 0 }
    });
    return res.status(201).json(speaker);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create speaker' });
  }
};

export const updateSpeaker = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, designation, organization, country, imagePath, bio, twitter, linkedin, order } = req.body;
  try {
    const speaker = await prisma.speaker.update({
      where: { id },
      data: { name, designation, organization, country, imagePath, bio, twitter, linkedin, order: Number(order) || 0 }
    });
    return res.status(200).json(speaker);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update speaker' });
  }
};

export const deleteSpeaker = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.speaker.delete({ where: { id } });
    return res.status(200).json({ message: 'Speaker deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete speaker' });
  }
};

// --- AGENDA ---
export const getAgenda = async (req: Request, res: Response) => {
  try {
    const agenda = await prisma.agenda.findMany({
      orderBy: [
        { day: 'asc' },
        { order: 'asc' }
      ]
    });
    return res.status(200).json(agenda);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch agenda' });
  }
};

export const createAgenda = async (req: Request, res: Response) => {
  const { day, timeSlot, title, description, speakerName, location, type, order } = req.body;
  if (!day || !timeSlot || !title) {
    return res.status(400).json({ message: 'Missing required agenda fields' });
  }
  try {
    const agendaItem = await prisma.agenda.create({
      data: {
        day: Number(day),
        timeSlot,
        title,
        description,
        speakerName,
        location,
        type: type || 'SESSION',
        order: Number(order) || 0
      }
    });
    return res.status(201).json(agendaItem);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create agenda item' });
  }
};

export const updateAgenda = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { day, timeSlot, title, description, speakerName, location, type, order } = req.body;
  try {
    const agendaItem = await prisma.agenda.update({
      where: { id },
      data: {
        day: day ? Number(day) : undefined,
        timeSlot,
        title,
        description,
        speakerName,
        location,
        type,
        order: order ? Number(order) : undefined
      }
    });
    return res.status(200).json(agendaItem);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update agenda item' });
  }
};

export const deleteAgenda = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.agenda.delete({ where: { id } });
    return res.status(200).json({ message: 'Agenda item deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete agenda item' });
  }
};

// --- FAQ ---
export const getFAQs = async (req: Request, res: Response) => {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { order: 'asc' }
    });
    return res.status(200).json(faqs);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch FAQs' });
  }
};

export const createFAQ = async (req: Request, res: Response) => {
  const { question, answer, order } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ message: 'Question and answer are required' });
  }
  try {
    const faq = await prisma.fAQ.create({
      data: { question, answer, order: Number(order) || 0 }
    });
    return res.status(201).json(faq);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create FAQ' });
  }
};

export const updateFAQ = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { question, answer, order } = req.body;
  try {
    const faq = await prisma.fAQ.update({
      where: { id },
      data: { question, answer, order: Number(order) || 0 }
    });
    return res.status(200).json(faq);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update FAQ' });
  }
};

export const deleteFAQ = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.fAQ.delete({ where: { id } });
    return res.status(200).json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete FAQ' });
  }
};

// --- SPONSORS ---
export const getSponsors = async (req: Request, res: Response) => {
  try {
    const sponsors = await prisma.sponsor.findMany({
      orderBy: { order: 'asc' }
    });
    return res.status(200).json(sponsors);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch sponsors' });
  }
};

export const createSponsor = async (req: Request, res: Response) => {
  const { name, logoPath, websiteUrl, tier, order } = req.body;
  if (!name || !logoPath || !tier) {
    return res.status(400).json({ message: 'Missing required sponsor fields' });
  }
  try {
    const sponsor = await prisma.sponsor.create({
      data: { name, logoPath, websiteUrl, tier, order: Number(order) || 0 }
    });
    return res.status(201).json(sponsor);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create sponsor' });
  }
};

export const deleteSponsor = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.sponsor.delete({ where: { id } });
    return res.status(200).json({ message: 'Sponsor deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete sponsor' });
  }
};

// --- GALLERY ---
export const getGallery = async (req: Request, res: Response) => {
  try {
    const gallery = await prisma.gallery.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(gallery);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch gallery' });
  }
};

export const createGallery = async (req: Request, res: Response) => {
  const { title, imagePath, category } = req.body;
  if (!imagePath) {
    return res.status(400).json({ message: 'Image path is required' });
  }
  try {
    const item = await prisma.gallery.create({
      data: { title, imagePath, category: category || 'ROME' }
    });
    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add image to gallery' });
  }
};

export const deleteGallery = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.gallery.delete({ where: { id } });
    return res.status(200).json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete gallery item' });
  }
};

// --- NEWSLETTER ---
export const subscribeNewsletter = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  try {
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { active: true },
      create: { email, active: true }
    });
    return res.status(200).json({ message: 'Subscribed successfully', subscriber });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to subscribe' });
  }
};

export const getSubscribers = async (req: Request, res: Response) => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(subscribers);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch subscribers' });
  }
};

// --- SETTINGS ---
export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc, current) => {
      acc[current.key] = current.value;
      return acc;
    }, {} as Record<string, string>);
    return res.status(200).json(settingsMap);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch settings' });
  }
};

export const updateSetting = async (req: Request, res: Response) => {
  const { key, value } = req.body;
  if (!key) {
    return res.status(400).json({ message: 'Key is required' });
  }
  try {
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    return res.status(200).json(setting);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update setting' });
  }
};
