import { useState, useEffect } from 'react';
import { Container, Group, Button, Drawer, Burger, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSun, IconMoon } from '@tabler/icons-react';

interface HeaderProps {
  onOpenBrochure: () => void;
  onOpenAbstract: () => void;
}

export default function Header({ onOpenBrochure, onOpenAbstract }: HeaderProps) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [scrolled, setScrolled] = useState(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (selector: string) => {
    close();
    const element = document.querySelector(selector);
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

  const navItems = [
    { label: 'Home', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { label: 'Brochure', action: onOpenBrochure },
    { label: 'Abstracts', action: onOpenAbstract },
    { label: 'Agenda', action: () => handleNavClick('#agenda') },
    { label: 'Register', action: () => handleNavClick('#registration') },
    { label: 'Contact', action: () => handleNavClick('#contact') },
    { label: 'FAQs', action: () => handleNavClick('#faqs') },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.3s ease',
        background: colorScheme === 'dark' 
          ? (scrolled ? 'rgba(12, 26, 48, 0.85)' : 'rgba(12, 26, 48, 0.65)') 
          : (scrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.65)'),
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: colorScheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: scrolled ? '0 8px 32px 0 rgba(31, 38, 135, 0.08)' : 'none'
      }}
    >
      <Container size="xl" style={{ width: '100%' }}>
        <Group justify="space-between" align="center">
          {/* Logo */}
          <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src={colorScheme === 'dark' ? '/logo_dark.png' : '/logo_light.png'} 
              alt="Syntrophy Global Health Logo" 
              style={{ height: '48px', objectFit: 'contain' }} 
            />
          </Group>

          {/* Desktop Navigation Links */}
          <Group gap="xl" visibleFrom="xl">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="transparent"
                onClick={item.action}
                className="header-nav-btn"
                style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  fontFamily: 'var(--font-sans)',
                  padding: '0 8px'
                }}
              >
                {item.label}
              </Button>
            ))}
          </Group>

          {/* Action buttons (Theme and Register) */}
          <Group gap="md">
            <ActionIcon
              variant="subtle"
              onClick={() => toggleColorScheme()}
              size="lg"
              radius="md"
              color={colorScheme === 'dark' ? 'yellow' : 'blue'}
            >
              {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>

            <Button
              visibleFrom="sm"
              variant="gradient"
              gradient={{ from: 'medical.5', to: 'emerald.5' }}
              onClick={() => handleNavClick('#registration')}
              style={{
                boxShadow: '0 4px 14px rgba(0, 119, 255, 0.3)',
                fontWeight: 600
              }}
            >
              Register Now
            </Button>

            <Burger opened={opened} onClick={toggle} hiddenFrom="xl" size="sm" color={colorScheme === 'dark' ? '#fff' : '#0c1a30'} />
          </Group>
        </Group>
      </Container>

      {/* Mobile Navigation Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        size="md"
        padding="xl"
        title="Navigation Menu"
        hiddenFrom="xl"
        styles={{
          header: { fontFamily: 'var(--font-title)', fontWeight: 700 },
          body: { paddingTop: '20px' }
        }}
      >
        <Group gap="md" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="light"
              color="gray"
              fullWidth
              onClick={() => {
                close();
                item.action();
              }}
              styles={{
                root: {
                  justifyContent: 'flex-start',
                  height: '45px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500
                }
              }}
            >
              {item.label}
            </Button>
          ))}
          <Button
            variant="gradient"
            gradient={{ from: 'medical.5', to: 'emerald.5' }}
            fullWidth
            onClick={() => {
              close();
              handleNavClick('#registration');
            }}
            style={{ height: '45px', marginTop: '10px' }}
          >
            Register Now
          </Button>
        </Group>
      </Drawer>
    </header>
  );
}
