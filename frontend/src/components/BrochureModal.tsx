import { Modal, TextInput, Textarea, Button, Stack, Text } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { db } from '../services/db';
import { IconCheck } from '@tabler/icons-react';

const brochureSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number must be at least 5 digits'),
  country: z.string().min(2, 'Country must be specified'),
  query: z.string().optional()
});

type BrochureFormData = z.infer<typeof brochureSchema>;

interface BrochureModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function BrochureModal({ opened, onClose }: BrochureModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BrochureFormData>({
    resolver: zodResolver(brochureSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      country: '',
      query: ''
    }
  });

  const downloadMutation = useMutation({
    mutationFn: async (data: BrochureFormData) => {
      const newLead = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString()
      };
      await db.brochureDownloads.add(newLead);
      return newLead;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success!',
        message: 'Your download request has been registered. Starting download...',
        color: 'teal',
        icon: <IconCheck size={18} />
      });
      
      // Trigger actual mock brochure PDF download from public directory
      const link = document.createElement('a');
      link.href = '/brochure.pdf';
      link.download = 'GNC-2027-Conference-Brochure.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      reset();
      onClose();
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to record download request.',
        color: 'red'
      });
    }
  });

  const onSubmit = (data: BrochureFormData) => {
    downloadMutation.mutate(data);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Download Conference Brochure"
      size="md"
      radius="md"
      styles={{
        title: { fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '18px' }
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            Fill in your details to get instant access to the Global Nursing Conference 2027 brochure, containing agenda breakdowns, speaker bios, and venue packages.
          </Text>

          <TextInput
            label="Full Name"
            placeholder="Dr. Jane Doe"
            required
            error={errors.name?.message}
            {...register('name')}
          />

          <TextInput
            label="Email Address"
            placeholder="jane.doe@hospital.org"
            required
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <TextInput
            label="Phone Number"
            placeholder="+1 555-0199"
            required
            error={errors.phone?.message}
            {...register('phone')}
          />

          <TextInput
            label="Country"
            placeholder="Italy"
            required
            error={errors.country?.message}
            {...register('country')}
          />

          <Textarea
            label="Special Queries / Comments"
            placeholder="Type any questions you may have here..."
            rows={3}
            error={errors.query?.message}
            {...register('query')}
          />


          <Button
            type="submit"
            fullWidth
            loading={downloadMutation.isPending}
            variant="gradient"
            gradient={{ from: 'medical.5', to: 'emerald.5' }}
            style={{ height: '45px', marginTop: '10px', fontWeight: 700 }}
          >
            Download Brochure PDF
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
