import { Request, Response } from 'express';
import prisma from '../config/db';
import path from 'path';
import fs from 'fs';

export const createAbstract = async (req: Request, res: Response) => {
  const { prefix, name, email, phone, profession, country, title } = req.body;
  const file = req.file;

  if (!prefix || !name || !email || !phone || !profession || !country || !title) {
    // If a file was uploaded, delete it to prevent orphaned files
    if (file) {
      fs.unlinkSync(file.path);
    }
    return res.status(400).json({ message: 'All text fields are required' });
  }

  if (!file) {
    return res.status(400).json({ message: 'Abstract document file (PDF or DOCX) is required' });
  }

  try {
    const abstract = await prisma.abstract.create({
      data: {
        prefix,
        name,
        email,
        phone,
        profession,
        country,
        title,
        filePath: file.path,
        fileName: file.originalname,
        status: 'PENDING'
      }
    });

    console.log(`[EMAIL NOTIFICATION SENT] Abstract submission confirmation sent to ${email} for paper: "${title}"`);

    return res.status(201).json({
      message: 'Abstract submitted successfully',
      abstract
    });
  } catch (error) {
    console.error('Create abstract error:', error);
    // Delete the file if db save fails
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(500).json({ message: 'Failed to submit abstract' });
  }
};

export const getAbstracts = async (req: Request, res: Response) => {
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
        { title: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.abstract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.abstract.count({ where })
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
    console.error('Get abstracts error:', error);
    return res.status(500).json({ message: 'Failed to fetch abstracts' });
  }
};

export const updateAbstractStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const abstract = await prisma.abstract.update({
      where: { id },
      data: { status }
    });

    console.log(`[EMAIL NOTIFICATION SENT] Abstract paper status updated to ${status} for ${abstract.email}`);

    return res.status(200).json({
      message: 'Abstract status updated successfully',
      abstract
    });
  } catch (error) {
    console.error('Update abstract status error:', error);
    return res.status(500).json({ message: 'Failed to update abstract status' });
  }
};

export const downloadAbstractFile = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const abstract = await prisma.abstract.findUnique({
      where: { id }
    });

    if (!abstract) {
      return res.status(404).json({ message: 'Abstract not found' });
    }

    if (!fs.existsSync(abstract.filePath)) {
      return res.status(404).json({ message: 'Physical file not found on disk' });
    }

    // Set appropriate headers and send file
    res.setHeader('Content-Disposition', `attachment; filename="${abstract.fileName}"`);
    return res.sendFile(path.resolve(abstract.filePath));
  } catch (error) {
    console.error('Download abstract error:', error);
    return res.status(500).json({ message: 'Failed to download file' });
  }
};
