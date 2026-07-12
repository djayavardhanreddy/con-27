import { Request, Response } from 'express';
import prisma from '../config/db';
import { z } from 'zod';

const createContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

export const createContactMessage = async (req: Request, res: Response) => {
  const result = createContactSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { name, email, phone, subject, message } = result.data;

  try {
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
        status: 'NEW'
      }
    });

    console.log(`[EMAIL NOTIFICATION SENT] New contact message received from ${email}: "${subject || 'No Subject'}"`);

    return res.status(201).json({
      message: 'Message sent successfully',
      contactMessage
    });
  } catch (error) {
    console.error('Create contact message error:', error);
    return res.status(500).json({ message: 'Failed to send message' });
  }
};

export const getContactMessages = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';
  const status = (req.query.status as string) || '';

  const skip = (page - 1) * limit;

  try {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.contactMessage.count({ where })
    ]);

    return res.status(200).json({
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    return res.status(500).json({ message: 'Failed to fetch contact messages' });
  }
};

export const updateContactMessageStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['NEW', 'READ', 'REPLIED', 'ARCHIVED'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const contactMessage = await prisma.contactMessage.update({
      where: { id },
      data: { status }
    });

    return res.status(200).json({
      message: 'Message status updated successfully',
      contactMessage
    });
  } catch (error) {
    console.error('Update contact message status error:', error);
    return res.status(500).json({ message: 'Failed to update message status' });
  }
};
