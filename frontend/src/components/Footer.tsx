import { Container, SimpleGrid, Group, Text, TextInput, ActionIcon, Stack, useMantineColorScheme } from '@mantine/core';
import { IconBrandTwitter, IconBrandLinkedin, IconBrandFacebook, IconBrandInstagram, IconSend, IconCheck } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import api from '../services/api';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export default function Footer() {
  const { colorScheme } = useMantineColorScheme();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: '' }
  });

  const subscribeMutation = useMutation({
    mutationFn: async (data: NewsletterFormData) => {
      const response = await api.post('/content/newsletter/subscribe', data);
      return response.data;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Subscribed!',
        message: 'Thank you for subscribing to our newsletter updates.',
        color: 'teal',
        icon: <IconCheck size={18} />
      });
      reset();
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Subscription failed';
      notifications.show({
        title: 'Error',
        message: errorMsg,
        color: 'red'
      });
    }
  });

  const handleScrollTo = (selector: string) => {
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

  const onSubmit = (data: NewsletterFormData) => {
    subscribeMutation.mutate(data);
  };

  return (
    <footer
      style={{
        background: colorScheme === 'dark' ? '#070f1a' : '#0c1a30',
        color: '#ffffff',
        padding: '60px 0 30px 0',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        fontFamily: 'var(--font-sans)'
      }}
    >
      <Container size="xl">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
          
          {/* Col 1: Brand & Bio */}
          <Stack gap="md">
            <Group gap="xs">
              <img 
                src="/logo_dark.png" 
                alt="Syntrophy Global Health Logo" 
                style={{ height: '54px', objectFit: 'contain' }} 
              />
            </Group>
            
            <Text size="sm" c="rgba(255,255,255,0.6)" style={{ lineHeight: 1.6 }}>
              Global Nursing Conference 2027 – Nex-Gen Nursing: Trends, Techs, Triumphs in Global Health. Rome, Italy.
            </Text>
            
            <Group gap="sm">
              <ActionIcon variant="light" color="blue" radius="md" component="a" href="https://twitter.com" target="_blank">
                <IconBrandTwitter size={18} />
              </ActionIcon>
              <ActionIcon variant="light" color="blue" radius="md" component="a" href="https://linkedin.com" target="_blank">
                <IconBrandLinkedin size={18} />
              </ActionIcon>
              <ActionIcon variant="light" color="blue" radius="md" component="a" href="https://facebook.com" target="_blank">
                <IconBrandFacebook size={18} />
              </ActionIcon>
              <ActionIcon variant="light" color="blue" radius="md" component="a" href="https://instagram.com" target="_blank">
                <IconBrandInstagram size={18} />
              </ActionIcon>
            </Group>
          </Stack>

          {/* Col 2: Quick Links */}
          <Stack gap="md">
            <Text fw={700} style={{ fontFamily: 'var(--font-title)', fontSize: '16px', letterSpacing: '0.5px' }}>
              QUICK LINKS
            </Text>
            
            <Stack gap="xs">
              <Text size="sm" style={{ cursor: 'pointer' }} c="rgba(255,255,255,0.6)" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</Text>
              <Text size="sm" style={{ cursor: 'pointer' }} c="rgba(255,255,255,0.6)" onClick={() => handleScrollTo('#agenda')}>Brochure Download</Text>
              <Text size="sm" style={{ cursor: 'pointer' }} c="rgba(255,255,255,0.6)" onClick={() => handleScrollTo('#agenda')}>Abstract Submission</Text>
              <Text size="sm" style={{ cursor: 'pointer' }} c="rgba(255,255,255,0.6)" onClick={() => handleScrollTo('#agenda')}>Agenda Timeline</Text>
              <Text size="sm" style={{ cursor: 'pointer' }} c="rgba(255,255,255,0.6)" onClick={() => handleScrollTo('#registration')}>Registration Options</Text>
              <Text size="sm" style={{ cursor: 'pointer' }} c="rgba(255,255,255,0.6)" onClick={() => handleScrollTo('#faqs')}>FAQs</Text>
            </Stack>
          </Stack>

          {/* Col 3: Useful Resources */}
          <Stack gap="md">
            <Text fw={700} style={{ fontFamily: 'var(--font-title)', fontSize: '16px', letterSpacing: '0.5px' }}>
              USEFUL RESOURCES
            </Text>
            
            <Stack gap="xs">
              <Text size="sm" component="a" href="https://syntrophyconferences.org" target="_blank" c="rgba(255,255,255,0.6)" style={{ textDecoration: 'none' }}>Syntrophy Conferences</Text>
              <Text size="sm" component="a" href="https://www.turismoroma.it" target="_blank" c="rgba(255,255,255,0.6)" style={{ textDecoration: 'none' }}>Rome Tourism</Text>
              <Text size="sm" component="a" href="https://www.who.int" target="_blank" c="rgba(255,255,255,0.6)" style={{ textDecoration: 'none' }}>WHO Guidelines</Text>
              <Text size="sm" component="a" href="https://reopen.europa.eu" target="_blank" c="rgba(255,255,255,0.6)" style={{ textDecoration: 'none' }}>Europe Travel Advice</Text>
            </Stack>
          </Stack>

          {/* Col 4: Newsletter */}
          <Stack gap="md">
            <Text fw={700} style={{ fontFamily: 'var(--font-title)', fontSize: '16px', letterSpacing: '0.5px' }}>
              NEWSLETTER
            </Text>
            
            <Text size="sm" c="rgba(255,255,255,0.6)" style={{ lineHeight: 1.5 }}>
              Subscribe to stay updated with important alerts, speaker additions, and accommodation discount schedules.
            </Text>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Group gap="xs" align="flex-start" style={{ flexWrap: 'nowrap' }}>
                <TextInput
                  placeholder="Enter email..."
                  required
                  type="email"
                  size="sm"
                  style={{ flexGrow: 1 }}
                  error={errors.email?.message}
                  {...register('email')}
                  styles={{
                    input: {
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      height: '40px',
                      '&:focus': {
                        borderColor: '#0077ff'
                      }
                    }
                  }}
                />
                
                <ActionIcon
                  type="submit"
                  loading={subscribeMutation.isPending}
                  variant="filled"
                  color="blue"
                  size="lg"
                  style={{ height: '40px', width: '40px', borderRadius: '8px' }}
                >
                  <IconSend size={18} />
                </ActionIcon>
              </Group>
            </form>
          </Stack>

        </SimpleGrid>

        {/* Divider and Copyright */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            marginTop: '40px',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
          }}
        >
          <Text size="xs" c="rgba(255,255,255,0.4)">
            © {new Date().getFullYear()} Global Nursing Conference. All rights reserved. Organized by Syntrophy Conferences.
          </Text>
          
          <Group gap="md">
            <Text size="xs" c="rgba(255,255,255,0.4)" style={{ cursor: 'pointer', '&:hover': { color: '#fff' } }}>Privacy Policy</Text>
            <Text size="xs" c="rgba(255,255,255,0.4)" style={{ cursor: 'pointer', '&:hover': { color: '#fff' } }}>Terms of Service</Text>
          </Group>
        </div>
      </Container>
    </footer>
  );
}
