import { Card, Image, Text, Group, ActionIcon, Stack, Badge } from '@mantine/core';
import { IconBrandTwitter, IconBrandLinkedin, IconWorld } from '@tabler/icons-react';
import { motion } from 'framer-motion';

interface SpeakerCardProps {
  speaker: {
    name: string;
    designation: string;
    organization: string;
    country: string;
    imagePath?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export default function SpeakerCard({ speaker }: SpeakerCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ height: '100%' }}
    >
      <Card
        className="glass-card"
        padding="md"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          border: '1px solid var(--glass-border)'
        }}
      >
        <Card.Section style={{ position: 'relative', overflow: 'hidden', height: '260px' }}>
          <Image
            src={speaker.imagePath || defaultImage}
            height={260}
            alt={speaker.name}
            style={{
              objectPosition: 'top center',
              transition: 'transform 0.5s ease',
              width: '100%'
            }}
            className="speaker-image"
          />
          <Badge
            color="medical.5"
            variant="filled"
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              textTransform: 'uppercase'
            }}
          >
            {speaker.country}
          </Badge>
        </Card.Section>

        <Stack gap="xs" style={{ flexGrow: 1, marginTop: '16px' }}>
          <Text
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '18px',
              fontWeight: 700,
              lineHeight: 1.2
            }}
          >
            {speaker.name}
          </Text>
          
          <Text size="sm" fw={600} color="medical.6" style={{ lineHeight: 1.2 }}>
            {speaker.designation}
          </Text>
          
          <Text size="xs" c="dimmed" style={{ fontWeight: 500 }}>
            {speaker.organization}
          </Text>
        </Stack>

        <Card.Section
          style={{
            borderTop: '1px solid var(--glass-border)',
            padding: '12px 16px',
            marginTop: '16px'
          }}
        >
          <Group justify="space-between" align="center">
            <Text size="xs" fw={700} c="dimmed" style={{ letterSpacing: '0.5px' }}>
              CONNECT
            </Text>
            
            <Group gap="xs">
              {speaker.twitter && (
                <ActionIcon
                  component="a"
                  href={speaker.twitter}
                  target="_blank"
                  variant="subtle"
                  color="blue"
                  radius="md"
                >
                  <IconBrandTwitter size={18} />
                </ActionIcon>
              )}
              {speaker.linkedin && (
                <ActionIcon
                  component="a"
                  href={speaker.linkedin}
                  target="_blank"
                  variant="subtle"
                  color="blue"
                  radius="md"
                >
                  <IconBrandLinkedin size={18} />
                </ActionIcon>
              )}
              {speaker.website && (
                <ActionIcon
                  component="a"
                  href={speaker.website}
                  target="_blank"
                  variant="subtle"
                  color="teal"
                  radius="md"
                >
                  <IconWorld size={18} />
                </ActionIcon>
              )}
            </Group>
          </Group>
        </Card.Section>
      </Card>
    </motion.div>
  );
}
