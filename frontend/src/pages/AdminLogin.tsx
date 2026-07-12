import { useNavigate } from 'react-router-dom';
import { Container, Paper, Title, TextInput, PasswordInput, Button, Stack, Text, Group, Center, useMantineColorScheme } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { IconLock, IconStethoscope } from '@tabler/icons-react';
import api from '../services/api';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await api.post('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      notifications.show({
        title: 'Welcome Back!',
        message: `Admin login successful. Redirecting to dashboard...`,
        color: 'teal'
      });
      navigate('/admin/dashboard');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Login failed. Check your credentials.';
      notifications.show({
        title: 'Authentication Failed',
        message: errorMsg,
        color: 'red'
      });
    }
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colorScheme === 'dark' ? '#0c1a30' : '#f1f5f9',
        padding: '20px'
      }}
    >
      <Container size="xs" style={{ width: '100%', maxWidth: '420px' }}>
        <Paper
          p="xl"
          radius="lg"
          withBorder
          style={{
            background: 'var(--glass-bg)',
            borderColor: 'var(--glass-border)',
            boxShadow: 'var(--glass-shadow)'
          }}
        >
          <Center style={{ flexDirection: 'column', marginBottom: '20px' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(0,119,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0077ff',
                marginBottom: '10px'
              }}
            >
              <IconStethoscope size={28} />
            </div>
            <Title order={2} style={{ fontFamily: 'var(--font-title)', fontSize: '22px' }}>
              Conference Administrator
            </Title>
            <Text size="xs" c="dimmed" style={{ marginTop: '2px' }}>
              Global Nursing Conference 2027 Portal
            </Text>
          </Center>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="sm">
              <TextInput
                label="Admin Email"
                placeholder="admin@con27.org"
                required
                error={errors.email?.message}
                {...register('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="••••••••"
                required
                error={errors.password?.message}
                {...register('password')}
              />

              <Button
                type="submit"
                loading={loginMutation.isPending}
                leftSection={<IconLock size={16} />}
                variant="filled"
                color="blue"
                fullWidth
                style={{ height: '45px', marginTop: '10px', fontWeight: 700 }}
              >
                Sign In to Dashboard
              </Button>
            </Stack>
          </form>

          <Group justify="center" style={{ marginTop: '20px' }}>
            <Button variant="transparent" size="xs" color="gray" onClick={() => navigate('/')}>
              ← Return to public website
            </Button>
          </Group>
        </Paper>
      </Container>
    </div>
  );
}
