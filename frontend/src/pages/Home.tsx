import { useState } from 'react';
import {
  Container, SimpleGrid, Title, Text, Button, Accordion, Stack, Paper, Group, TextInput, Textarea, Tabs, Box, Image, AspectRatio, Card, Modal, Badge, useMantineColorScheme
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, INITIAL_GALLERY_ITEMS } from '../services/db';

import Header from '../components/Header';
import Hero from '../components/Hero';
import SpeakerCard from '../components/SpeakerCard';
import AgendaTimeline from '../components/AgendaTimeline';
import RegistrationForm from '../components/RegistrationForm';
import BrochureModal from '../components/BrochureModal';
import AbstractModal from '../components/AbstractModal';
import Footer from '../components/Footer';

import {
  IconShieldLock, IconSchool, IconBrain, IconAlertTriangle,
  IconCpu, IconBulb, IconCheck, IconMail, IconPhone, IconMapPin, IconActivity, IconClock,
  IconStethoscope, IconBabyCarriage, IconDna, IconHeartHandshake, IconCertificate,
  IconExternalLink
} from '@tabler/icons-react';

// Contact Form Schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Home() {
  const { colorScheme } = useMantineColorScheme();
  const [brochureOpened, { open: openBrochure, close: closeBrochure }] = useDisclosure(false);
  const [abstractOpened, { open: openAbstract, close: closeAbstract }] = useDisclosure(false);
  const [galleryCategory, setGalleryCategory] = useState<string>('ALL');
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<any | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '' }
  });

  // Load data locally via Dexie Live Query hooks
  const speakers = useLiveQuery(() => db.speakers.orderBy('order').toArray()) || [];
  const agenda = useLiveQuery(() => db.agenda.orderBy('order').toArray()) || [];
  const faqs = useLiveQuery(() => db.faqs.orderBy('order').toArray()) || [];
  const liveGallery = useLiveQuery(() => db.gallery.toArray()) || [];
  const gallery = liveGallery.some((item: any) => item.id.startsWith('gal_dsc'))
    ? liveGallery
    : INITIAL_GALLERY_ITEMS;
  const sponsors = useLiveQuery(() => db.sponsors.orderBy('order').toArray()) || [];

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const newMessage = {
        id: crypto.randomUUID(),
        ...data,
        status: 'NEW' as const,
        createdAt: new Date().toISOString()
      };
      await db.contactMessages.add(newMessage);
      return newMessage;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Message Sent!',
        message: 'Your message has been received. Our support team will respond shortly.',
        color: 'teal',
        icon: <IconCheck size={18} />
      });
      reset();
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to record contact message.',
        color: 'red'
      });
    }
  });

  const handleContactSubmit = (data: ContactFormData) => {
    contactMutation.mutate(data);
  };

  const topics = [
    {
      title: 'Nursing Education, practice & Management',
      desc: 'Curriculum transformation, digital clinical simulations, leadership models, and healthcare administration.',
      icon: IconSchool
    },
    {
      title: 'Innovations in Patient Care',
      desc: 'Breakthrough care models, advanced patient-centric technologies, and enhanced clinical outcomes.',
      icon: IconBulb
    },
    {
      title: 'Acute / Critical Care Nursing',
      desc: 'Intensive care protocols, emergency triage, hemodynamic monitoring, and acute patient stabilization.',
      icon: IconActivity
    },
    {
      title: 'Care of Patients with Chronic Disease',
      desc: 'Long-term condition management, holistic patient rehabilitation, and palliative multidisciplinary strategies.',
      icon: IconStethoscope
    },
    {
      title: 'Crisis and Risk Management Primary Care Nursing',
      desc: 'Preventive primary interventions, disaster response preparedness, and outpatient risk reduction.',
      icon: IconAlertTriangle
    },
    {
      title: 'Paediatric Nursing care & NICU',
      desc: 'Specialized neonatal intensive care, developmental milestones, pediatric emergency protocols, and family support.',
      icon: IconBabyCarriage
    },
    {
      title: 'Oncology nursing',
      desc: 'Comprehensive cancer therapies, precision symptom control, chemotherapy care, and patient survivorship.',
      icon: IconDna
    },
    {
      title: 'Ageing and Geriatric Nursing',
      desc: 'Dementia care, mobility preservation, age-related multimorbidity, and compassionate elder care pathways.',
      icon: IconHeartHandshake
    },
    {
      title: 'Mental Health Nursing',
      desc: 'Psychiatric nursing interventions, psychological resilience, trauma-informed care, and nurse well-being.',
      icon: IconBrain
    },
    {
      title: 'Types of Nursing & Training',
      desc: 'Diverse nursing specializations, clinical skill acquisition, accreditation, and continuing professional training.',
      icon: IconCertificate
    },
    {
      title: 'Trends of AI in Healthcare and Nursing',
      desc: 'Machine learning diagnostics, predictive patient analytics, robotic assistance, and smart workflows.',
      icon: IconCpu
    },
    {
      title: 'Nursing Ethics & Informatics',
      desc: 'Ethical nursing frameworks, clinical informatics, EHR systems, and health data governance.',
      icon: IconShieldLock
    }
  ];

  const sortedGallery = [...gallery].sort((a: any, b: any) => {
    // Show Previous Conference photos ('CONFERENCE') first, then other photos ('ROME' / others)
    const aIsConf = a.category === 'CONFERENCE';
    const bIsConf = b.category === 'CONFERENCE';
    if (aIsConf && !bIsConf) return -1;
    if (!aIsConf && bIsConf) return 1;

    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }

    return (a.id || '').localeCompare(b.id || '');
  });

  const filteredGallery = galleryCategory === 'ALL'
    ? sortedGallery
    : sortedGallery.filter((item: any) => item.category === galleryCategory);

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* Header sticky navbar */}
      <Header onOpenBrochure={openBrochure} onOpenAbstract={openAbstract} />

      {/* Hero section */}
      <Hero onOpenBrochure={openBrochure} onOpenAbstract={openAbstract} />

      {/* Welcome Section */}
      <Box component="section" id="about" style={{ padding: '80px 0', background: 'var(--color-light-gray)' }}>
        <Container size="xl">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div
                style={{
                  background: 'rgba(0,119,255,0.08)',
                  color: 'var(--color-medical-blue)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  display: 'inline-block',
                  marginBottom: '15px',
                  textTransform: 'uppercase'
                }}
              >
                Invitation
              </div>
              <Title order={2} style={{ fontFamily: 'var(--font-title)', fontSize: '32px', marginBottom: '20px', lineHeight: 1.25 }}>
                Invitation to GNC 2027
              </Title>
              <Text style={{ lineHeight: 1.7, marginBottom: '15px' }} size="md" c="dimmed">
                Syntrophy Conferences welcomes you to attend the <b>Nursing Conference 2027</b> during May 13-14, 2027 at <b>Holiday Inn Rome - Eur Parco Dei Medici by IHG</b> in Rome, Italy. We cordially invite all participants who are interested in sharing their knowledge and research in the arena of Nursing and Healthcare.
              </Text>
              <Text style={{ lineHeight: 1.7, marginBottom: '15px' }} size="md" c="dimmed">
                This is an excellent opportunity for delegates from Universities and Institutes to interact with world-class Scientists, build strategic networks, and discover upcoming global tools and innovations.
              </Text>
              <Text style={{ lineHeight: 1.7, marginBottom: '25px' }} size="md" c="dimmed">
                Global Nursing Conference 2027 anticipates more than 200 participants from around the globe, featuring thought-provoking Keynote lectures, Oral presentations, and Poster sessions. Intended participants can confirm their participation by registering along with colleagues. Avail the early bird offer to secure your place at this premier gathering.
              </Text>

              {/* About Syntrophy Block */}
              <Paper p="lg" radius="md" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', marginBottom: '25px', boxShadow: 'var(--glass-shadow)' }}>
                <Text fw={700} style={{ fontFamily: 'var(--font-title)', fontSize: '18px', marginBottom: '10px' }}>
                  About Syntrophy
                </Text>
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.6, marginBottom: '12px' }}>
                  Syntrophy Global Conferences organize professional events powered with knowledge, experience, and amazing people, providing distinct opportunities for B2B organizers and academic experts. By gathering expert speakers and leading professionals, we deliver strategic growth opportunities.
                </Text>
                <Group gap="xs" style={{ marginBottom: '6px' }}>
                  <Text size="sm">🎯 <b>Our Motto:</b> Making Knowledge accessible</Text>
                </Group>
                <Group gap="xs" style={{ marginBottom: '15px' }}>
                  <Text size="sm">🚀 <b>Our Mission:</b> To create a global platform for researchers to share and exchange their ideas.</Text>
                </Group>
                <div
                  style={{
                    background: colorScheme === 'dark' ? 'rgba(255, 145, 0, 0.08)' : 'rgba(255, 145, 0, 0.05)',
                    border: '1px solid rgba(255, 145, 0, 0.2)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Text size="sm" fw={700} style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ⏰ Early bird registration closes October 31, 2026
                  </Text>
                </div>
              </Paper>

              <Button
                variant="gradient"
                gradient={{ from: 'medical.5', to: 'emerald.5' }}
                size="md"
                onClick={openBrochure}
                style={{ height: '48px', padding: '0 24px', borderRadius: '8px', fontWeight: 600 }}
              >
                Learn More (Download Brochure)
              </Button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
              <Stack gap="lg">
                <Paper radius="lg" style={{ overflow: 'hidden', boxShadow: 'var(--glass-shadow)' }}>
                  <Image
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
                    alt="Nursing Innovation"
                    height={250}
                  />
                </Paper>

                {/* Key Milestone Dates widget */}
                <Paper p="lg" radius="lg" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)' }}>
                  <Group gap="sm" style={{ marginBottom: '20px' }}>
                    <div style={{ background: 'rgba(0,119,255,0.1)', color: '#0077ff', borderRadius: '50%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconClock size={20} />
                    </div>
                    <Text fw={700} style={{ fontFamily: 'var(--font-title)', fontSize: '18px', color: colorScheme === 'dark' ? '#ffffff' : 'var(--color-navy-blue)' }}>
                      Key Milestone Dates
                    </Text>
                  </Group>
                  <Stack gap="sm">
                    {[
                      { label: 'Abstract Submission Opens', value: 'August 10, 2026', color: '#0077ff' },
                      { label: 'Early Bird Registration Opens', value: 'August 10, 2026', color: '#10b981' },
                      { label: 'Early Bird Registration Closes', value: 'October 31, 2026', color: '#0077ff' },
                      { label: 'Author Notification of Acceptance', value: 'Within 14 Days', color: '#0077ff' },
                      { label: 'Final Registration Deadline', value: 'April 20, 2027', color: '#0077ff' },
                      { label: 'Conference Inauguration', value: 'May 13, 2027 (Rome)', color: '#10b981' }
                    ].map((item, index) => (
                      <Paper
                        key={index}
                        p="sm"
                        radius="md"
                        style={{
                          background: colorScheme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,119,255,0.02)',
                          borderLeft: `4px solid ${item.color}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          cursor: 'default'
                        }}
                      >
                        <Text size="sm" fw={600} style={{ color: colorScheme === 'dark' ? 'rgba(255,255,255,0.85)' : 'var(--color-navy-blue)' }}>
                          {item.label}
                        </Text>
                        <Text size="sm" fw={700} style={{ color: colorScheme === 'dark' ? '#ffffff' : 'var(--color-text-dark)', marginLeft: '10px', textAlign: 'right' }}>
                          {item.value}
                        </Text>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              </Stack>
            </motion.div>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Conference Topics Section */}
      <Box
        component="section"
        id="topics"
        style={{
          padding: '80px 0',
          background: colorScheme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.4)',
          borderBottom: colorScheme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : 'none'
        }}
      >
        <Container size="xl">
          <Stack align="center" gap="xs" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-emerald-green)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', display: 'inline-block', textTransform: 'uppercase' }}>
              Scientific Tracks
            </div>
            <Title order={2} style={{ fontFamily: 'var(--font-title)', fontSize: '32px' }}>
              Key Topics
            </Title>
            <Text c="dimmed" style={{ maxWidth: '600px' }} size="sm">
              Discover the core fields of investigation, panels, and oral abstracts defining our two-day academic schedule.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {topics.map((topic, i) => {
              const Icon = topic.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <Card className="glass-card" p="lg" style={{ height: '100%' }}>
                    <Group align="flex-start" gap="md" style={{ flexWrap: 'nowrap' }}>
                      <div
                        style={{
                          background: 'rgba(0,119,255,0.1)',
                          color: '#0077ff',
                          borderRadius: '12px',
                          width: '45px',
                          height: '45px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Icon size={24} />
                      </div>
                      <Stack gap="xs">
                        <Text fw={700} style={{ fontFamily: 'var(--font-title)', fontSize: '16px', lineHeight: 1.3 }}>
                          {topic.title}
                        </Text>
                        <Text size="sm" c={colorScheme === 'dark' ? 'rgba(255,255,255,0.7)' : 'dimmed'} style={{ lineHeight: 1.5 }}>
                          {topic.desc}
                        </Text>
                      </Stack>
                    </Group>
                  </Card>
                </motion.div>
              );
            })}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Speakers Section - Hidden visually using style */}
      <Box component="section" id="speakers" style={{ display: 'none' }}>
        <Container size="xl">
          <Stack align="center" gap="xs" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div style={{ background: 'rgba(0,119,255,0.08)', color: 'var(--color-medical-blue)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', display: 'inline-block', textTransform: 'uppercase' }}>
              Academic Panel
            </div>
            <Title order={2} style={{ fontFamily: 'var(--font-title)', fontSize: '32px' }}>
              Featured Keynotes & Speakers
            </Title>
            <Text c="dimmed" style={{ maxWidth: '600px' }} size="sm">
              Learn from and network with clinical leaders, university professors, and NGO policy advisers presenting at GNC 2027.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            {speakers.map((speaker: any) => (
              <SpeakerCard key={speaker.id} speaker={speaker} />
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Agenda Section */}
      <Box
        component="section"
        id="agenda"
        style={{
          padding: '80px 0',
          background: colorScheme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.2)',
          borderBottom: colorScheme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : 'none'
        }}
      >
        <Container size="xl">
          <Stack align="center" gap="xs" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-emerald-green)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', display: 'inline-block', textTransform: 'uppercase' }}>
              Time Schedule
            </div>
            <Title order={2} style={{ fontFamily: 'var(--font-title)', fontSize: '32px' }}>
              Conference Program Agenda
            </Title>
            <Text c="dimmed" style={{ maxWidth: '600px' }} size="sm">
              Check out the session timeline for both days. You can download the full brochure for detailed sub-track titles.
            </Text>
          </Stack>

          <AgendaTimeline agenda={agenda} />
        </Container>
      </Box>

      {/* Registration Section */}
      <Box component="section" id="registration" style={{ padding: '80px 0', background: 'var(--color-light-gray)' }}>
        <Container size="xl">
          <Stack align="center" gap="xs" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div style={{ background: 'rgba(0,119,255,0.08)', color: 'var(--color-medical-blue)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', display: 'inline-block', textTransform: 'uppercase' }}>
              Book Tickets
            </div>
            <Title order={2} style={{ fontFamily: 'var(--font-title)', fontSize: '32px' }}>
              Select Registration & Packages
            </Title>
            <Text c="dimmed" style={{ maxWidth: '600px' }} size="sm">
              Choose the package plan that fits your requirements. Accommodation packages (Plan A/B) include 3-nights stay at the conference hotel.
            </Text>
          </Stack>

          <RegistrationForm />
        </Container>
      </Box>

      {/* About Rome & Travel Section */}
      <Box
        component="section"
        id="rome"
        style={{
          padding: '80px 0',
          background: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.3)',
          borderBottom: colorScheme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : 'none'
        }}
      >
        <Container size="xl">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <div style={{ background: 'rgba(0,119,255,0.08)', color: 'var(--color-medical-blue)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', display: 'inline-block', marginBottom: '15px', textTransform: 'uppercase' }}>
                Rome Guide
              </div>
              <Title order={2} style={{ fontFamily: 'var(--font-title)', fontSize: '32px', marginBottom: '20px' }}>
                About Rome: The Eternal City
              </Title>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.6, marginBottom: '15px' }}>
                Known as the <b>"Eternal City"</b>, Rome is a living museum where nearly 3,000 years of globally influential art, architecture, and culture are seamlessly woven into a bustling modern metropolis. It boasts iconic ruins like the Colosseum and the Roman Forum, alongside the majestic Vatican City.
              </Text>

              <Text size="sm" fw={700} style={{ fontFamily: 'var(--font-title)', fontSize: '16px', color: colorScheme === 'dark' ? '#ffffff' : 'var(--color-navy-blue)', marginBottom: '8px' }}>
                Why Visit in May?
              </Text>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.6, marginBottom: '10px' }}>
                • <b>Perfect Weather:</b> Daytime temperatures comfort between 13°C and 23°C (55°F–73°F), avoiding stifling summer humidity. Ideal for walking tours.<br />
                • <b>City in Bloom:</b> Roseto Comunale public gardens open, and Aventine orange gardens reach aromatic peaks.<br />
                • <b>Al Fresco Dining:</b> Pair red wines with seasonal specialties like artichokes, fresh fava beans with Pecorino, and fried zucchini flowers.<br />
                • <b>Pantheon Rose Petals:</b> On Pentecost Sunday, red rose petals are dropped through the oculus dome.
              </Text>
              <Text size="xs" c="orange.9" fw={600} style={{ fontStyle: 'italic', background: 'rgba(255, 145, 0, 0.08)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid orange', marginTop: '10px' }}>
                * Traveler Note: May is Rome\'s peak spring season. Make sure to book tickets for major monuments like the Vatican Museums and Colosseum well in advance!
              </Text>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <SimpleGrid cols={2} spacing="md">
                <Paper radius="md" style={{ overflow: 'hidden', height: '180px', boxShadow: 'var(--glass-shadow)' }}>
                  <Image src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400" height={180} alt="Rome 1" />
                </Paper>
                <Paper radius="md" style={{ overflow: 'hidden', height: '180px', boxShadow: 'var(--glass-shadow)' }}>
                  <Image src="https://images.unsplash.com/photo-1542820229-081e0c12af0b?auto=format&fit=crop&q=80&w=400" height={180} alt="Rome 2" />
                </Paper>
                <Paper radius="md" style={{ overflow: 'hidden', height: '180px', boxShadow: 'var(--glass-shadow)' }}>
                  <Image src="https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&q=80&w=400" height={180} alt="Rome 3" />
                </Paper>
                <Paper radius="md" style={{ overflow: 'hidden', height: '180px', boxShadow: 'var(--glass-shadow)' }}>
                  <Image src="https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&q=80&w=400" height={180} alt="Rome 4" />
                </Paper>
              </SimpleGrid>
            </motion.div>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Photo Gallery Section */}
      <Box component="section" id="gallery" style={{ padding: '80px 0', background: 'var(--color-light-gray)' }}>
        <Container size="xl">
          <Stack align="center" gap="xs" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-emerald-green)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', display: 'inline-block', textTransform: 'uppercase' }}>
              Event Photos
            </div>
            <Title order={2} style={{ fontFamily: 'var(--font-title)', fontSize: '32px' }}>
              Conference & Rome Photo Gallery
            </Title>
            <Text size="sm" c="dimmed" style={{ maxWidth: '640px' }}>
              Explore moments from our previous international conferences, scientific presentation sessions, delegate luncheons, and iconic sights in Rome.
            </Text>
          </Stack>

          <Tabs value={galleryCategory} onChange={(val) => setGalleryCategory(val || 'ALL')} style={{ width: '100%' }}>
            <Tabs.List justify="center" style={{ borderBottom: 'none', marginBottom: '30px' }}>
              <Tabs.Tab value="ALL" style={{ fontSize: '15px', fontWeight: 600 }}>
                All Photos ({gallery.length})
              </Tabs.Tab>
              <Tabs.Tab value="CONFERENCE" style={{ fontSize: '15px', fontWeight: 600 }}>
                Previous Conferences ({gallery.filter((i: any) => i.category === 'CONFERENCE').length})
              </Tabs.Tab>
              <Tabs.Tab value="ROME" style={{ fontSize: '15px', fontWeight: 600 }}>
                Rome Sightseeing ({gallery.filter((i: any) => i.category === 'ROME').length})
              </Tabs.Tab>
            </Tabs.List>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {filteredGallery.map((item: any) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    p={0}
                    radius="lg"
                    onClick={() => setSelectedGalleryItem(item)}
                    style={{
                      overflow: 'hidden',
                      height: '260px',
                      border: '1px solid var(--glass-border)',
                      position: 'relative',
                      cursor: 'pointer',
                      boxShadow: 'var(--glass-shadow)',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
                    }}
                  >
                    <Image
                      src={item.imagePath}
                      height={260}
                      alt={item.title || 'Gallery item'}
                      style={{
                        objectFit: 'cover',
                        width: '100%',
                        transition: 'transform 0.4s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        zIndex: 2
                      }}
                    >
                      <Badge
                        variant="filled"
                        size="sm"
                        color={item.category === 'CONFERENCE' ? 'blue' : 'teal'}
                        style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}
                      >
                        {item.category === 'CONFERENCE' ? 'Conference' : 'Rome'}
                      </Badge>
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
                        padding: '24px 16px 14px',
                        color: '#fff',
                        zIndex: 2
                      }}
                    >
                      <Text size="sm" fw={700} style={{ fontFamily: 'var(--font-title)', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                        {item.title}
                      </Text>
                      <Text size="xs" style={{ opacity: 0.85, marginTop: '2px' }}>
                        Click to view full photo
                      </Text>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </SimpleGrid>
          </Tabs>
        </Container>
      </Box>

      {/* Gallery Photo Lightbox Modal */}
      <Modal
        opened={!!selectedGalleryItem}
        onClose={() => setSelectedGalleryItem(null)}
        title={
          selectedGalleryItem && (
            <Group gap="xs">
              <Badge color={selectedGalleryItem.category === 'CONFERENCE' ? 'blue' : 'teal'} size="sm">
                {selectedGalleryItem.category === 'CONFERENCE' ? 'Conference Event' : 'Rome Landmark'}
              </Badge>
              <Text fw={700} size="md" style={{ fontFamily: 'var(--font-title)' }}>
                {selectedGalleryItem.title}
              </Text>
            </Group>
          )
        }
        size="xl"
        radius="lg"
        centered
        padding="md"
      >
        {selectedGalleryItem && (
          <Stack gap="xs" align="center">
            <Image
              src={selectedGalleryItem.imagePath}
              alt={selectedGalleryItem.title}
              radius="md"
              style={{
                maxHeight: '75vh',
                objectFit: 'contain',
                width: '100%',
                borderRadius: '8px'
              }}
            />
            <Text size="sm" c="dimmed" ta="center">
              {selectedGalleryItem.title}
            </Text>
          </Stack>
        )}
      </Modal>

      {/* Sponsors Section - Hidden visually using style */}
      <Box
        component="section"
        id="sponsors"
        style={{ display: 'none' }}
      >
        <Container size="xl">
          <Text
            ta="center"
            fw={700}
            size="xs"
            c={colorScheme === 'dark' ? 'rgba(255,255,255,0.5)' : 'dimmed'}
            style={{ letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '30px' }}
          >
            Proudly Supported & Sponsored By
          </Text>
          <Group justify="center" gap="xl">
            {sponsors.map((s: any) => {
              const logoUrl = s.name === 'Syntrophy Conferences' && s.logoPath.includes('unsplash.com')
                ? '/logo_light.png'
                : s.logoPath;

              return (
                <Group
                  key={s.id}
                  gap="xs"
                  style={{
                    opacity: 0.85,
                    '&:hover': { opacity: 1 },
                    transition: 'opacity 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  <Image
                    src={logoUrl}
                    width={120}
                    height={50}
                    style={{
                      objectFit: 'contain',
                      filter: colorScheme === 'dark'
                        ? 'brightness(1.2)'
                        : 'grayscale(100%) brightness(80%)'
                    }}
                  />
                  <Text
                    size="sm"
                    fw={700}
                    c={colorScheme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(12,26,48,0.7)'}
                  >
                    {s.name}
                  </Text>
                </Group>
              );
            })}
          </Group>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box component="section" id="faqs" style={{ padding: '80px 0', background: 'var(--color-light-gray)' }}>
        <Container size="md">
          <Stack align="center" gap="xs" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ background: 'rgba(0,119,255,0.08)', color: 'var(--color-medical-blue)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', display: 'inline-block', textTransform: 'uppercase' }}>
              Need Help?
            </div>
            <Title order={2} style={{ fontFamily: 'var(--font-title)', fontSize: '32px' }}>
              Frequently Asked Questions
            </Title>
          </Stack>

          <Accordion variant="separated" radius="md">
            {faqs.map((faq: any) => (
              <Accordion.Item key={faq.id} value={faq.id} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <Accordion.Control style={{ fontFamily: 'var(--font-title)', fontWeight: 600 }}>{faq.question}</Accordion.Control>
                <Accordion.Panel style={{ lineHeight: 1.6, fontSize: '14px', color: 'gray' }}>{faq.answer}</Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Container>
      </Box>

      {/* Venue Hotel Info Map Section */}
      <Box component="section" id="venue" style={{ padding: '80px 0', background: 'rgba(255,255,255,0.2)' }}>
        <Container size="xl">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-emerald-green)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', display: 'inline-block', marginBottom: '15px', textTransform: 'uppercase' }}>
                Official Venue Location
              </div>
              <Title order={2} style={{ fontFamily: 'var(--font-title)', fontSize: '32px', marginBottom: '10px' }}>
                Conference Venue & Hotel Info
              </Title>
              <Text fw={700} size="lg" c="blue" style={{ marginBottom: '15px' }}>
                Holiday Inn Rome - Eur Parco Dei Medici by IHG
              </Text>
              <Text size="md" c="dimmed" style={{ lineHeight: 1.6, marginBottom: '20px' }}>
                We are proud to host the Global Nursing Conference 2027 at the distinguished <b>Holiday Inn Rome - Eur Parco Dei Medici by IHG</b> in Rome, Italy. The hotel offers state-of-the-art modular conference auditoriums, cutting-edge AV facilities, executive dining lounges, and dedicated delegate suites set within quiet, green surroundings close to both Rome FCO Airport and the historic city center.
              </Text>

              <Stack gap="sm">
                <Paper p="md" radius="md" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <div>
                      <Text fw={700} size="sm">📍 Hotel Address</Text>
                      <Text size="sm" fw={600} style={{ marginTop: '2px' }}>
                        Holiday Inn Rome - Eur Parco Dei Medici by IHG
                      </Text>
                      <Text size="xs" c="dimmed" style={{ marginTop: '2px' }}>
                        Viale Castello della Magliana, 65, 00148 Roma RM, Italy
                      </Text>
                    </div>
                    <Button
                      component="a"
                      href="https://share.google/RXS2WVdiFVccyYdOU"
                      target="_blank"
                      rel="noopener noreferrer"
                      size="xs"
                      variant="light"
                      color="blue"
                      rightSection={<IconExternalLink size={14} />}
                      style={{ flexShrink: 0 }}
                    >
                      View on Map
                    </Button>
                  </Group>
                </Paper>

                <Paper p="md" radius="md" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                  <Text fw={700} size="sm">✈️ Convenient Airport & Transit Connections</Text>
                  <Text size="xs" c="dimmed" style={{ marginTop: '2px' }}>
                    Located just 12 km from Leonardo da Vinci–Fiumicino Airport (FCO) and 15 km from Rome city center. Easily accessible via Muratella train station, hotel shuttle service, and taxi connections.
                  </Text>
                </Paper>

                <Paper p="md" radius="md" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                  <Text fw={700} size="sm">🏨 Delegate Amenities & Accommodation</Text>
                  <Text size="xs" c="dimmed" style={{ marginTop: '2px' }}>
                    Equipped with high-tech conference halls, seminar breakout rooms, complimentary high-speed Wi-Fi, swimming pool, fitness center, and on-site Italian dining.
                  </Text>
                </Paper>

                <Paper p="md" radius="md" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                  <Text fw={700} size="sm">📄 Travel & Visa Support</Text>
                  <Text size="xs" c="dimmed" style={{ marginTop: '2px' }}>
                    Official visa invitation letters are promptly issued to registered delegates and keynote speakers once abstracts or registrations are confirmed.
                  </Text>
                </Paper>
              </Stack>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ width: '100%' }}>
              <Paper radius="lg" style={{ overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)' }}>
                {/* Embed Google Maps view of Holiday Inn Rome - Eur Parco Dei Medici */}
                <AspectRatio ratio={16 / 11}>
                  <iframe
                    src="https://maps.google.com/maps?q=Holiday+Inn+Rome+-+Eur+Parco+Dei+Medici,+Viale+Castello+della+Magliana,+65,+00148+Roma+RM,+Italy&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    title="Holiday Inn Rome - Eur Parco Dei Medici, Rome, Italy Venue Map"
                    style={{ border: 0, width: '100%', height: '100%' }}
                    allowFullScreen
                    loading="lazy"
                  />
                </AspectRatio>
                <Box p="md" style={{ background: 'var(--glass-bg)' }}>
                  <Group justify="space-between" align="center">
                    <div>
                      <Text fw={700} size="sm">Holiday Inn Rome - Eur Parco Dei Medici by IHG</Text>
                      <Text size="xs" c="dimmed">Viale Castello della Magliana, 65, 00148 Roma RM, Italy</Text>
                    </div>
                    <Button
                      component="a"
                      href="https://share.google/RXS2WVdiFVccyYdOU"
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                      variant="filled"
                      color="blue"
                      leftSection={<IconMapPin size={16} />}
                      rightSection={<IconExternalLink size={14} />}
                    >
                      Get Directions
                    </Button>
                  </Group>
                </Box>
              </Paper>
            </motion.div>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box component="section" id="contact" style={{ padding: '80px 0', background: 'var(--color-light-gray)' }}>
        <Container size="xl">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <div style={{ background: 'rgba(0,119,255,0.08)', color: 'var(--color-medical-blue)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', display: 'inline-block', marginBottom: '15px', textTransform: 'uppercase' }}>
                Get In Touch
              </div>
              <Title order={2} style={{ fontFamily: 'var(--font-title)', fontSize: '32px', marginBottom: '20px' }}>
                Contact Us For Queries
              </Title>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.6, marginBottom: '30px' }}>
                Have questions regarding registration billing, group package discounts, visa invitation letters, or abstract submission formats? Fill out the contact form or connect with us directly.
              </Text>

              <Stack gap="md">
                <Group gap="sm">
                  <div style={{ background: 'rgba(0,119,255,0.1)', color: '#0077ff', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '8px' }}>
                    <IconMail size={22} />
                  </div>
                  <div>
                    <Text size="xs" fw={700} c="dimmed" style={{ textTransform: 'uppercase' }}>Email Address</Text>
                    <Text size="sm" fw={600} style={{ display: 'block' }}>contact@syntrophyconferences.com</Text>
                    <Text size="sm" fw={600} style={{ display: 'block' }}>contact@nursingconference.net</Text>
                  </div>
                </Group>

                {/* Phone number and Office address hidden visually using style */}
                <Group gap="sm" style={{ display: 'none' }}>
                  <div style={{ background: 'rgba(0,119,255,0.1)', color: '#0077ff', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '8px' }}>
                    <IconPhone size={22} />
                  </div>
                  <div>
                    <Text size="xs" fw={700} c="dimmed" style={{ textTransform: 'uppercase' }}>Phone / WhatsApp Support</Text>
                    <Text size="sm" fw={600}>+39 06 1234567</Text>
                  </div>
                </Group>

                <Group gap="sm" style={{ display: 'none' }}>
                  <div style={{ background: 'rgba(0,119,255,0.1)', color: '#0077ff', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '8px' }}>
                    <IconMapPin size={22} />
                  </div>
                  <div>
                    <Text size="xs" fw={700} c="dimmed" style={{ textTransform: 'uppercase' }}>Office Headquarters</Text>
                    <Text size="sm" fw={600}>Syntrophy Conferences, Rome office, Italy</Text>
                  </div>
                </Group>
              </Stack>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <Paper p="xl" radius="lg" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', boxShadow: 'var(--glass-shadow)' }}>
                <form onSubmit={handleSubmit(handleContactSubmit)}>
                  <Stack gap="sm">
                    <TextInput
                      label="Full Name"
                      placeholder="Jane Doe"
                      required
                      error={errors.name?.message}
                      {...register('name')}
                    />

                    <TextInput
                      label="Email Address"
                      placeholder="jane@example.com"
                      required
                      type="email"
                      error={errors.email?.message}
                      {...register('email')}
                    />

                    <Group grow>
                      <TextInput
                        label="Phone Number"
                        placeholder="+39 333-11111"
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                      <TextInput
                        label="Subject"
                        placeholder="Group packages query"
                        error={errors.subject?.message}
                        {...register('subject')}
                      />
                    </Group>

                    <Textarea
                      label="Message Details"
                      placeholder="Type your questions or comments in detail here..."
                      rows={4}
                      required
                      error={errors.message?.message}
                      {...register('message')}
                    />

                    <Button
                      type="submit"
                      loading={contactMutation.isPending}
                      variant="gradient"
                      gradient={{ from: 'medical.5', to: 'emerald.5' }}
                      fullWidth
                      style={{ height: '45px', marginTop: '10px', fontWeight: 700 }}
                    >
                      Send Message
                    </Button>
                  </Stack>
                </form>
              </Paper>
            </motion.div>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Brochure Form Modal Dialog */}
      <BrochureModal opened={brochureOpened} onClose={closeBrochure} />

      {/* Abstract Form Modal Dialog */}
      <AbstractModal opened={abstractOpened} onClose={closeAbstract} />

      {/* Footer Section */}
      <Footer onOpenBrochure={openBrochure} onOpenAbstract={openAbstract} />
    </div>
  );
}
