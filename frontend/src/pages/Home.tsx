import { useState } from 'react';
import {
  Container, SimpleGrid, Title, Text, Button, Accordion, Stack, Paper, Group, TextInput, Textarea, Tabs, Box, Image, AspectRatio, Card, useMantineColorScheme
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

import Header from '../components/Header';
import Hero from '../components/Hero';
import SpeakerCard from '../components/SpeakerCard';
import AgendaTimeline from '../components/AgendaTimeline';
import RegistrationForm from '../components/RegistrationForm';
import BrochureModal from '../components/BrochureModal';
import AbstractModal from '../components/AbstractModal';
import Footer from '../components/Footer';

import {
  IconShieldLock, IconSchool, IconBrain, IconUserCheck, IconLeaf, IconUsersGroup, IconAlertTriangle, IconFlame,
  IconScale, IconCpu, IconBulb, IconFirstAidKit, IconCheck, IconMail, IconPhone, IconMapPin, IconActivity
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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '' }
  });

  // Load data locally via Dexie Live Query hooks
  const speakers = useLiveQuery(() => db.speakers.orderBy('order').toArray()) || [];
  const agenda = useLiveQuery(() => db.agenda.orderBy('order').toArray()) || [];
  const faqs = useLiveQuery(() => db.faqs.orderBy('order').toArray()) || [];
  const gallery = useLiveQuery(() => db.gallery.toArray()) || [];
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
    { title: 'The Internet of Medical Things (IoMT)', desc: 'Connecting remote sensors, smart beds, and patient wearables to standard clinical EHR flows.', icon: IconActivity },
    { title: 'Cybersecurity & Data Privacy in Nursing', desc: 'Navigating patient confidentiality, clinical database safeguards, and network guidelines.', icon: IconShieldLock },
    { title: 'Nursing Education & Learning', desc: 'Nex-Gen training methodologies, digital simulation tools, and pedagogical curriculums.', icon: IconSchool },
    { title: 'Mental Health & Well-being of Nurses', desc: 'Solutions to clinical burnout, administrative networks, stress audits, and work-life balance.', icon: IconBrain },
    { title: 'Advanced Practices & Expanded Roles', desc: 'Nursing leads, prescriptive authority, critical diagnosis, and independent community practitioners.', icon: IconUserCheck },
    { title: 'Green Nursing & Healthcare Sustainability', desc: 'Sustainable clinical recycling, clinical carbon reduction, and plastic elimination audits.', icon: IconLeaf },
    { title: 'Cultural Competency & Trauma-Informed Care', desc: 'Interactions, clinical empathy models, and protective diagnostic environments.', icon: IconUsersGroup },
    { title: 'Disaster Response & Global Health Security', desc: 'Epidemiological monitoring, pandemic response plans, and humanitarian critical nursing.', icon: IconAlertTriangle },
    { title: 'Maternal & Child Health Milestones', desc: 'Neonatal resuscitation, prenatal nursing, and maternal mortality protection policies.', icon: IconFlame },
    { title: 'Nurses Policy & Advocacy', desc: 'Wage regulations, healthcare representation, staffing laws, and global nursing lobbies.', icon: IconScale },
    { title: 'Role of AI In Healthcare', desc: 'AI diagnostics, prognostic modeling, nurse scheduling scripts, and automated chart parsing.', icon: IconCpu },
    { title: 'Scaling of Local Innovations', desc: 'Taking regional nurse-led breakthroughs and exporting them to international healthcare platforms.', icon: IconBulb },
    { title: 'Nursing-Led Primary Care', desc: 'Nurse practitioner clinics, rural healthcare deployment, and bedside preventive care.', icon: IconFirstAidKit }
  ];

  const filteredGallery = galleryCategory === 'ALL'
    ? gallery
    : gallery.filter((item: any) => item.category === galleryCategory);

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
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
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
                Welcome Note
              </div>
              <Title order={2} style={{ fontFamily: 'var(--font-title)', fontSize: '32px', marginBottom: '20px', lineHeight: 1.25 }}>
                Innovating Bedside Care & Global Health Security
              </Title>
              <Text style={{ lineHeight: 1.7, marginBottom: '15px' }} size="md" c="dimmed">
                Syntrophy Conferences invites all healthcare professionals, researchers, practitioners, and clinical nurses to be a part of our <b>Global Nursing Conference 2027 (GNC-2027)</b>, which is going to be held in <b>Rome, Italy on May 13-14th, 2027</b>.
              </Text>
              <Text style={{ lineHeight: 1.7, marginBottom: '20px' }} size="md" c="dimmed">
                The main theme of the conference is <b>"Nex-Gen Nursing – Trends, Techs, Triumphs in Global Health"</b>. Join international delegates and share, discuss, and evaluate current breakthroughs, technological integrations, and policy evolutions transforming medical nursing globally.
              </Text>
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

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <Paper radius="lg" style={{ overflow: 'hidden', boxShadow: 'var(--glass-shadow)' }}>
                <Image
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
                  alt="Nursing Innovation"
                  height={400}
                />
              </Paper>
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
              Key Conference Topics Discussed
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

      {/* Speakers Section */}
      <Box component="section" id="speakers" style={{ padding: '80px 0', background: 'var(--color-light-gray)' }}>
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
          </Stack>

          <Tabs value={galleryCategory} onChange={(val) => setGalleryCategory(val || 'ALL')} style={{ width: '100%' }}>
            <Tabs.List justify="center" style={{ borderBottom: 'none', marginBottom: '30px' }}>
              <Tabs.Tab value="ALL" style={{ fontSize: '14px', fontWeight: 600 }}>All Photos</Tabs.Tab>
              <Tabs.Tab value="CONFERENCE" style={{ fontSize: '14px', fontWeight: 600 }}>Previous Conferences</Tabs.Tab>
              <Tabs.Tab value="ROME" style={{ fontSize: '14px', fontWeight: 600 }}>Rome Sightseeing</Tabs.Tab>
            </Tabs.List>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {filteredGallery.map((item: any) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card p={0} radius="lg" style={{ overflow: 'hidden', height: '250px', border: '1px solid var(--glass-border)' }}>
                    <Image src={item.imagePath} height={250} alt={item.title || 'Gallery item'} />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))',
                        padding: '20px 15px',
                        color: '#fff'
                      }}
                    >
                      <Text size="sm" fw={700} style={{ fontFamily: 'var(--font-title)' }}>{item.title}</Text>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </SimpleGrid>
          </Tabs>
        </Container>
      </Box>

      {/* Sponsors Section */}
      <Box 
        component="section" 
        id="sponsors" 
        style={{ 
          padding: '60px 0', 
          background: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.4)',
          borderTop: colorScheme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
          borderBottom: colorScheme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'
        }}
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
                Venue Location
              </div>
              <Title order={2} style={{ fontFamily: 'var(--font-title)', fontSize: '32px', marginBottom: '15px' }}>
                Conference Venue & Hotel Info
              </Title>
              <Text size="md" c="dimmed" style={{ lineHeight: 1.6, marginBottom: '20px' }}>
                The conference venue hotel details in Rome will be announced shortly. The venue will be a premium 4/5 star hotel situated centrally in Rome, Italy, fully equipped with modular conference halls, seminar rooms, dining lounges, and delegate accommodation suites.
              </Text>
              
              <Stack gap="sm">
                <Paper p="md" radius="md" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                  <Text fw={700} size="sm">📍 Centrally Located in Rome, Italy</Text>
                  <Text size="xs" c="dimmed" style={{ marginTop: '2px' }}>Easy taxi and metro transit connections to Leonardo da Vinci–Fiumicino Airport (FCO).</Text>
                </Paper>
                <Paper p="md" radius="md" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                  <Text fw={700} size="sm">✈️ Travel & Visa Support</Text>
                  <Text size="xs" c="dimmed" style={{ marginTop: '2px' }}>Visa invitation letters are issued for registered delegates who submit abstracts or complete package payments.</Text>
                </Paper>
              </Stack>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ width: '100%' }}>
              <Paper radius="lg" style={{ overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                {/* Embed a generic beautiful Google Maps view of Rome, Italy */}
                <AspectRatio ratio={16 / 10}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d190028.98064553313!2d12.371191599427218!3d41.90998595443217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132f6196f9928ebb%3A0xb90f770693656e38!2sRome%2C%20Metropolitan%20City%20of%20Rome%20Capital%2C%20Italy!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                    title="Rome, Italy Venue Map"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </AspectRatio>
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
                    <Text size="sm" fw={600}>nursing@syntrophyconferences.org</Text>
                  </div>
                </Group>
                
                <Group gap="sm">
                  <div style={{ background: 'rgba(0,119,255,0.1)', color: '#0077ff', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '8px' }}>
                    <IconPhone size={22} />
                  </div>
                  <div>
                    <Text size="xs" fw={700} c="dimmed" style={{ textTransform: 'uppercase' }}>Phone / WhatsApp Support</Text>
                    <Text size="sm" fw={600}>+39 06 1234567</Text>
                  </div>
                </Group>

                <Group gap="sm">
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
      <Footer />
    </div>
  );
}
