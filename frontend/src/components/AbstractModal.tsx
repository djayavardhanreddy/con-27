import { useState } from 'react';
import { Modal, TextInput, Select, Button, Stack, Text, Alert, Group, Paper, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import api from '../services/api';
import { db } from '../services/db';
import { IconCheck, IconFileFilled, IconUpload, IconX, IconInfoCircle } from '@tabler/icons-react';

const abstractSchema = z.object({
  prefix: z.string().min(1, 'Please select a prefix'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number must be at least 5 digits'),
  profession: z.string().min(2, 'Profession must be specified'),
  country: z.string().min(2, 'Country must be specified'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  topicsDiscussed: z.string().min(1, 'Please select a topic discussed')
});

type AbstractFormData = z.infer<typeof abstractSchema>;

interface AbstractModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function AbstractModal({ opened, onClose }: AbstractModalProps) {
  const { colorScheme } = useMantineColorScheme();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<AbstractFormData>({
    resolver: zodResolver(abstractSchema),
    defaultValues: {
      prefix: '',
      name: '',
      email: '',
      phone: '',
      profession: '',
      country: '',
      title: '',
      topicsDiscussed: ''
    }
  });

  const abstractMutation = useMutation({
    mutationFn: async (data: AbstractFormData) => {
      if (!file) throw new Error('No file selected');

      const uploadData = new FormData();
      uploadData.append('file', file);
      
      const uploadResponse = await api.post('/abstracts/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { filePath, fileName } = uploadResponse.data;

      const newAbstract = {
        id: crypto.randomUUID(),
        ...data,
        fileName,
        filePath,
        status: 'PENDING' as const,
        createdAt: new Date().toISOString()
      };

      await db.abstracts.add(newAbstract);
      return newAbstract;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success!',
        message: 'Your research abstract has been submitted successfully!',
        color: 'teal',
        icon: <IconCheck size={18} />
      });
      reset();
      setFile(null);
      setFileError(null);
      onClose();
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Failed to submit abstract';
      notifications.show({
        title: 'Submission Failed',
        message: errorMsg,
        color: 'red'
      });
    }
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (!ext || !allowedExtensions.includes(ext)) {
      setFileError('Invalid file type. Only PDF, DOC, or DOCX are allowed.');
      setFile(null);
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds the 10MB limit.');
      setFile(null);
      return;
    }

    setFileError(null);
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const onSubmit = (data: AbstractFormData) => {
    if (!file) {
      setFileError('Please upload an abstract document.');
      return;
    }
    abstractMutation.mutate(data);
  };

  const triggerSampleDownload = () => {
    const link = document.createElement('a');
    link.href = '/abstract_sample.docx';
    link.download = 'GNC-2027-Abstract-Sample-Template.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Submit Research Abstract"
      size="lg"
      radius="md"
      styles={{
        title: { fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '18px' }
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          {/* Guidelines info */}
          <Alert variant="light" color="blue" icon={<IconInfoCircle size={16} />}>
            <Text size="xs" fw={700} style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Submission Guidelines:
            </Text>
            <Text size="xs" style={{ marginTop: '4px' }}>
              • Submissions must be written in English. Max 300 words.<br />
              • Limit file sizes to 10MB maximum.<br />
              • Supported formats: <b>PDF, DOC, DOCX</b>.
            </Text>
            <Button
              variant="subtle"
              size="xs"
              color="blue"
              onClick={triggerSampleDownload}
              style={{ marginTop: '8px', padding: 0, height: 'auto' }}
            >
              📥 Download Abstract Sample Template
            </Button>
          </Alert>

          <Group grow>
            <Controller
              name="prefix"
              control={control}
              render={({ field }) => (
                <Select
                  label="Prefix"
                  placeholder="Select..."
                  data={['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.']}
                  error={errors.prefix?.message}
                  required
                  {...field}
                />
              )}
            />
            
            <TextInput
              label="Full Name"
              placeholder="Jane Doe"
              required
              error={errors.name?.message}
              {...register('name')}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Email Address"
              placeholder="jane.doe@univ.edu"
              required
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
            
            <TextInput
              label="Phone Number"
              placeholder="+39 333-12345"
              required
              error={errors.phone?.message}
              {...register('phone')}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Profession/Role"
              placeholder="Postdoctoral Researcher"
              required
              error={errors.profession?.message}
              {...register('profession')}
            />
            
            <TextInput
              label="Country"
              placeholder="Italy"
              required
              error={errors.country?.message}
              {...register('country')}
            />
          </Group>

          <TextInput
            label="Abstract Title"
            placeholder="e.g. IoT wearables in bedside patient monitoring: A double blind study"
            required
            error={errors.title?.message}
            {...register('title')}
          />

          <Controller
            name="topicsDiscussed"
            control={control}
            render={({ field }) => (
              <Select
                label="Topics Discussed"
                placeholder="Select topic"
                data={[
                  'The Internet of Medical Things (IoMT)',
                  'Cybersecurity & data privacy in Nursing',
                  'Nursing Education and Learning',
                  'Mental Health & Well-being of Nurses',
                  'Advanced Practices & Expanded Roles',
                  'Green Nursing & Sustainability',
                  'Cultural competency & Trauma-Informed care',
                  'Disaster Response & Global Health security',
                  'Maternal & Child Health Milestones',
                  'Nurses Policy & Advocacy',
                  'Role of AI In Healthcare',
                  'Scaling of Local innovations in Nursing',
                  'Nursing-Led primary care'
                ]}
                error={errors.topicsDiscussed?.message}
                required
                {...field}
              />
            )}
          />

          {/* Drag & Drop Area */}
          <Stack gap={5}>
            <Text size="sm" fw={500}>
              Upload Abstract File <span style={{ color: 'red' }}>*</span>
            </Text>
            
            {!file ? (
              <Paper
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragActive ? 'var(--color-medical-blue)' : (colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1')}`,
                  backgroundColor: dragActive ? 'rgba(0, 119, 255, 0.08)' : (colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(248, 250, 252, 0.5)'),
                  padding: '30px 20px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <input
                  type="file"
                  id="abstract-file-upload"
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <label htmlFor="abstract-file-upload" style={{ cursor: 'pointer' }}>
                  <Stack gap="xs" align="center">
                    <IconUpload size={40} color={colorScheme === 'dark' ? '#0077ff' : '#94a3b8'} />
                    <div>
                      <Text size="sm" fw={600} style={{ color: colorScheme === 'dark' ? '#ffffff' : 'var(--color-text-dark)' }}>
                        Drag & drop your abstract document here, or <span style={{ color: '#0077ff' }}>browse files</span>
                      </Text>
                      <Text size="xs" c="dimmed">
                        Supports PDF, DOC, DOCX up to 10MB
                      </Text>
                    </div>
                  </Stack>
                </label>
              </Paper>
            ) : (
              <Paper
                p="md"
                radius="md"
                style={{
                  border: '1px solid #10b981',
                  background: 'rgba(16, 185, 129, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Group gap="sm">
                  <IconFileFilled size={28} color="#10b981" />
                  <div>
                    <Text size="sm" fw={600} style={{ wordBreak: 'break-all' }}>
                      {file.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </Text>
                  </div>
                </Group>
                
                <ActionIcon variant="light" color="red" radius="md" onClick={() => setFile(null)}>
                  <IconX size={16} />
                </ActionIcon>
              </Paper>
            )}
            
            {fileError && (
              <Text size="xs" color="red" fw={500}>
                {fileError}
              </Text>
            )}
          </Stack>

          <Button
            type="submit"
            fullWidth
            loading={abstractMutation.isPending}
            variant="gradient"
            gradient={{ from: 'medical.5', to: 'emerald.5' }}
            style={{ height: '45px', marginTop: '10px', fontWeight: 700 }}
          >
            Submit Abstract
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
