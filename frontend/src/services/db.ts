import Dexie, { type Table } from 'dexie';

export interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  package: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  paymentMethod: 'PAYPAL' | 'STRIPE' | 'BANK_TRANSFER';
  comments?: string;
  createdAt: string;
}

export interface AbstractSubmission {
  id: string;
  prefix: string;
  name: string;
  email: string;
  phone: string;
  profession: string;
  country: string;
  title: string;
  fileName: string;
  filePath: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface BrochureDownload {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  query?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
  createdAt: string;
}

export interface Speaker {
  id: string;
  name: string;
  designation: string;
  organization: string;
  country: string;
  imagePath: string;
  bio: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  order: number;
  createdAt: string;
}

export interface AgendaItem {
  id: string;
  day: number;
  timeSlot: string;
  title: string;
  description?: string;
  speakerName?: string;
  location?: string;
  type: 'KEYNOTE' | 'PANEL' | 'SESSION' | 'BREAK' | 'SOCIAL';
  order: number;
  createdAt: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logoPath: string;
  websiteUrl?: string;
  tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'MEDIA' | 'EXHIBITOR';
  order: number;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title?: string;
  imagePath: string;
  category: 'ROME' | 'CONFERENCE' | 'SOCIAL';
  createdAt: string;
}

export interface Setting {
  key: string;
  value: string;
}

export class Con27Database extends Dexie {
  registrations!: Table<Registration, string>;
  abstracts!: Table<AbstractSubmission, string>;
  brochureDownloads!: Table<BrochureDownload, string>;
  contactMessages!: Table<ContactMessage, string>;
  speakers!: Table<Speaker, string>;
  agenda!: Table<AgendaItem, string>;
  sponsors!: Table<Sponsor, string>;
  faqs!: Table<FAQ, string>;
  gallery!: Table<GalleryItem, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super('Con27Database');
    this.version(1).stores({
      registrations: 'id, name, email, package, status, createdAt',
      abstracts: 'id, name, email, title, status, createdAt',
      brochureDownloads: 'id, name, email, createdAt',
      contactMessages: 'id, name, email, status, createdAt',
      speakers: 'id, name, order',
      agenda: 'id, day, type, order',
      sponsors: 'id, tier, order',
      faqs: 'id, order',
      gallery: 'id, category',
      settings: 'key'
    });
  }
}

export const db = new Con27Database();

