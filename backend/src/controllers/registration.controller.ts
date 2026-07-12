import { Request, Response } from 'express';
import prisma from '../config/db';
import { z } from 'zod';

const createRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number must be at least 5 digits'),
  country: z.string().min(2, 'Country must be specified'),
  package: z.enum(['STUDENT', 'ONE_DAY', 'PLAN_A', 'PLAN_B']),
  paymentMethod: z.enum(['PAYPAL', 'STRIPE', 'BANK_TRANSFER']).default('PAYPAL'),
  comments: z.string().optional()
});

export const createRegistration = async (req: Request, res: Response) => {
  const result = createRegistrationSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { name, email, phone, country, package: regPackage, paymentMethod, comments } = result.data;

  // Determine base prices
  let amount = 0;
  if (regPackage === 'STUDENT') amount = 399;
  else if (regPackage === 'ONE_DAY') amount = 249;
  else if (regPackage === 'PLAN_A') amount = 999;
  else if (regPackage === 'PLAN_B') amount = 849;

  // Add 2% extra for PayPal payments
  if (paymentMethod === 'PAYPAL') {
    amount = parseFloat((amount * 1.02).toFixed(2));
  }

  try {
    const registration = await prisma.registration.create({
      data: {
        name,
        email,
        phone,
        country,
        package: regPackage,
        amount,
        paymentMethod,
        comments,
        status: 'PENDING'
      }
    });

    // In a real system, we'd trigger an email notification here
    console.log(`[EMAIL NOTIFICATION SENT] Registration created for ${email}. Amount due: $${amount}`);

    return res.status(201).json({
      message: 'Registration submitted successfully',
      registration
    });
  } catch (error) {
    console.error('Create registration error:', error);
    return res.status(500).json({ message: 'Failed to create registration' });
  }
};

export const getRegistrations = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';
  const status = (req.query.status as string) || '';
  const regPackage = (req.query.package as string) || '';

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

    if (status) {
      where.status = status;
    }

    if (regPackage) {
      where.package = regPackage;
    }

    const [items, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.registration.count({ where })
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
    console.error('Get registrations error:', error);
    return res.status(500).json({ message: 'Failed to fetch registrations' });
  }
};

export const updateRegistrationStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['PENDING', 'PAID', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const registration = await prisma.registration.update({
      where: { id },
      data: { status }
    });

    console.log(`[EMAIL NOTIFICATION SENT] Registration status updated to ${status} for ${registration.email}`);

    return res.status(200).json({
      message: 'Registration status updated successfully',
      registration
    });
  } catch (error) {
    console.error('Update registration status error:', error);
    return res.status(500).json({ message: 'Failed to update registration status' });
  }
};
