import Dexie, { type Table } from 'dexie';
import api from './api';

export interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  package: string;
  amount: number;
  currency?: 'USD' | 'EUR';
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
  order?: number;
  createdAt: string;
}

export interface Setting {
  key: string;
  value: string;
}

export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [
  { id: 'gal_dsc01302', title: 'Registration & Conference Materials', imagePath: '/gallery/dsc01302.jpg', category: 'CONFERENCE', order: 1, createdAt: '2026-09-24T09:42:21.000Z' },
  { id: 'gal_dsc01355', title: 'Keynote Address on Healthcare Innovation', imagePath: '/gallery/dsc01355.jpg', category: 'CONFERENCE', order: 2, createdAt: '2026-09-24T09:42:32.000Z' },
  { id: 'gal_dsc01367', title: 'Clinical Resilience & Patient Care Session', imagePath: '/gallery/dsc01367.jpg', category: 'CONFERENCE', order: 3, createdAt: '2026-09-24T09:42:38.000Z' },
  { id: 'gal_dsc01371', title: 'Global Delegates Networking Discussion', imagePath: '/gallery/dsc01371.jpg', category: 'CONFERENCE', order: 4, createdAt: '2026-09-24T09:42:51.000Z' },
  { id: 'gal_dsc01372', title: 'Executive Networking Luncheon', imagePath: '/gallery/dsc01372.jpg', category: 'CONFERENCE', order: 5, createdAt: '2026-09-24T09:43:03.000Z' },
  { id: 'gal_dsc01375', title: 'International Faculty Round-Table Lunch', imagePath: '/gallery/dsc01375.jpg', category: 'CONFERENCE', order: 6, createdAt: '2026-09-24T09:43:15.000Z' },
  { id: 'gal_dsc01398', title: 'Scientific Panel Moderation & Discussion', imagePath: '/gallery/dsc01398.jpg', category: 'CONFERENCE', order: 7, createdAt: '2026-09-24T09:43:26.000Z' },
  { id: 'gal_dsc01404', title: 'Distinguished Speaker Oral Presentation', imagePath: '/gallery/dsc01404.jpg', category: 'CONFERENCE', order: 8, createdAt: '2026-09-24T09:43:32.000Z' },
  { id: 'gal_dsc01443', title: 'Organizing Committee & Keynote Delegation', imagePath: '/gallery/dsc01443.jpg', category: 'CONFERENCE', order: 9, createdAt: '2026-09-24T09:43:40.000Z' },
  { id: 'gal_dsc01445', title: 'International Conference Faculty & Speakers', imagePath: '/gallery/dsc01445.jpg', category: 'CONFERENCE', order: 10, createdAt: '2026-09-24T09:43:46.000Z' },
  { id: 'gal_dsc01448', title: 'Advanced Surgical & Oncology Session', imagePath: '/gallery/dsc01448.jpg', category: 'CONFERENCE', order: 11, createdAt: '2026-09-24T09:43:54.000Z' },
  { id: 'gal_dsc01454', title: 'Optical & Diagnostic Imaging Presentation', imagePath: '/gallery/dsc01454.jpg', category: 'CONFERENCE', order: 12, createdAt: '2026-09-24T09:44:01.000Z' },
  { id: 'gal_dsc01466', title: 'Plenary Lecture by Prof. Masatoshi Tagawa', imagePath: '/gallery/dsc01466.jpg', category: 'CONFERENCE', order: 13, createdAt: '2026-09-24T09:44:06.000Z' },
  { id: 'gal_dsc01476', title: 'Outstanding Poster Presentation Award', imagePath: '/gallery/dsc01476.jpg', category: 'CONFERENCE', order: 14, createdAt: '2026-09-24T09:44:23.000Z' },
  { id: 'gal1', title: 'Colosseum, Rome', imagePath: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800', category: 'ROME', order: 15, createdAt: '2026-07-19T07:30:35.014155Z' },
  { id: 'gal2', title: 'Vatican City & St. Peter\'s', imagePath: 'https://images.unsplash.com/photo-1542820229-081e0c12af0b?auto=format&fit=crop&q=80&w=800', category: 'ROME', order: 16, createdAt: '2026-07-19T07:30:35.014165Z' },
  { id: 'gal3', title: 'Trevi Fountain', imagePath: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&q=80&w=800', category: 'ROME', order: 17, createdAt: '2026-07-19T07:30:35.014175Z' },
  { id: 'gal7', title: 'The Pantheon, Rome', imagePath: 'https://images.unsplash.com/photo-1555992828-ca4dbe41d294?auto=format&fit=crop&q=80&w=800', category: 'ROME', order: 18, createdAt: '2026-07-19T07:30:35.014180Z' }
];

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

    // Fallback seed content on local IndexedDB creation (offline safety)
    this.on('populate', () => {
      this.speakers.bulkAdd([
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

      this.agenda.bulkAdd([
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
          description: 'Welcoming remarks and overview of the main theme: "Nex-Gen Nursing: Trends, Techs, Triumphs in Global Health".',
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
          title: 'Track A: Green Nursing & Sustainability',
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

      this.faqs.bulkAdd([
        {
          id: 'faq1',
          question: 'When and where is the conference taking place?',
          answer: 'The Global Nursing Conference 2027 will take place on May 13-14, 2027 at Holiday Inn Rome - Eur Parco Dei Medici by IHG (Viale Castello della Magliana, 65, 00148 Roma RM, Italy). Detailed maps, driving directions, and accommodation details are provided in the Conference Venue section.',
          order: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: 'faq2',
          question: 'What is the theme of the conference?',
          answer: 'The core theme is "Nex-Gen Nursing: Trends, Techs, Triumphs in Global Health", highlighting the integration of AI, IoMT, and digital healthcare in the nursing sector.',
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

      this.sponsors.bulkAdd([
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

      this.gallery.bulkAdd(INITIAL_GALLERY_ITEMS);

      this.settings.bulkAdd([
        { key: 'conference_title', value: 'Global Nursing Conference 2027' },
        { key: 'conference_theme', value: 'Nex-Gen Nursing: Trends, Techs, Triumphs in Global Health' },
        { key: 'conference_dates', value: 'May 13-14, 2027' },
        { key: 'conference_venue', value: 'Holiday Inn Rome - Eur Parco Dei Medici by IHG, Viale Castello della Magliana, 65, 00148 Roma RM, Italy' },
        { key: 'conference_venue_address', value: 'Viale Castello della Magliana, 65, 00148 Roma RM, Italy' },
        { key: 'conference_venue_link', value: 'https://share.google/RXS2WVdiFVccyYdOU' },
        { key: 'support_email', value: 'contact@syntrophyconferences.com' },
        { key: 'support_phone', value: '+39 06 1234567' }
      ]);
    });
  }
}

const dexieDb = new Con27Database();

// Helper to override Dexie table write methods to also write to the API
function wrapTable(table: any, apiEndpoint: string) {
  const originalAdd = table.add.bind(table);
  table.add = async function(obj: any, ...args: any[]) {
    const res = await api.post(apiEndpoint, obj);
    return originalAdd(res.data, ...args);
  };

  const originalPut = table.put.bind(table);
  table.put = async function(obj: any, ...args: any[]) {
    const res = await api.post(apiEndpoint, obj);
    return originalPut(res.data, ...args);
  };

  const originalDelete = table.delete.bind(table);
  table.delete = async function(key: any, ...args: any[]) {
    await api.delete(`${apiEndpoint}/${key}`);
    return originalDelete(key, ...args);
  };

  const originalUpdate = table.update.bind(table);
  table.update = async function(key: any, changes: any, ...args: any[]) {
    const res = await api.put(`${apiEndpoint}/${key}`, changes);
    return originalUpdate(key, res.data, ...args);
  };
}

wrapTable(dexieDb.registrations, '/registrations');
wrapTable(dexieDb.abstracts, '/abstracts');
wrapTable(dexieDb.brochureDownloads, '/brochures');
wrapTable(dexieDb.contactMessages, '/messages');
wrapTable(dexieDb.speakers, '/speakers');
wrapTable(dexieDb.agenda, '/agenda');
wrapTable(dexieDb.faqs, '/faqs');
wrapTable(dexieDb.sponsors, '/sponsors');
wrapTable(dexieDb.gallery, '/gallery');

const originalSettingsPut = dexieDb.settings.put.bind(dexieDb.settings);
(dexieDb.settings as any).put = async function(obj: any, ...args: any[]) {
  const res = await api.post('/settings', obj);
  return originalSettingsPut(res.data, ...args);
};

export const db = {
  registrations: dexieDb.registrations,
  abstracts: dexieDb.abstracts,
  brochureDownloads: dexieDb.brochureDownloads,
  contactMessages: dexieDb.contactMessages,
  speakers: dexieDb.speakers,
  agenda: dexieDb.agenda,
  sponsors: dexieDb.sponsors,
  faqs: dexieDb.faqs,
  gallery: dexieDb.gallery,
  settings: dexieDb.settings,

  async syncFromApi() {
    const tables = [
      { key: 'speakers', endpoint: '/speakers', dexieTable: dexieDb.speakers },
      { key: 'agenda', endpoint: '/agenda', dexieTable: dexieDb.agenda },
      { key: 'faqs', endpoint: '/faqs', dexieTable: dexieDb.faqs },
      { key: 'sponsors', endpoint: '/sponsors', dexieTable: dexieDb.sponsors },
      { key: 'gallery', endpoint: '/gallery', dexieTable: dexieDb.gallery },
      { key: 'settings', endpoint: '/settings', dexieTable: dexieDb.settings },
      { key: 'registrations', endpoint: '/registrations', dexieTable: dexieDb.registrations },
      { key: 'abstracts', endpoint: '/abstracts', dexieTable: dexieDb.abstracts },
      { key: 'brochureDownloads', endpoint: '/brochures', dexieTable: dexieDb.brochureDownloads },
      { key: 'contactMessages', endpoint: '/messages', dexieTable: dexieDb.contactMessages }
    ];

    for (const table of tables) {
      try {
        const res = await api.get(table.endpoint);
        if (Array.isArray(res.data)) {
          const t = table.dexieTable as any;
          await t.clear();
          if (res.data.length > 0) {
            await t.bulkAdd(res.data);
          }
        }
      } catch (err) {
        console.error(`Failed to sync table ${table.key} from API:`, err);
      }
    }

    // Guarantee gallery items & hotel settings in local IndexedDB even if backend is offline
    try {
      const currentGallery = await dexieDb.gallery.toArray();
      if (currentGallery.length === 0 || !currentGallery.some(g => g.id.startsWith('gal_dsc'))) {
        await dexieDb.gallery.bulkPut(INITIAL_GALLERY_ITEMS);
      }
      const currentVenue = await dexieDb.settings.get('conference_venue');
      if (!currentVenue || currentVenue.value.includes('To be announced')) {
        await dexieDb.settings.put({ key: 'conference_venue', value: 'Holiday Inn Rome - Eur Parco Dei Medici by IHG, Viale Castello della Magliana, 65, 00148 Roma RM, Italy' });
        await dexieDb.settings.put({ key: 'conference_venue_address', value: 'Viale Castello della Magliana, 65, 00148 Roma RM, Italy' });
        await dexieDb.settings.put({ key: 'conference_venue_link', value: 'https://share.google/RXS2WVdiFVccyYdOU' });
      }
    } catch (e) {
      console.warn("Could not ensure fallback gallery/settings in IndexedDB:", e);
    }

    console.log("IndexedDB cache synchronization completed!");
  }
};