// Seed initial static database content on creation
db.on('populate', () => {
  db.speakers.bulkAdd([
    {
      id: 'sp1',
      name: 'Dr. Evelyn Carter',
      designation: 'Lead Researcher, Healthcare Informatics',
      organization: 'MIT Research Labs',
      country: 'United States',
      imagePath: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
      bio: 'Dr. Evelyn Carter is a pioneer in clinical health informatics. Her research focuses on integrating IoMT devices with EHRs to enhance bedside nursing protocols.',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      order: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'sp2',
      name: 'Prof. Giovanni Rossi',
      designation: 'Director of Cardiology & Nursing Care',
      organization: 'Sapienza University of Rome',
      country: 'Italy',
      imagePath: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
      bio: 'Prof. Rossi has over 25 years of experience in cardiac patient recovery. He is a primary consultant for emergency response and global healthcare security programs in Europe.',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      order: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: 'sp3',
      name: 'Dr. Sarah Jenkins',
      designation: 'Consultant in Midwifery & Neonatal Care',
      organization: "King's College London",
      country: 'United Kingdom',
      imagePath: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400',
      bio: 'Dr. Jenkins focuses on maternal and child health milestones, advocating for primary midwife leadership roles in rural and underserved community clinics.',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      order: 3,
      createdAt: new Date().toISOString()
    },
    {
      id: 'sp4',
      name: 'Amina Al-Mansoor',
      designation: 'Lead Advisor on Global Health Policy',
      organization: 'World Health Organization (WHO)',
      country: 'Switzerland',
      imagePath: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      bio: 'Amina Al-Mansoor leads advocacy initiatives for nurses worldwide. Her work promotes policy updates to support green nursing and environmental sustainability in hospital environments.',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      order: 4,
      createdAt: new Date().toISOString()
    }
  ]);

  db.agenda.bulkAdd([
    // Day 1
    {
      id: 'ag1',
      day: 1,
      timeSlot: '08:00 AM - 09:00 AM',
      title: 'Registration & Welcome Coffee',
      description: 'Pick up your conference badges, credentials, and brochure material at the main entrance lobby.',
      speakerName: '',
      location: 'Lobby & Exhibition Hall',
      type: 'BREAK',
      order: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ag2',
      day: 1,
      timeSlot: '09:00 AM - 09:30 AM',
      title: 'Inaugural Ceremony & Opening Address',
      description: 'Welcoming remarks and overview of the main theme: "Nex-Gen Nursing – Trends, Techs, Triumphs in Global Health".',
      speakerName: 'Conference Chairman',
      location: 'Main Auditorium (Hall A)',
      type: 'KEYNOTE',
      order: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ag3',
      day: 1,
      timeSlot: '09:30 AM - 10:30 AM',
      title: 'Keynote Session: The Internet of Medical Things (IoMT) in Modern Bedside Care',
      description: 'How smart wearable monitors, automated drug dispensers, and real-time trackers are transforming intensive nursing care.',
      speakerName: 'Dr. Evelyn Carter',
      location: 'Main Auditorium (Hall A)',
      type: 'KEYNOTE',
      order: 3,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ag4',
      day: 1,
      timeSlot: '10:30 AM - 11:00 AM',
      title: 'Morning Networking Coffee Break',
      description: 'Coffee, tea, and local Italian pastries in the exhibition area.',
      speakerName: '',
      location: 'Exhibition Hall',
      type: 'BREAK',
      order: 4,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ag5',
      day: 1,
      timeSlot: '11:00 AM - 12:30 PM',
      title: 'Panel Discussion: Cybersecurity, Data Privacy, and AI in Healthcare Systems',
      description: 'Balancing digital convenience with patient confidentiality. Discussing best practices under global security laws.',
      speakerName: 'Dr. Evelyn Carter, Amina Al-Mansoor, Prof. Giovanni Rossi',
      location: 'Main Auditorium (Hall A)',
      type: 'PANEL',
      order: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ag6',
      day: 1,
      timeSlot: '12:30 PM - 01:30 PM',
      title: 'Networking Buffet Lunch',
      description: 'Complimentary buffet lunch serving fine Italian cuisine.',
      speakerName: '',
      location: 'Dining Lounge',
      type: 'BREAK',
      order: 6,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ag7',
      day: 1,
      timeSlot: '01:30 PM - 03:00 PM',
      title: 'Track A: Green Nursing & Healthcare Sustainability',
      description: 'Examining hospital recycling, reduction of plastic waste, and ecological pathways to nursing practice.',
      speakerName: 'Amina Al-Mansoor',
      location: 'Seminar Room B',
      type: 'SESSION',
      order: 7,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ag8',
      day: 1,
      timeSlot: '03:00 PM - 04:30 PM',
      title: 'Track B: Mental Health & Well-being of Nurses',
      description: 'Addressing clinical burnout, mindfulness exercises, administrative support networks, and nurse advocacy.',
      speakerName: 'Prof. Giovanni Rossi',
      location: 'Seminar Room C',
      type: 'SESSION',
      order: 8,
      createdAt: new Date().toISOString()
    },
    // Day 2
    {
      id: 'ag9',
      day: 2,
      timeSlot: '09:00 AM - 10:30 AM',
      title: 'Keynote Session: Maternal & Child Health Milestones & Primary Care Delivery',
      description: 'New guidelines in neonatology, prenatal nutrition, and maternal nursing leads in primary care communities.',
      speakerName: 'Dr. Sarah Jenkins',
      location: 'Main Auditorium (Hall A)',
      type: 'KEYNOTE',
      order: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ag10',
      day: 2,
      timeSlot: '10:30 AM - 11:00 AM',
      title: 'Morning Coffee Break',
      description: 'Mid-morning refreshments and poster presentations review.',
      speakerName: '',
      location: 'Exhibition Hall',
      type: 'BREAK',
      order: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ag11',
      day: 2,
      timeSlot: '11:00 AM - 12:30 PM',
      title: 'Oral Presentations: Scaling Local Innovations in Nursing Practice',
      description: 'Presentations by selected researchers displaying nurse-led innovations from 15+ countries.',
      speakerName: 'Various Researchers',
      location: 'Main Auditorium (Hall A)',
      type: 'SESSION',
      order: 3,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ag12',
      day: 2,
      timeSlot: '12:30 PM - 01:30 PM',
      title: 'Networking Lunch',
      description: 'Buffet lunch and final networking session.',
      speakerName: '',
      location: 'Dining Lounge',
      type: 'BREAK',
      order: 4,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ag13',
      day: 2,
      timeSlot: '01:30 PM - 03:00 PM',
      title: 'Session: Disaster Response & Global Health Security',
      description: 'Coordinated nursing protocols in natural crises, pandemic prevention, and international clinical volunteering.',
      speakerName: 'Prof. Giovanni Rossi',
      location: 'Main Auditorium (Hall A)',
      type: 'SESSION',
      order: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ag14',
      day: 2,
      timeSlot: '03:00 PM - 04:00 PM',
      title: 'Valedictory Session & Best Paper Award Ceremony',
      description: 'Closing statements, certificates distribution, and announcement of the Best Research Paper Award.',
      speakerName: 'Conference Chairs',
      location: 'Main Auditorium (Hall A)',
      type: 'SOCIAL',
      order: 6,
      createdAt: new Date().toISOString()
    }
  ]);

  db.faqs.bulkAdd([
    {
      id: 'faq1',
      question: 'When and where is the conference taking place?',
      answer: 'The Global Nursing Conference 2027 will take place on May 13-14, 2027 in Rome, Italy. The specific venue hotel details will be updated on the website shortly.',
      order: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'faq2',
      question: 'What is the theme of the conference?',
      answer: 'The core theme is "Nex-Gen Nursing – Trends, Techs, Triumphs in Global Health", highlighting the integration of AI, IoMT, and digital healthcare in the nursing sector.',
      order: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: 'faq3',
      question: 'How do I download the conference brochure?',
      answer: 'Click on the "Brochure Download" tab, complete the short form with your name, email, phone, and country, and you will immediately be able to download the official brochure PDF.',
      order: 3,
      createdAt: new Date().toISOString()
    },
    {
      id: 'faq4',
      question: 'What are the formats allowed for Abstract Submission?',
      answer: 'Abstracts must be submitted as either PDF or Microsoft Word (DOCX) files. You can download the abstract sample template from the Abstract Submission page for format instructions.',
      order: 4,
      createdAt: new Date().toISOString()
    },
    {
      id: 'faq5',
      question: 'Can I pay for registration through bank transfers or credit cards?',
      answer: 'Yes, we accept major credit card payments, PayPal, and offline bank transfers. Please note that a 2% processing surcharge applies for PayPal payments. For group package discounts, please email us directly.',
      order: 5,
      createdAt: new Date().toISOString()
    }
  ]);

  db.sponsors.bulkAdd([
    {
      id: 'spn1',
      name: 'Syntrophy Conferences',
      logoPath: '/logo_light.png',
      websiteUrl: 'https://syntrophy.com',
      tier: 'PLATINUM',
      order: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'spn2',
      name: 'BioTech Health Solutions',
      logoPath: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=200',
      websiteUrl: 'https://biotech.com',
      tier: 'GOLD',
      order: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: 'spn3',
      name: 'Rome Medical Center',
      logoPath: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=200',
      websiteUrl: 'https://romemedical.it',
      tier: 'SILVER',
      order: 3,
      createdAt: new Date().toISOString()
    }
  ]);

  db.gallery.bulkAdd([
    { id: 'gal1', title: 'Colosseum, Rome', imagePath: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=600', category: 'ROME', createdAt: new Date().toISOString() },
    { id: 'gal2', title: 'Vatican City', imagePath: 'https://images.unsplash.com/photo-1542820229-081e0c12af0b?auto=format&fit=crop&q=80&w=600', category: 'ROME', createdAt: new Date().toISOString() },
    { id: 'gal3', title: 'Trevi Fountain', imagePath: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&q=80&w=600', category: 'ROME', createdAt: new Date().toISOString() },
    { id: 'gal4', title: 'Previous Conference Keynote', imagePath: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=600', category: 'CONFERENCE', createdAt: new Date().toISOString() },
    { id: 'gal5', title: 'Panel Session Discussion', imagePath: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600', category: 'CONFERENCE', createdAt: new Date().toISOString() },
    { id: 'gal6', title: 'Poster Session Networking', imagePath: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600', category: 'CONFERENCE', createdAt: new Date().toISOString() }
  ]);

  db.settings.bulkAdd([
    { key: 'conference_title', value: 'Global Nursing Conference 2027' },
    { key: 'conference_theme', value: 'Nex-Gen Nursing – Trends, Techs, Triumphs in Global Health' },
    { key: 'conference_dates', value: 'May 13-14, 2027' },
    { key: 'conference_venue', value: 'To be announced, Rome, Italy' },
    { key: 'support_email', value: 'contact@nursingconference.net' },
    { key: 'support_phone', value: '+39 06 1234567' }
  ]);
});
