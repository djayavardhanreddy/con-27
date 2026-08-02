import { Container, Title, Text, Group, Button, SimpleGrid, Stack, useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconArrowRight, IconDownload, IconFileText, IconUsers, IconMicrophone, IconGlobe } from '@tabler/icons-react';
import CountdownTimer from './CountdownTimer';

interface HeroProps {
  onOpenBrochure: () => void;
  onOpenAbstract: () => void;
}

export default function Hero({ onOpenBrochure, onOpenAbstract }: HeroProps) {
  const { colorScheme } = useMantineColorScheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } }
  };

  const handleRegisterScroll = () => {
    const element = document.querySelector('#registration');
    if (element) {
      const offset = 60;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const stats = [
    { label: 'Presentations', value: '80+', icon: IconUsers },
    { label: 'Speakers', value: '50+', icon: IconMicrophone },
    { label: 'Countries', value: '30+', icon: IconGlobe },
    { label: 'Research Papers', value: '100+', icon: IconFileText }
  ];

  return (
    <div
      className="hero-parallax"
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundImage: colorScheme === 'dark'
          ? 'linear-gradient(to bottom, rgba(12, 26, 48, 0.85), rgba(12, 26, 48, 0.9)), url("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1920")'
          : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.75), rgba(240, 244, 248, 0.85)), url("https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1920")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: '120px',
        paddingBottom: '80px',
        display: 'flex',
        alignItems: 'center',
        color: colorScheme === 'dark' ? '#ffffff' : '#0c1a30',
        overflow: 'hidden'
      }}
    >
      {/* Decorative backdrop shapes */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,119,255,0.15) 0%, rgba(0,0,0,0) 70%)',
          top: '-10%',
          right: '-10%',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 70%)',
          bottom: '-10%',
          left: '-5%',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      <Container size="xl" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: '100%' }}
        >
          <Stack align="center" gap="xl" style={{ textAlign: 'center' }}>
            
            {/* Conference Badge */}
            <motion.div variants={itemVariants}>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid var(--color-emerald-green)',
                  color: '#10b981',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  display: 'inline-block',
                  fontFamily: 'var(--font-sans)',
                  textTransform: 'uppercase'
                }}
              >
                Global Nursing Conference 2027
              </div>
            </motion.div>

            {/* Conference Theme & Title */}
            <motion.div variants={itemVariants} style={{ maxWidth: '900px' }}>
              <Title
                order={1}
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: 'clamp(2rem, 5vw, 4rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-1px'
                }}
              >
                Nex-Gen Nursing – Trends, Techs, Triumphs in Global Health
              </Title>
            </motion.div>

            {/* Venue & Date Meta */}
            <motion.div variants={itemVariants}>
              <Text
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                  fontWeight: 500,
                  color: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(12, 26, 48, 0.85)'
                }}
              >
                📍 Rome, Italy &nbsp; | &nbsp; 📅 May 13–14, 2027
              </Text>
            </motion.div>

            {/* Countdown timer */}
            <motion.div variants={itemVariants} style={{ width: '100%', margin: '15px 0' }}>
              <CountdownTimer />
            </motion.div>

            {/* Main Action CTAs */}
            <motion.div variants={itemVariants}>
              <Group gap="md" justify="center" style={{ flexWrap: 'wrap' }}>
                <Button
                  size="lg"
                  variant="outline"
                  color="blue"
                  leftSection={<IconDownload size={18} />}
                  onClick={onOpenBrochure}
                  style={{
                    height: '54px',
                    fontWeight: 700,
                    borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(12, 26, 48, 0.25)',
                    color: colorScheme === 'dark' ? '#ffffff' : '#0c1a30',
                    borderRadius: '30px',
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    padding: '0 30px',
                    '&:hover': {
                      backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
                      borderColor: colorScheme === 'dark' ? '#ffffff' : '#0c1a30'
                    }
                  }}
                >
                  Download Brochure
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  color="emerald.6"
                  leftSection={<IconFileText size={18} />}
                  onClick={onOpenAbstract}
                  style={{
                    height: '54px',
                    fontWeight: 700,
                    borderRadius: '30px',
                    padding: '0 30px',
                    borderColor: 'rgba(16, 185, 129, 0.4)',
                    color: '#10b981',
                    backgroundColor: colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.02)',
                  }}
                >
                  Submit Abstract
                </Button>

                <Button
                  size="lg"
                  variant="gradient"
                  gradient={{ from: 'medical.5', to: 'emerald.5' }}
                  rightSection={<IconArrowRight size={18} />}
                  onClick={handleRegisterScroll}
                  style={{
                    boxShadow: '0 4px 20px rgba(0, 119, 255, 0.4)',
                    height: '54px',
                    fontWeight: 700,
                    borderRadius: '30px',
                    padding: '0 30px'
                  }}
                >
                  Register Now
                </Button>
              </Group>
            </motion.div>

            {/* Statistics Counters */}
            <motion.div variants={itemVariants} style={{ width: '100%', marginTop: '30px' }}>
              <SimpleGrid
                cols={{ base: 2, md: 4 }}
                spacing="xl"
                style={{
                  background: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  border: colorScheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(12, 26, 48, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <Stack key={idx} align="center" gap={6} style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          background: 'rgba(0, 119, 255, 0.15)',
                          borderRadius: '50%',
                          width: '45px',
                          height: '45px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0077ff'
                        }}
                      >
                        <Icon size={22} />
                      </div>
                      <div>
                        <Text style={{ fontFamily: 'var(--font-title)', fontSize: '1.75rem', fontWeight: 800, color: colorScheme === 'dark' ? '#ffffff' : '#0c1a30', lineHeight: 1.1 }}>
                          {stat.value}
                        </Text>
                        <Text size="xs" fw={600} c={colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(12, 26, 48, 0.6)'} style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {stat.label}
                        </Text>
                      </div>
                    </Stack>
                  );
                })}
              </SimpleGrid>
            </motion.div>

          </Stack>
        </motion.div>
      </Container>
    </div>
  );
}
