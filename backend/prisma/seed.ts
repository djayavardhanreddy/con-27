import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create default admin user
  const adminEmail = 'admin@con27.org';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Conference Admin',
        role: 'ADMIN'
      }
    });
    console.log('Admin user created successfully (admin@con27.org / password123)');
  } else {
    console.log('Admin user already exists');
  }

  // 2. Create standard speakers
  const speakersCount = await prisma.speaker.count();
  if (speakersCount === 0) {
    const speakersData = [
      {
        name: 'Dr. Evelyn Carter',
        designation: 'Professor of Nursing Informatics',
        organization: 'Johns Hopkins School of Nursing',
        country: 'United States',
        imagePath: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
        bio: 'Dr. Evelyn Carter is a pioneer in clinical health informatics. Her research focuses on integrating IoMT devices with EHRs to enhance bedside nursing protocols.',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
        order: 1
      },
      {
        name: 'Prof. Giovanni Rossi',
        designation: 'Director of Cardiology & Nursing Care',
        organization: 'Sapienza University of Rome',
        country: 'Italy',
        imagePath: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
        bio: 'Prof. Rossi has over 25 years of experience in cardiac patient recovery. He is a primary consultant for emergency response and global healthcare security programs in Europe.',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
        order: 2
      },
      {
        name: 'Dr. Sarah Jenkins',
        designation: 'Consultant in Midwifery & Neonatal Care',
        organization: 'King\'s College London',
        country: 'United Kingdom',
        imagePath: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400',
        bio: 'Dr. Jenkins focuses on maternal and child health milestones, advocating for primary midwife leadership roles in rural and underserved community clinics.',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
        order: 3
      },
      {
        name: 'Amina Al-Mansoor',
        designation: 'Lead Advisor on Global Health Policy',
        organization: 'World Health Organization (WHO)',
        country: 'Switzerland',
        imagePath: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
        bio: 'Amina Al-Mansoor leads advocacy initiatives for nurses worldwide. Her work promotes policy updates to support green nursing and environmental sustainability in hospital environments.',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
        order: 4
      }
    ];

    for (const s of speakersData) {
      await prisma.speaker.create({ data: s });
    }
    console.log('Sample speakers seeded');
  }

  // 3. Create Agenda
  const agendaCount = await prisma.agenda.count();
  if (agendaCount === 0) {
    const agendaData = [
      // Day 1
      {
        day: 1,
        timeSlot: '08:00 AM - 09:00 AM',
        title: 'Registration & Welcome Coffee',
        description: 'Pick up your conference badges, credentials, and brochure material at the main entrance lobby.',
        speakerName: null,
        location: 'Lobby & Exhibition Hall',
        type: 'BREAK',
        order: 1
      },
      {
        day: 1,
        timeSlot: '09:00 AM - 09:30 AM',
        title: 'Inaugural Ceremony & Opening Address',
        description: 'Welcoming remarks and overview of the main theme: "Nex-Gen Nursing – Trends, Techs, Triumphs in Global Health".',
        speakerName: 'Conference Chairman',
        location: 'Main Auditorium (Hall A)',
        type: 'KEYNOTE',
        order: 2
      },
      {
        day: 1,
        timeSlot: '09:30 AM - 10:30 AM',
        title: 'Keynote Session: The Internet of Medical Things (IoMT) in Modern Bedside Care',
        description: 'How smart wearable monitors, automated drug dispensers, and real-time trackers are transforming intensive nursing care.',
        speakerName: 'Dr. Evelyn Carter',
        location: 'Main Auditorium (Hall A)',
        type: 'KEYNOTE',
        order: 3
      },
      {
        day: 1,
        timeSlot: '10:30 AM - 11:00 AM',
        title: 'Morning Networking Coffee Break',
        description: 'Coffee, tea, and local Italian pastries in the exhibition area.',
        speakerName: null,
        location: 'Exhibition Hall',
        type: 'BREAK',
        order: 4
      },
      {
        day: 1,
        timeSlot: '11:00 AM - 12:30 PM',
        title: 'Panel Discussion: Cybersecurity, Data Privacy, and AI in Healthcare Systems',
        description: 'Balancing digital convenience with patient confidentiality. Discussing best practices under global security laws.',
        speakerName: 'Dr. Evelyn Carter, Amina Al-Mansoor, Prof. Giovanni Rossi',
        location: 'Main Auditorium (Hall A)',
        type: 'PANEL',
        order: 5
      },
      {
        day: 1,
        timeSlot: '12:30 PM - 01:30 PM',
        title: 'Networking Buffet Lunch',
        description: 'Complimentary buffet lunch serving fine Italian cuisine.',
        speakerName: null,
        location: 'Dining Lounge',
        type: 'BREAK',
        order: 6
      },
      {
        day: 1,
        timeSlot: '01:30 PM - 03:00 PM',
        title: 'Track A: Green Nursing & Healthcare Sustainability',
        description: 'Examining hospital recycling, reduction of plastic waste, and ecological pathways to nursing practice.',
        speakerName: 'Amina Al-Mansoor',
        location: 'Seminar Room B',
        type: 'SESSION',
        order: 7
      },
      {
        day: 1,
        timeSlot: '03:00 PM - 04:30 PM',
        title: 'Track B: Mental Health & Well-being of Nurses',
        description: 'Addressing clinical burnout, mindfulness exercises, administrative support networks, and nurse advocacy.',
        speakerName: 'Prof. Giovanni Rossi',
        location: 'Seminar Room C',
        type: 'SESSION',
        order: 8
      },
      
      // Day 2
      {
        day: 2,
        timeSlot: '09:00 AM - 10:30 AM',
        title: 'Keynote Session: Maternal & Child Health Milestones & Primary Care Delivery',
        description: 'New guidelines in neonatology, prenatal nutrition, and maternal nursing leads in primary care communities.',
        speakerName: 'Dr. Sarah Jenkins',
        location: 'Main Auditorium (Hall A)',
        type: 'KEYNOTE',
        order: 1
      },
      {
        day: 2,
        timeSlot: '10:30 AM - 11:00 AM',
        title: 'Morning Coffee Break',
        description: 'Mid-morning refreshments and poster presentations review.',
        speakerName: null,
        location: 'Exhibition Hall',
        type: 'BREAK',
        order: 2
      },
      {
        day: 2,
        timeSlot: '11:00 AM - 12:30 PM',
        title: 'Oral Presentations: Scaling Local Innovations in Nursing Practice',
        description: 'Presentations by selected researchers displaying nurse-led innovations from 15+ countries.',
        speakerName: 'Various Researchers',
        location: 'Main Auditorium (Hall A)',
        type: 'SESSION',
        order: 3
      },
      {
        day: 2,
        timeSlot: '12:30 PM - 01:30 PM',
        title: 'Networking Lunch',
        description: 'Buffet lunch and final networking session.',
        speakerName: null,
        location: 'Dining Lounge',
        type: 'BREAK',
        order: 4
      },
      {
        day: 2,
        timeSlot: '01:30 PM - 03:00 PM',
        title: 'Session: Disaster Response & Global Health Security',
        description: 'Coordinated nursing protocols in natural crises, pandemic prevention, and international clinical volunteering.',
        speakerName: 'Prof. Giovanni Rossi',
        location: 'Main Auditorium (Hall A)',
        type: 'SESSION',
        order: 5
      },
      {
        day: 2,
        timeSlot: '03:00 PM - 04:00 PM',
        title: 'Valedictory Session & Best Paper Award Ceremony',
        description: 'Closing statements, certificates distribution, and announcement of the Best Research Paper Award.',
        speakerName: 'Conference Chairs',
        location: 'Main Auditorium (Hall A)',
        type: 'SOCIAL',
        order: 6
      }
    ];

    for (const a of agendaData) {
      await prisma.agenda.create({ data: a });
    }
    console.log('Agenda sessions seeded');
  }

  // 4. Create FAQs
  const faqCount = await prisma.fAQ.count();
  if (faqCount === 0) {
    const faqData = [
      {
        question: 'When and where is the conference taking place?',
        answer: 'The Global Nursing Conference 2027 will take place on May 13-14, 2027 in Rome, Italy. The specific venue hotel details will be updated on the website shortly.',
        order: 1
      },
      {
        question: 'What is the theme of the conference?',
        answer: 'The core theme is "Nex-Gen Nursing – Trends, Techs, Triumphs in Global Health", highlighting the integration of AI, IoMT, and digital healthcare in the nursing sector.',
        order: 2
      },
      {
        question: 'How do I download the conference brochure?',
        answer: 'Click on the "Brochure Download" tab, complete the short form with your name, email, phone, and country, and you will immediately be able to download the official brochure PDF.',
        order: 3
      },
      {
        question: 'What are the formats allowed for Abstract Submission?',
        answer: 'Abstracts must be submitted as either PDF or Microsoft Word (DOCX) files. You can download the abstract sample template from the Abstract Submission page for format instructions.',
        order: 4
      },
      {
        question: 'Can I pay for registration through bank transfers or credit cards?',
        answer: 'Yes, we accept major credit card payments, PayPal, and offline bank transfers. Please note that a 2% processing surcharge applies for PayPal payments. For group package discounts, please email us directly.',
        order: 5
      }
    ];

    for (const f of faqData) {
      await prisma.fAQ.create({ data: f });
    }
    console.log('FAQs seeded');
  }

  // 5. Create Sponsors
  const sponsorCount = await prisma.sponsor.count();
  if (sponsorCount === 0) {
    const sponsorData = [
      {
        name: 'Syntrophy Conferences',
        logoPath: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&q=80&w=200',
        websiteUrl: 'https://syntrophy.com',
        tier: 'PLATINUM',
        order: 1
      },
      {
        name: 'BioTech Health Solutions',
        logoPath: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=200',
        websiteUrl: 'https://biotech.com',
        tier: 'GOLD',
        order: 2
      },
      {
        name: 'Rome Medical Center',
        logoPath: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=200',
        websiteUrl: 'https://romemedical.it',
        tier: 'SILVER',
        order: 3
      }
    ];

    for (const sp of sponsorData) {
      await prisma.sponsor.create({ data: sp });
    }
    console.log('Sponsors seeded');
  }

  // 6. Create Settings
  const settingsCount = await prisma.setting.count();
  if (settingsCount === 0) {
    const settingsData = [
      { key: 'conference_title', value: 'Global Nursing Conference 2027' },
      { key: 'conference_theme', value: 'Nex-Gen Nursing – Trends, Techs, Triumphs in Global Health' },
      { key: 'conference_dates', value: 'May 13-14, 2027' },
      { key: 'conference_venue', value: 'To be announced, Rome, Italy' },
      { key: 'support_email', value: 'nursing@syntrophyconferences.org' },
      { key: 'support_phone', value: '+39 06 1234567' }
    ];

    for (const set of settingsData) {
      await prisma.setting.create({ data: set });
    }
    console.log('Settings seeded');
  }

  // 7. Create Gallery
  const galleryCount = await prisma.gallery.count();
  if (galleryCount === 0) {
    const galleryData = [
      { title: 'Colosseum, Rome', imagePath: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=600', category: 'ROME' },
      { title: 'Vatican City', imagePath: 'https://images.unsplash.com/photo-1542820229-081e0c12af0b?auto=format&fit=crop&q=80&w=600', category: 'ROME' },
      { title: 'Trevi Fountain', imagePath: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&q=80&w=600', category: 'ROME' },
      { title: 'Previous Conference Keynote', imagePath: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=600', category: 'CONFERENCE' },
      { title: 'Panel Session Discussion', imagePath: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600', category: 'CONFERENCE' },
      { title: 'Poster Session Networking', imagePath: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600', category: 'CONFERENCE' }
    ];

    for (const g of galleryData) {
      await prisma.gallery.create({ data: g });
    }
    console.log('Gallery seeded');
  }

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
