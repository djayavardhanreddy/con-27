import { useState, useEffect } from 'react';
import { SimpleGrid, Paper, Text, Stack } from '@mantine/core';

export default function CountdownTimer() {
  const targetDate = new Date('2027-05-13T09:00:00').getTime();
  
  const calculateTimeLeft = () => {
    const difference = targetDate - new Date().getTime();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => {
    return num < 10 ? `0${num}` : num.toString();
  };

  const timeUnits = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINUTES', value: timeLeft.minutes },
    { label: 'SECONDS', value: timeLeft.seconds }
  ];

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {timeUnits.map((unit) => (
        <Paper
          key={unit.label}
          radius="md"
          p="md"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(5px)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.2s ease'
          }}
          className="countdown-card"
        >
          <Stack align="center" gap={4}>
            <Text
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '2.5rem',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {formatNumber(unit.value)}
            </Text>
            <Text
              size="xs"
              fw={700}
              c="rgba(255, 255, 255, 0.7)"
              style={{ letterSpacing: '1.5px', fontFamily: 'var(--font-sans)' }}
            >
              {unit.label}
            </Text>
          </Stack>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
