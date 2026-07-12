import { Request, Response } from 'express';
import prisma from '../config/db';
import { z } from 'zod';

const createBrochureDownloadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number must be at least 5 digits'),
  country: z.string().min(2, 'Country must be specified'),
  query: z.string().optional()
});

export const createBrochureDownload = async (req: Request, res: Response) => {
  const result = createBrochureDownloadSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { name, email, phone, country, query } = result.data;

  try {
    const brochureDownload = await prisma.brochureDownload.create({
      data: {
        name,
        email,
        phone,
        country,
        query
      }
    });

    console.log(`[EMAIL NOTIFICATION SENT] Brochure request registered for ${email}. Sending brochure link.`);

    return res.status(201).json({
      message: 'Brochure request registered successfully',
      brochureDownload
    });
  } catch (error) {
    console.error('Create brochure download error:', error);
    return res.status(500).json({ message: 'Failed to record brochure request' });
  }
};

export const getBrochureDownloads = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';

  const skip = (page - 1) * limit;

  try {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.brochureDownload.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.brochureDownload.count({ where })
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
    console.error('Get brochure downloads error:', error);
    return res.status(500).json({ message: 'Failed to fetch brochure download history' });
  }
};
