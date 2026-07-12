import { useState, useRef } from 'react';
import { Card, Text, Button, Group, SimpleGrid, TextInput, Select, Textarea, Stack, Paper, Title, Box } from '@mantine/core';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import api from '../services/api';
import { IconCheck, IconCircleCheckFilled, IconBrandPaypal } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number must be at least 5 digits'),
  country: z.string().min(2, 'Country must be specified'),
  package: z.enum(['STUDENT', 'ONE_DAY', 'PLAN_A', 'PLAN_B']),
  paymentMethod: z.enum(['PAYPAL', 'STRIPE', 'BANK_TRANSFER']),
  comments: z.string().optional()
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function RegistrationForm() {
  const [selectedPackage, setSelectedPackage] = useState<'STUDENT' | 'ONE_DAY' | 'PLAN_A' | 'PLAN_B' | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      country: '',
      package: undefined,
      paymentMethod: 'PAYPAL',
      comments: ''
    }
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const response = await api.post('/registrations', data);
      return response.data;
    },
    onSuccess: (res) => {
      notifications.show({
        title: 'Registration Submitted',
        message: `Thank you! Your registration for package ${res.registration.package} has been received. Href sent to ${res.registration.email}.`,
        color: 'teal',
        icon: <IconCheck size={18} />
      });
      reset();
      setSelectedPackage(null);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Failed to submit registration';
      notifications.show({
        title: 'Registration Failed',
        message: errorMsg,
        color: 'red'
      });
    }
  });

  const handleSelectPackage = (pkg: 'STUDENT' | 'ONE_DAY' | 'PLAN_A' | 'PLAN_B') => {
    setSelectedPackage(pkg);
    setValue('package', pkg);
    
    // Smooth scroll to the form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const onSubmit = (data: RegistrationFormData) => {
    registrationMutation.mutate(data);
  };

  const packages = [
    {
      id: 'STUDENT',
      name: 'Student Registration',
      price: '$399',
      popular: false,
      features: [
        'Access to all technical sessions',
        'Conference abstract handbook',
        'Student workshop entry',
        'Participation certificate',
        'Networking tea & coffee breaks'
      ]
    },
    {
      id: 'ONE_DAY',
      name: 'One Day Registration',
      price: '$249',
      popular: false,
      features: [
        'Access to one day sessions',
        'Conference proceedings manual',
        'Networking tea & coffee breaks',
        'Lunch at conference venue (1 day)',
        'Participation certificate'
      ]
    },
    {
      id: 'PLAN_A',
      name: 'Package Plan A',
      price: '$999',
      popular: true,
      features: [
        '3 Nights of luxury accommodation',
        '2 Lunches at conference venue',
        'Access to all conference sessions',
        'Conference proceedings & abstracts booklet',
        'Participation certificate & rewards entry'
      ]
    },
    {
      id: 'PLAN_B',
      name: 'Package Plan B',
      price: '$849',
      popular: false,
      features: [
        '3 Nights of budget accommodation',
        '2 Lunches at conference venue',
        'Access to all conference sessions',
        'Conference proceedings & abstracts booklet',
        'Participation certificate'
      ]
    }
  ];

  return (
    <Stack gap="xl" style={{ width: '100%' }}>
      {/* Pricing Cards Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        {packages.map((pkg) => (
          <motion.div
            key={pkg.id}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Card
              shadow="md"
              padding="xl"
              radius="lg"
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: pkg.popular ? '2px solid var(--color-medical-blue)' : '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(8px)',
                position: 'relative'
              }}
            >
              {pkg.popular && (
                <Box
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'var(--color-medical-blue)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Popular Choice
                </Box>
              )}

              <Stack gap="xs" style={{ flexGrow: 1 }}>
                <Text fw={700} size="lg" style={{ fontFamily: 'var(--font-title)' }}>
                  {pkg.name}
                </Text>
                
                <Group align="flex-end" gap={4} style={{ margin: '10px 0' }}>
                  <Text style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-navy-blue)', lineHeight: 1 }}>
                    {pkg.price}
                  </Text>
                  <Text size="xs" c="dimmed" fw={600} style={{ paddingBottom: '4px' }}>
                    USD
                  </Text>
                </Group>

                <Stack gap="xs" style={{ marginTop: '10px' }}>
                  {pkg.features.map((feat, i) => (
                    <Group key={i} gap="xs" align="start">
                      <IconCircleCheckFilled size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <Text size="sm" c="dimmed" style={{ lineHeight: 1.4 }}>
                        {feat}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Stack>

              <Button
                onClick={() => handleSelectPackage(pkg.id as any)}
                variant={selectedPackage === pkg.id ? 'filled' : 'outline'}
                color={selectedPackage === pkg.id ? 'blue' : 'gray'}
                fullWidth
                style={{ marginTop: '24px', height: '42px', fontWeight: 700 }}
              >
                Select Package
              </Button>
            </Card>
          </motion.div>
        ))}
      </SimpleGrid>

      {/* Registration Details Form */}
      <AnimatePresence>
        {selectedPackage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            ref={formRef}
          >
            <Paper
              p={{ base: 'md', sm: 'xl' }}
              radius="lg"
              style={{
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                boxShadow: 'var(--glass-shadow)',
                maxWidth: '750px',
                margin: '30px auto 0 auto'
              }}
            >
              <Stack gap="md">
                <Box style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                  <Title order={3} style={{ fontFamily: 'var(--font-title)', fontSize: '20px' }}>
                    Delegate Registration Form
                  </Title>
                  <Text size="xs" c="dimmed">
                    Complete the details below to finalize your booking for the selected package.
                  </Text>
                </Box>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Stack gap="sm">
                    <Group grow>
                      <TextInput
                        label="Full Name"
                        placeholder="Dr. Alexander Rossi"
                        required
                        error={errors.name?.message}
                        {...register('name')}
                      />
                      
                      <TextInput
                        label="Country"
                        placeholder="Italy"
                        required
                        error={errors.country?.message}
                        {...register('country')}
                      />
                    </Group>

                    <Group grow>
                      <TextInput
                        label="Email Address"
                        placeholder="a.rossi@nursing-assoc.it"
                        required
                        type="email"
                        error={errors.email?.message}
                        {...register('email')}
                      />
                      
                      <TextInput
                        label="Phone Number"
                        placeholder="+39 06 987654"
                        required
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                    </Group>

                    <Group grow>
                      <Controller
                        name="package"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Selected Package Plan"
                            placeholder="Select package..."
                            data={[
                              { value: 'STUDENT', label: 'Student Registration - $399' },
                              { value: 'ONE_DAY', label: 'One Day Registration - $249' },
                              { value: 'PLAN_A', label: 'Package Plan A - $999' },
                              { value: 'PLAN_B', label: 'Package Plan B - $849' }
                            ]}
                            error={errors.package?.message}
                            required
                            {...field}
                            onChange={(val) => {
                              field.onChange(val);
                              if (val) setSelectedPackage(val as any);
                            }}
                          />
                        )}
                      />

                      <Controller
                        name="paymentMethod"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Preferred Payment Method"
                            placeholder="Select payment method..."
                            data={[
                              { value: 'PAYPAL', label: 'PayPal (surcharge applies)' },
                              { value: 'STRIPE', label: 'Stripe (Credit/Debit Card)' },
                              { value: 'BANK_TRANSFER', label: 'Offline Bank Transfer' }
                            ]}
                            error={errors.paymentMethod?.message}
                            required
                            {...field}
                          />
                        )}
                      />
                    </Group>

                    <Textarea
                      label="Additional Requirements / Dietary / Comments"
                      placeholder="Specify dietary requirements or group package booking comments..."
                      rows={3}
                      error={errors.comments?.message}
                      {...register('comments')}
                    />

                    <Group gap="xs" style={{ background: 'rgba(255, 145, 0, 0.08)', border: '1px dashed orange', padding: '12px', borderRadius: '8px', marginTop: '5px' }}>
                      <IconBrandPaypal size={22} color="orange" />
                      <Text size="xs" fw={600} color="orange.9">
                        * Note: A 2% transaction surcharge is applicable for PayPal payments. For group package discounts (more than 5 delegates), please contact our support team directly.
                      </Text>
                    </Group>

                    <Button
                      type="submit"
                      loading={registrationMutation.isPending}
                      variant="gradient"
                      gradient={{ from: 'medical.5', to: 'emerald.5' }}
                      fullWidth
                      style={{ height: '48px', marginTop: '15px', fontWeight: 700, fontSize: '15px' }}
                    >
                      Proceed to Payment & Register
                    </Button>
                  </Stack>
                </form>
              </Stack>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
}
