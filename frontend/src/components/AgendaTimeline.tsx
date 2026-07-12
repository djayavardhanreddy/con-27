import { useState } from 'react';
import { Group, Button, Card, Text, Badge, Stack, SimpleGrid } from '@mantine/core';
import { IconMapPin, IconClock, IconUser } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgendaItem {
  id: string;
  day: number;
  timeSlot: string;
  title: string;
  description?: string | null;
  speakerName?: string | null;
  location?: string | null;
  type: string;
}

interface AgendaTimelineProps {
  agenda: AgendaItem[];
}

export default function AgendaTimeline({ agenda }: AgendaTimelineProps) {
  const [activeDay, setActiveDay] = useState<number>(1);

  const filteredAgenda = agenda
    .filter((item) => item.day === activeDay)
    .sort((a, b) => (a.timeSlot > b.timeSlot ? 1 : -1));

  const getTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'KEYNOTE':
        return 'blue';
      case 'PANEL':
        return 'violet';
      case 'BREAK':
        return 'gray';
      case 'SOCIAL':
        return 'pink';
      default:
        return 'teal';
    }
  };

  return (
    <Stack gap="xl" align="center" style={{ width: '100%' }}>
      {/* Day Selector Buttons */}
      <Group justify="center" gap="md">
        <Button
          size="lg"
          variant={activeDay === 1 ? 'filled' : 'light'}
          color={activeDay === 1 ? 'medical.5' : 'gray'}
          onClick={() => setActiveDay(1)}
          style={{
            borderRadius: '30px',
            padding: '0 32px',
            fontWeight: 700,
            fontSize: '16px',
            boxShadow: activeDay === 1 ? '0 4px 12px rgba(0, 119, 255, 0.2)' : 'none'
          }}
        >
          Day 1 — May 13, 2027
        </Button>
        <Button
          size="lg"
          variant={activeDay === 2 ? 'filled' : 'light'}
          color={activeDay === 2 ? 'medical.5' : 'gray'}
          onClick={() => setActiveDay(2)}
          style={{
            borderRadius: '30px',
            padding: '0 32px',
            fontWeight: 700,
            fontSize: '16px',
            boxShadow: activeDay === 2 ? '0 4px 12px rgba(0, 119, 255, 0.2)' : 'none'
          }}
        >
          Day 2 — May 14, 2027
        </Button>
      </Group>

      {/* Sessions list */}
      <div style={{ width: '100%', maxWidth: '900px', position: 'relative', marginTop: '20px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            style={{ width: '100%' }}
          >
            {filteredAgenda.length === 0 ? (
              <Card p="xl" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                <Text c="dimmed">No sessions scheduled for this day yet.</Text>
              </Card>
            ) : (
              filteredAgenda.map((item) => (
                <div key={item.id} className="timeline-item">
                  <Card
                    p="lg"
                    style={{
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '16px',
                      boxShadow: 'var(--glass-shadow)',
                      marginBottom: '20px'
                    }}
                  >
                    <SimpleGrid cols={{ base: 1, md: 4 }} spacing="md">
                      {/* Left: Time & Badge */}
                      <Stack gap="xs" style={{ mdSpan: 1 }}>
                        <Group gap="xs" c="medical.6">
                          <IconClock size={16} />
                          <Text fw={700} size="sm">
                            {item.timeSlot}
                          </Text>
                        </Group>
                        <div>
                          <Badge color={getTypeColor(item.type)} variant="light">
                            {item.type}
                          </Badge>
                        </div>
                      </Stack>

                      {/* Right: Info details */}
                      <Stack gap="xs" style={{ gridColumn: 'span 3' }}>
                        <Text
                          style={{
                            fontFamily: 'var(--font-title)',
                            fontSize: '18px',
                            fontWeight: 700,
                            lineHeight: 1.3
                          }}
                        >
                          {item.title}
                        </Text>

                        {item.description && (
                          <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
                            {item.description}
                          </Text>
                        )}

                        <Group gap="lg" style={{ marginTop: '5px' }}>
                          {item.speakerName && (
                            <Group gap="xs">
                              <IconUser size={15} color="gray" />
                              <Text size="xs" fw={600} c="dimmed">
                                {item.speakerName}
                              </Text>
                            </Group>
                          )}
                          {item.location && (
                            <Group gap="xs">
                              <IconMapPin size={15} color="gray" />
                              <Text size="xs" fw={500} c="dimmed">
                                {item.location}
                              </Text>
                            </Group>
                          )}
                        </Group>
                      </Stack>
                    </SimpleGrid>
                  </Card>
                </div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Stack>
  );
}
