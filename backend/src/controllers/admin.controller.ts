import { Request, Response } from 'express';
import prisma from '../config/db';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const [
      totalRegistrations,
      totalAbstracts,
      totalDownloads,
      totalMessages,
      paidRegistrations,
      pendingRegistrations,
      registrationsByPackage,
      abstractsByStatus,
      newsletterCount
    ] = await Promise.all([
      prisma.registration.count(),
      prisma.abstract.count(),
      prisma.brochureDownload.count(),
      prisma.contactMessage.count(),
      prisma.registration.findMany({ where: { status: 'PAID' } }),
      prisma.registration.count({ where: { status: 'PENDING' } }),
      prisma.registration.groupBy({
        by: ['package'],
        _count: { id: true },
        _sum: { amount: true }
      }),
      prisma.abstract.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.newsletterSubscriber.count({ where: { active: true } })
    ]);

    // Calculate revenue
    const revenue = paidRegistrations.reduce((sum, r) => sum + r.amount, 0);
    const pendingRevenue = totalRegistrations - paidRegistrations.length; // counts of pending registrations

    // Format package counts
    const packageStats = registrationsByPackage.map(p => ({
      package: p.package,
      count: p._count.id,
      revenue: p._sum.amount || 0
    }));

    // Format status counts for abstracts
    const abstractStats = abstractsByStatus.map(a => ({
      status: a.status,
      count: a._count.id
    }));

    return res.status(200).json({
      totals: {
        registrations: totalRegistrations,
        abstracts: totalAbstracts,
        brochureDownloads: totalDownloads,
        contactMessages: totalMessages,
        newsletterSubscribers: newsletterCount,
        revenue,
        pendingRegistrationsCount: pendingRegistrations
      },
      packages: packageStats,
      abstracts: abstractStats
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return res.status(500).json({ message: 'Failed to retrieve analytics' });
  }
};

export const exportRegistrationsExcel = async (req: Request, res: Response) => {
  try {
    const registrations = await prisma.registration.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Registrations');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Country', key: 'country', width: 15 },
      { header: 'Package', key: 'package', width: 15 },
      { header: 'Amount ($)', key: 'amount', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Payment Method', key: 'paymentMethod', width: 15 },
      { header: 'Comments', key: 'comments', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ];

    registrations.forEach(r => {
      worksheet.addRow({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        country: r.country,
        package: r.package,
        amount: r.amount,
        status: r.status,
        paymentMethod: r.paymentMethod,
        comments: r.comments || '',
        createdAt: r.createdAt.toISOString()
      });
    });

    // Make headers bold
    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=registrations.xlsx'
    );

    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    console.error('Export registrations Excel error:', error);
    return res.status(500).json({ message: 'Failed to export registrations' });
  }
};

export const exportAbstractsExcel = async (req: Request, res: Response) => {
  try {
    const abstracts = await prisma.abstract.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Abstracts');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Prefix', key: 'prefix', width: 10 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Profession', key: 'profession', width: 20 },
      { header: 'Country', key: 'country', width: 15 },
      { header: 'Paper Title', key: 'title', width: 40 },
      { header: 'File Name', key: 'fileName', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Submitted At', key: 'createdAt', width: 20 }
    ];

    abstracts.forEach(a => {
      worksheet.addRow({
        id: a.id,
        prefix: a.prefix,
        name: a.name,
        email: a.email,
        phone: a.phone,
        profession: a.profession,
        country: a.country,
        title: a.title,
        fileName: a.fileName,
        status: a.status,
        createdAt: a.createdAt.toISOString()
      });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=abstracts.xlsx'
    );

    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    console.error('Export abstracts Excel error:', error);
    return res.status(500).json({ message: 'Failed to export abstracts' });
  }
};

export const exportRegistrationsPDF = async (req: Request, res: Response) => {
  try {
    const registrations = await prisma.registration.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=registrations_report.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Global Nursing Conference 2027', { align: 'center' });
    doc.fontSize(14).text('Registrations Report', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(10);
    doc.text(`Total Registrations: ${registrations.length}`);
    doc.text(`Report Generated At: ${new Date().toLocaleString()}`);
    doc.moveDown(1);

    doc.text('------------------------------------------------------------------------------------------------------------------------');
    doc.moveDown(0.5);

    registrations.forEach((r, index) => {
      if (doc.y > 700) {
        doc.addPage();
      }
      doc.fontSize(11).font('Helvetica-Bold').text(`${index + 1}. ${r.name} (${r.email})`);
      doc.font('Helvetica').fontSize(9);
      doc.text(`Phone: ${r.phone} | Country: ${r.country}`);
      doc.text(`Package: ${r.package} | Amount: $${r.amount} | Method: ${r.paymentMethod}`);
      doc.text(`Status: ${r.status} | Date: ${r.createdAt.toLocaleDateString()}`);
      if (r.comments) {
        doc.text(`Comments: ${r.comments}`);
      }
      doc.moveDown(1);
    });

    doc.end();
  } catch (error) {
    console.error('Export registrations PDF error:', error);
    return res.status(500).json({ message: 'Failed to export PDF' });
  }
};

export const exportAbstractsPDF = async (req: Request, res: Response) => {
  try {
    const abstracts = await prisma.abstract.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=abstracts_report.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Global Nursing Conference 2027', { align: 'center' });
    doc.fontSize(14).text('Abstract Submissions Report', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(10);
    doc.text(`Total Abstract Submissions: ${abstracts.length}`);
    doc.text(`Report Generated At: ${new Date().toLocaleString()}`);
    doc.moveDown(1);

    doc.text('------------------------------------------------------------------------------------------------------------------------');
    doc.moveDown(0.5);

    abstracts.forEach((a, index) => {
      if (doc.y > 700) {
        doc.addPage();
      }
      doc.fontSize(11).font('Helvetica-Bold').text(`${index + 1}. ${a.prefix} ${a.name} - ${a.profession}`);
      doc.font('Helvetica').fontSize(9);
      doc.text(`Email: ${a.email} | Phone: ${a.phone} | Country: ${a.country}`);
      doc.font('Helvetica-Oblique').text(`Title: "${a.title}"`);
      doc.font('Helvetica');
      doc.text(`File: ${a.fileName} | Status: ${a.status} | Date: ${a.createdAt.toLocaleDateString()}`);
      doc.moveDown(1);
    });

    doc.end();
  } catch (error) {
    console.error('Export abstracts PDF error:', error);
    return res.status(500).json({ message: 'Failed to export PDF' });
  }
};
