import { useState, useRef, useEffect } from 'react';
import { Card, Text, Button, Group, SimpleGrid, TextInput, Select, Textarea, Stack, Paper, Title, Box, useMantineColorScheme, SegmentedControl } from '@mantine/core';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { db } from '../services/db';
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
  const { colorScheme } = useMantineColorScheme();
  const [selectedPackage, setSelectedPackage] = useState<'STUDENT' | 'ONE_DAY' | 'PLAN_A' | 'PLAN_B' | null>(null);
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const formRef = useRef<HTMLDivElement | null>(null);

  // CAPTCHA spam protection state variables
  const [captchaNum1, setCaptchaNum1] = useState<number>(0);
  const [captchaNum2, setCaptchaNum2] = useState<number>(0);
  const [captchaAnswer, setCaptchaAnswer] = useState<string>('');
  const [captchaError, setCaptchaError] = useState<string>('');

  const generateCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 9) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 9) + 1);
    setCaptchaAnswer('');
    setCaptchaError('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

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
      let amount = 0;
      if (data.package === 'STUDENT') amount = currency === 'USD' ? 399 : 369;
      else if (data.package === 'ONE_DAY') amount = currency === 'USD' ? 449 : 229;
      else if (data.package === 'PLAN_A') amount = currency === 'USD' ? 999 : 929;
      else if (data.package === 'PLAN_B') amount = currency === 'USD' ? 849 : 789;

      if (data.paymentMethod === 'PAYPAL') {
        amount = Number((amount * 1.02).toFixed(2));
      }

      const newRegistration = {
        id: crypto.randomUUID(),
        ...data,
        amount,
        currency,
        status: 'PENDING' as const,
        createdAt: new Date().toISOString()
      };

      await db.registrations.add(newRegistration);
      return newRegistration;
    },
    onSuccess: (res) => {
      notifications.show({
        title: 'Registration Submitted',
        message: `Thank you! Your registration for package ${res.package} has been received. Access details sent to ${res.email}.`,
        color: 'teal',
        icon: <IconCheck size={18} />
      });
      reset();
      setSelectedPackage(null);
      generateCaptcha();
    },
    onError: () => {
      notifications.show({
        title: 'Registration Failed',
        message: 'Failed to save registration locally.',
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
    const correctAnswer = captchaNum1 + captchaNum2;
    if (parseInt(captchaAnswer) !== correctAnswer) {
      setCaptchaError('Incorrect captcha answer. Please try again.');
      return;
    }
    registrationMutation.mutate(data);
  };

  const packages = [
    {
      id: 'STUDENT',
      name: 'Student Registration',
      price: currency === 'USD' ? '$399' : '€369',
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
      price: currency === 'USD' ? '$449' : '€389',
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
      price: currency === 'USD' ? '$999' : '€929',
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
      price: currency === 'USD' ? '$849' : '€789',
      popular: false,
      features: [
        '2 Nights of budget accommodation',
        '2 Lunches at conference venue',
        'Access to all conference sessions',
        'Conference proceedings & abstracts booklet',
        'Participation certificate'
      ]
    }
  ];

  return (
    <Stack gap="xl" style={{ width: '100%' }}>
      {/* Currency Switcher */}
      <Group justify="center" gap="sm" style={{ marginBottom: '10px' }}>
        <Text fw={600} size="sm" c="dimmed">
          Select Currency:
        </Text>
        <SegmentedControl
          value={currency}
          onChange={(val) => setCurrency(val as 'USD' | 'EUR')}
          data={[
            { label: 'USD ($)', value: 'USD' },
            { label: 'EUR (€)', value: 'EUR' }
          ]}
          color="medical.5"
          radius="xl"
          size="sm"
          style={{
            boxShadow: 'var(--glass-shadow)',
            border: '1px solid var(--glass-border)'
          }}
        />
      </Group>

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
                border: selectedPackage === pkg.id
                  ? '2px solid #10b981'
                  : (pkg.popular ? '2px solid var(--color-medical-blue)' : '1px solid var(--glass-border)'),
                boxShadow: selectedPackage === pkg.id
                  ? '0 0 15px rgba(16, 185, 129, 0.25)'
                  : 'var(--glass-shadow)',
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
                  <Text style={{ fontSize: '2.25rem', fontWeight: 800, color: colorScheme === 'dark' ? '#ffffff' : 'var(--color-navy-blue)', lineHeight: 1 }}>
                    {pkg.price}
                  </Text>
                  <Text size="xs" c="dimmed" fw={600} style={{ paddingBottom: '4px' }}>
                    {currency}
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
                className={`select-package-btn ${selectedPackage === pkg.id ? 'selected' : ''}`}
                fullWidth
                style={{
                  marginTop: '24px',
                  height: '42px',
                  fontWeight: 700
                }}
              >
                {selectedPackage === pkg.id ? 'Selected ✓' : 'Select Package'}
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
                    Registration Form
                  </Title>
                  <Text size="xs" c="dimmed">
                    Complete the details below to finalize your booking for the selected package.
                  </Text>
                </Box>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Stack gap="sm">
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
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
                    </SimpleGrid>

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
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
                    </SimpleGrid>

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <Controller
                        name="package"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Selected Package Plan"
                            placeholder="Select package..."
                            data={[
                              { value: 'STUDENT', label: `Student Registration - ${currency === 'USD' ? '$399' : '€369'}` },
                              { value: 'ONE_DAY', label: `One Day Registration - ${currency === 'USD' ? '$449' : '€389'}` },
                              { value: 'PLAN_A', label: `Package Plan A - ${currency === 'USD' ? '$999' : '€929'}` },
                              { value: 'PLAN_B', label: `Package Plan B - ${currency === 'USD' ? '$849' : '€789'}` }
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
                    </SimpleGrid>

                    <Textarea
                      label="Additional Requirements / Dietary / Comments"
                      placeholder="Specify dietary requirements or group package booking comments..."
                      rows={3}
                      error={errors.comments?.message}
                      {...register('comments')}
                    />

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" style={{ marginTop: '10px', alignItems: 'flex-end' }}>
                      <TextInput
                        label={`Spam Protection: What is ${captchaNum1} + ${captchaNum2}?`}
                        placeholder="Enter sum..."
                        required
                        value={captchaAnswer}
                        onChange={(e) => {
                          setCaptchaAnswer(e.target.value);
                          setCaptchaError('');
                        }}
                        error={captchaError}
                      />
                      <Button
                        variant="subtle"
                        color="blue"
                        size="sm"
                        onClick={generateCaptcha}
                        style={{ width: 'fit-content', height: '36px', marginBottom: '4px' }}
                      >
                        Refresh Captcha
                      </Button>
                    </SimpleGrid>

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
