import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Tabs, Table, Card, Text, Title, Group, Button, Badge, TextInput, Select, Modal, Textarea,
  ActionIcon, SimpleGrid, Stack, Box, Space, Menu
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  IconUsers, IconFileText, IconDownload, IconMessage, IconBuildingBank, IconTrash, IconEdit, IconPlus,
  IconSearch, IconCheck, IconX, IconLogout, IconStethoscope, IconFileExcel, IconRefresh
} from '@tabler/icons-react';
import api from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('analytics');

  // Search & Filter States
  const [regSearch, setRegSearch] = useState('');
  const [regStatus, setRegStatus] = useState('');
  const [regPackage, setRegPackage] = useState('');
  
  const [abstractSearch, setAbstractSearch] = useState('');
  const [abstractStatus, setAbstractStatus] = useState('');

  // Speaker Modal States
  const [speakerModalOpened, { open: openSpeakerModal, close: closeSpeakerModal }] = useDisclosure(false);
  const [editingSpeaker, setEditingSpeaker] = useState<any>(null);

  // Agenda Modal States
  const [agendaModalOpened, { open: openAgendaModal, close: closeAgendaModal }] = useDisclosure(false);
  const [editingAgenda, setEditingAgenda] = useState<any>(null);

  // FAQ Modal States
  const [faqModalOpened, { open: openFAQModal, close: closeFAQModal }] = useDisclosure(false);
  const [editingFAQ, setEditingFAQ] = useState<any>(null);

  // Verify Admin Authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    notifications.show({
      title: 'Logged Out',
      message: 'You have been signed out of the admin panel.',
      color: 'blue'
    });
    navigate('/admin/login');
  };

  // --- QUERY FETCHERS ---
  const { data: analytics, refetch: refetchAnalytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics');
      return response.data;
    }
  });

  const { data: registrationsData, refetch: refetchRegistrations } = useQuery({
    queryKey: ['admin-registrations', regSearch, regStatus, regPackage],
    queryFn: async () => {
      const response = await api.get('/registrations', {
        params: { search: regSearch, status: regStatus, package: regPackage, limit: 100 }
      });
      return response.data;
    }
  });

  const { data: abstractsData, refetch: refetchAbstracts } = useQuery({
    queryKey: ['admin-abstracts', abstractSearch, abstractStatus],
    queryFn: async () => {
      const response = await api.get('/abstracts', {
        params: { search: abstractSearch, status: abstractStatus, limit: 100 }
      });
      return response.data;
    }
  });

  const { data: brochureDownloads, refetch: refetchBrochures } = useQuery({
    queryKey: ['admin-brochures'],
    queryFn: async () => {
      const response = await api.get('/brochure', { params: { limit: 100 } });
      return response.data;
    }
  });

  const { data: contactMessages, refetch: refetchMessages } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const response = await api.get('/contact', { params: { limit: 100 } });
      return response.data;
    }
  });

  const { data: speakers = [], refetch: refetchSpeakers } = useQuery({
    queryKey: ['admin-speakers'],
    queryFn: async () => {
      const response = await api.get('/content/speakers');
      return response.data;
    }
  });

  const { data: agenda = [], refetch: refetchAgenda } = useQuery({
    queryKey: ['admin-agenda'],
    queryFn: async () => {
      const response = await api.get('/content/agenda');
      return response.data;
    }
  });

  const { data: faqs = [], refetch: refetchFAQs } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => {
      const response = await api.get('/content/faqs');
      return response.data;
    }
  });

  // --- MUTATIONS ---
  // Registration Status Modifier
  const updateRegStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.patch(`/registrations/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Registration status updated', color: 'teal' });
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    }
  });

  // Abstract Status Modifier
  const updateAbstractStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.patch(`/abstracts/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Abstract status updated', color: 'teal' });
      queryClient.invalidateQueries({ queryKey: ['admin-abstracts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    }
  });

  // Contact Status Modifier
  const updateMessageStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.patch(`/contact/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Message status updated', color: 'teal' });
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
    }
  });

  // Speaker CRUD Mutations
  const saveSpeakerMutation = useMutation({
    mutationFn: async (speakerData: any) => {
      if (editingSpeaker?.id) {
        return api.put(`/content/speakers/${editingSpeaker.id}`, speakerData);
      } else {
        return api.post('/content/speakers', speakerData);
      }
    },
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Speaker saved successfully', color: 'teal' });
      closeSpeakerModal();
      setEditingSpeaker(null);
      queryClient.invalidateQueries({ queryKey: ['admin-speakers'] });
    }
  });

  const deleteSpeakerMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/content/speakers/${id}`);
    },
    onSuccess: () => {
      notifications.show({ title: 'Deleted', message: 'Speaker removed', color: 'blue' });
      queryClient.invalidateQueries({ queryKey: ['admin-speakers'] });
    }
  });

  // Agenda CRUD Mutations
  const saveAgendaMutation = useMutation({
    mutationFn: async (agendaData: any) => {
      if (editingAgenda?.id) {
        return api.put(`/content/agenda/${editingAgenda.id}`, agendaData);
      } else {
        return api.post('/content/agenda', agendaData);
      }
    },
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Agenda saved successfully', color: 'teal' });
      closeAgendaModal();
      setEditingAgenda(null);
      queryClient.invalidateQueries({ queryKey: ['admin-agenda'] });
    }
  });

  const deleteAgendaMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/content/agenda/${id}`);
    },
    onSuccess: () => {
      notifications.show({ title: 'Deleted', message: 'Agenda item removed', color: 'blue' });
      queryClient.invalidateQueries({ queryKey: ['admin-agenda'] });
    }
  });

  // FAQ CRUD Mutations
  const saveFAQMutation = useMutation({
    mutationFn: async (faqData: any) => {
      if (editingFAQ?.id) {
        return api.put(`/content/faqs/${editingFAQ.id}`, faqData);
      } else {
        return api.post('/content/faqs', faqData);
      }
    },
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'FAQ saved successfully', color: 'teal' });
      closeFAQModal();
      setEditingFAQ(null);
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
    }
  });

  const deleteFAQMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/content/faqs/${id}`);
    },
    onSuccess: () => {
      notifications.show({ title: 'Deleted', message: 'FAQ removed', color: 'blue' });
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
    }
  });

  // --- REPORT DOWNLOAD TRIGGERS ---
  const triggerExport = (endpoint: string, filename: string) => {
    const token = localStorage.getItem('token');
    const url = `/api/admin/export/${endpoint}`;
    
    // Download using standard fetch with auth headers
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(() => {
        notifications.show({ title: 'Export Error', message: 'Failed to compile report exports', color: 'red' });
      });
  };

  const triggerAbstractFileDownload = (id: string, originalName: string) => {
    const token = localStorage.getItem('token');
    const url = `/api/abstracts/download/${id}`;
    
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('File not found');
        return res.blob();
      })
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(() => {
        notifications.show({ title: 'File Error', message: 'Abstract file could not be fetched from storage', color: 'red' });
      });
  };

  const triggerRefresh = () => {
    refetchAnalytics();
    refetchRegistrations();
    refetchAbstracts();
    refetchBrochures();
    refetchMessages();
    refetchSpeakers();
    refetchAgenda();
    refetchFAQs();
    notifications.show({ title: 'Refreshed', message: 'Dashboard state synchronized with DB.', color: 'blue' });
  };

  // --- MODAL HANDLERS ---
  const handleOpenSpeakerEdit = (sp: any = null) => {
    setEditingSpeaker(sp);
    openSpeakerModal();
  };

  const handleOpenAgendaEdit = (ag: any = null) => {
    setEditingAgenda(ag);
    openAgendaModal();
  };

  const handleOpenFAQEdit = (fq: any = null) => {
    setEditingFAQ(fq);
    openFAQModal();
  };

  const handleSpeakerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    saveSpeakerMutation.mutate(data);
  };

  const handleAgendaSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    saveAgendaMutation.mutate(data);
  };

  const handleFAQSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    saveFAQMutation.mutate(data);
  };

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : { name: 'Admin' };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '50px' }}>
      
      {/* Header bar */}
      <Box style={{ background: '#0c1a30', color: '#fff', padding: '15px 0', borderBottom: '3px solid #0077ff' }}>
        <Container size="xl">
          <Group justify="space-between">
            <Group gap="xs">
              <IconStethoscope size={28} color="#0077ff" />
              <Title order={3} style={{ fontFamily: 'var(--font-title)', fontSize: '20px' }}>
                GNC 2027 Admin Console
              </Title>
            </Group>
            
            <Group gap="md">
              <Text size="sm" fw={500} c="rgba(255,255,255,0.7)">
                Signed in as: <b>{user.name}</b>
              </Text>
              
              <ActionIcon onClick={triggerRefresh} variant="light" color="blue" size="lg" radius="md">
                <IconRefresh size={18} />
              </ActionIcon>
              
              <Button onClick={handleLogout} variant="light" color="red" leftSection={<IconLogout size={16} />} size="xs">
                Log Out
              </Button>
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Main Dashboard panels */}
      <Container size="xl" style={{ marginTop: '30px' }}>
        <Tabs value={activeTab} onChange={(val) => setActiveTab(val || 'analytics')}>
          <Tabs.List style={{ marginBottom: '20px' }}>
            <Tabs.Tab value="analytics" leftSection={<IconStethoscope size={16} />}>Analytics</Tabs.Tab>
            <Tabs.Tab value="registrations" leftSection={<IconUsers size={16} />}>Registrations</Tabs.Tab>
            <Tabs.Tab value="abstracts" leftSection={<IconFileText size={16} />}>Abstracts</Tabs.Tab>
            <Tabs.Tab value="brochure" leftSection={<IconDownload size={16} />}>Brochure Leads</Tabs.Tab>
            <Tabs.Tab value="messages" leftSection={<IconMessage size={16} />}>Messages</Tabs.Tab>
            <Tabs.Tab value="speakers" leftSection={<IconUsers size={16} />}>Speakers Editor</Tabs.Tab>
            <Tabs.Tab value="agenda" leftSection={<IconFileText size={16} />}>Agenda Editor</Tabs.Tab>
            <Tabs.Tab value="faqs" leftSection={<IconMessage size={16} />}>FAQ Editor</Tabs.Tab>
          </Tabs.List>

          {/* TAB: ANALYTICS */}
          <Tabs.Panel value="analytics">
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="lg">
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Group justify="space-between" align="center">
                  <Text size="xs" c="dimmed" fw={700}>TOTAL REGISTRATIONS</Text>
                  <IconUsers size={22} color="#0077ff" />
                </Group>
                <Text style={{ fontSize: '2rem', fontWeight: 800, marginTop: '10px' }}>
                  {analytics?.totals?.registrations || 0}
                </Text>
                <Text size="xs" c="dimmed" style={{ marginTop: '5px' }}>
                  {analytics?.totals?.pendingRegistrationsCount || 0} pending payments
                </Text>
              </Card>

              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Group justify="space-between" align="center">
                  <Text size="xs" c="dimmed" fw={700}>ESTIMATED REVENUE</Text>
                  <IconBuildingBank size={22} color="#10b981" />
                </Group>
                <Text style={{ fontSize: '2rem', fontWeight: 800, marginTop: '10px' }} c="emerald.6">
                  ${analytics?.totals?.revenue || 0}
                </Text>
                <Text size="xs" c="dimmed" style={{ marginTop: '5px' }}>
                  Paid registrations only
                </Text>
              </Card>

              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Group justify="space-between" align="center">
                  <Text size="xs" c="dimmed" fw={700}>ABSTRACT PAPERS</Text>
                  <IconFileText size={22} color="violet" />
                </Group>
                <Text style={{ fontSize: '2rem', fontWeight: 800, marginTop: '10px' }}>
                  {analytics?.totals?.abstracts || 0}
                </Text>
                <Text size="xs" c="dimmed" style={{ marginTop: '5px' }}>
                  For peer review
                </Text>
              </Card>

              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Group justify="space-between" align="center">
                  <Text size="xs" c="dimmed" fw={700}>BROCHURE LEADS</Text>
                  <IconDownload size={22} color="orange" />
                </Group>
                <Text style={{ fontSize: '2rem', fontWeight: 800, marginTop: '10px' }}>
                  {analytics?.totals?.brochureDownloads || 0}
                </Text>
                <Text size="xs" c="dimmed" style={{ marginTop: '5px' }}>
                  Marketing leads captured
                </Text>
              </Card>

              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Group justify="space-between" align="center">
                  <Text size="xs" c="dimmed" fw={700}>INQUIRY MESSAGES</Text>
                  <IconMessage size={22} color="gray" />
                </Group>
                <Text style={{ fontSize: '2rem', fontWeight: 800, marginTop: '10px' }}>
                  {analytics?.totals?.contactMessages || 0}
                </Text>
                <Text size="xs" c="dimmed" style={{ marginTop: '5px' }}>
                  From customer contact form
                </Text>
              </Card>
            </SimpleGrid>

            <Space h="xl" />

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              {/* Package distribution chart or list */}
              <Card shadow="sm" p="xl" radius="md" withBorder>
                <Title order={3} style={{ fontFamily: 'var(--font-title)', fontSize: '18px', marginBottom: '20px' }}>
                  Package Plan Breakdowns
                </Title>
                <Stack gap="sm">
                  {analytics?.packages?.map((p: any) => (
                    <Group key={p.package} justify="space-between" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <div>
                        <Text fw={600} size="sm">{p.package}</Text>
                        <Text size="xs" c="dimmed">{p.count} registrations booked</Text>
                      </div>
                      <Badge size="lg" color="blue">${p.revenue}</Badge>
                    </Group>
                  )) || <Text c="dimmed">No data available</Text>}
                </Stack>
              </Card>

              {/* Abstracts review overview */}
              <Card shadow="sm" p="xl" radius="md" withBorder>
                <Title order={3} style={{ fontFamily: 'var(--font-title)', fontSize: '18px', marginBottom: '20px' }}>
                  Abstract Peer Review Statuses
                </Title>
                <Stack gap="sm">
                  {analytics?.abstracts?.map((a: any) => (
                    <Group key={a.status} justify="space-between" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <Text fw={600} size="sm">{a.status}</Text>
                      <Badge size="lg" color="violet">{a.count} papers</Badge>
                    </Group>
                  )) || <Text c="dimmed">No data available</Text>}
                </Stack>
              </Card>
            </SimpleGrid>
          </Tabs.Panel>

          {/* TAB: REGISTRATIONS */}
          <Tabs.Panel value="registrations">
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Group justify="space-between" style={{ marginBottom: '20px' }}>
                <Group gap="xs" style={{ flexGrow: 1, maxWidth: '600px' }}>
                  <TextInput
                    placeholder="Search registrations name, email..."
                    value={regSearch}
                    onChange={(e) => setRegSearch(e.target.value)}
                    leftSection={<IconSearch size={16} />}
                    style={{ flexGrow: 1 }}
                  />
                  <Select
                    placeholder="Status"
                    data={['PENDING', 'PAID', 'CANCELLED']}
                    value={regStatus}
                    onChange={(val) => setRegStatus(val || '')}
                    clearable
                    style={{ width: '120px' }}
                  />
                  <Select
                    placeholder="Package"
                    data={['STUDENT', 'ONE_DAY', 'PLAN_A', 'PLAN_B']}
                    value={regPackage}
                    onChange={(val) => setRegPackage(val || '')}
                    clearable
                    style={{ width: '130px' }}
                  />
                </Group>

                <Group gap="xs">
                  <Button
                    onClick={() => triggerExport('registrations/excel', 'gnc2027_registrations.xlsx')}
                    color="green"
                    variant="light"
                    leftSection={<IconFileExcel size={16} />}
                  >
                    Export Excel
                  </Button>
                  <Button
                    onClick={() => triggerExport('registrations/pdf', 'gnc2027_registrations.pdf')}
                    color="red"
                    variant="light"
                    leftSection={<IconFileText size={16} />}
                  >
                    Export PDF
                  </Button>
                </Group>
              </Group>

              <div style={{ overflowX: 'auto' }}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Phone</Table.Th>
                      <Table.Th>Country</Table.Th>
                      <Table.Th>Package</Table.Th>
                      <Table.Th>Amount</Table.Th>
                      <Table.Th>Method</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {registrationsData?.items?.map((r: any) => (
                      <Table.Tr key={r.id}>
                        <Table.Td fw={600}>{r.name}</Table.Td>
                        <Table.Td>{r.email}</Table.Td>
                        <Table.Td>{r.phone}</Table.Td>
                        <Table.Td>{r.country}</Table.Td>
                        <Table.Td><Badge variant="light" color="blue">{r.package}</Badge></Table.Td>
                        <Table.Td fw={700}>${r.amount}</Table.Td>
                        <Table.Td>{r.paymentMethod}</Table.Td>
                        <Table.Td>
                          <Badge color={r.status === 'PAID' ? 'teal' : r.status === 'PENDING' ? 'orange' : 'red'}>
                            {r.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Menu shadow="md" width={150}>
                            <Menu.Target>
                              <Button size="xs" variant="light">Actions</Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item onClick={() => updateRegStatusMutation.mutate({ id: r.id, status: 'PAID' })} leftSection={<IconCheck size={14} color="green" />}>Mark Paid</Menu.Item>
                              <Menu.Item onClick={() => updateRegStatusMutation.mutate({ id: r.id, status: 'PENDING' })} leftSection={<IconRefresh size={14} color="orange" />}>Mark Pending</Menu.Item>
                              <Menu.Item onClick={() => updateRegStatusMutation.mutate({ id: r.id, status: 'CANCELLED' })} leftSection={<IconX size={14} color="red" />}>Cancel</Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                    {(!registrationsData?.items || registrationsData.items.length === 0) && (
                      <Table.Tr>
                        <Table.Td colSpan={9} style={{ textAlign: 'center' }}>No registrations found</Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </div>
            </Card>
          </Tabs.Panel>

          {/* TAB: ABSTRACTS */}
          <Tabs.Panel value="abstracts">
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Group justify="space-between" style={{ marginBottom: '20px' }}>
                <Group gap="xs" style={{ flexGrow: 1, maxWidth: '500px' }}>
                  <TextInput
                    placeholder="Search abstracts paper title, researcher..."
                    value={abstractSearch}
                    onChange={(e) => setAbstractSearch(e.target.value)}
                    leftSection={<IconSearch size={16} />}
                    style={{ flexGrow: 1 }}
                  />
                  <Select
                    placeholder="Status"
                    data={['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED']}
                    value={abstractStatus}
                    onChange={(val) => setAbstractStatus(val || '')}
                    clearable
                    style={{ width: '150px' }}
                  />
                </Group>

                <Group gap="xs">
                  <Button
                    onClick={() => triggerExport('abstracts/excel', 'gnc2027_abstracts.xlsx')}
                    color="green"
                    variant="light"
                    leftSection={<IconFileExcel size={16} />}
                  >
                    Export Excel
                  </Button>
                  <Button
                    onClick={() => triggerExport('abstracts/pdf', 'gnc2027_abstracts.pdf')}
                    color="red"
                    variant="light"
                    leftSection={<IconFileText size={16} />}
                  >
                    Export PDF
                  </Button>
                </Group>
              </Group>

              <div style={{ overflowX: 'auto' }}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Prefix</Table.Th>
                      <Table.Th>Researcher</Table.Th>
                      <Table.Th>Country</Table.Th>
                      <Table.Th>Profession</Table.Th>
                      <Table.Th>Paper Title</Table.Th>
                      <Table.Th>File</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {abstractsData?.items?.map((a: any) => (
                      <Table.Tr key={a.id}>
                        <Table.Td>{a.prefix}</Table.Td>
                        <Table.Td fw={600}>{a.name}</Table.Td>
                        <Table.Td>{a.country}</Table.Td>
                        <Table.Td>{a.profession}</Table.Td>
                        <Table.Td style={{ maxWidth: '300px' }}>
                          <Text size="sm" truncate="end" title={a.title}>
                            {a.title}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Button
                            onClick={() => triggerAbstractFileDownload(a.id, a.fileName)}
                            variant="subtle"
                            size="xs"
                            leftSection={<IconDownload size={14} />}
                            style={{ height: 'auto', padding: 0 }}
                          >
                            Download
                          </Button>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={a.status === 'ACCEPTED' ? 'teal' : a.status === 'PENDING' ? 'orange' : a.status === 'UNDER_REVIEW' ? 'blue' : 'red'}>
                            {a.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Menu shadow="md" width={150}>
                            <Menu.Target>
                              <Button size="xs" variant="light">Review</Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item onClick={() => updateAbstractStatusMutation.mutate({ id: a.id, status: 'ACCEPTED' })} leftSection={<IconCheck size={14} color="green" />}>Accept Paper</Menu.Item>
                              <Menu.Item onClick={() => updateAbstractStatusMutation.mutate({ id: a.id, status: 'UNDER_REVIEW' })} leftSection={<IconRefresh size={14} color="blue" />}>Set Reviewing</Menu.Item>
                              <Menu.Item onClick={() => updateAbstractStatusMutation.mutate({ id: a.id, status: 'REJECTED' })} leftSection={<IconX size={14} color="red" />}>Reject Paper</Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                    {(!abstractsData?.items || abstractsData.items.length === 0) && (
                      <Table.Tr>
                        <Table.Td colSpan={8} style={{ textAlign: 'center' }}>No abstract submissions found</Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </div>
            </Card>
          </Tabs.Panel>

          {/* TAB: BROCHURE LEADS */}
          <Tabs.Panel value="brochure">
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <div style={{ overflowX: 'auto' }}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Phone</Table.Th>
                      <Table.Th>Country</Table.Th>
                      <Table.Th>Queries</Table.Th>
                      <Table.Th>Requested At</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {brochureDownloads?.items?.map((b: any) => (
                      <Table.Tr key={b.id}>
                        <Table.Td fw={600}>{b.name}</Table.Td>
                        <Table.Td>{b.email}</Table.Td>
                        <Table.Td>{b.phone}</Table.Td>
                        <Table.Td>{b.country}</Table.Td>
                        <Table.Td style={{ maxWidth: '250px' }}>
                          <Text size="xs" truncate="end" title={b.query}>{b.query || '-'}</Text>
                        </Table.Td>
                        <Table.Td>{new Date(b.createdAt).toLocaleDateString()}</Table.Td>
                      </Table.Tr>
                    ))}
                    {(!brochureDownloads?.items || brochureDownloads.items.length === 0) && (
                      <Table.Tr>
                        <Table.Td colSpan={6} style={{ textAlign: 'center' }}>No leads found</Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </div>
            </Card>
          </Tabs.Panel>

          {/* TAB: CONTACT MESSAGES */}
          <Tabs.Panel value="messages">
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <div style={{ overflowX: 'auto' }}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Phone</Table.Th>
                      <Table.Th>Subject</Table.Th>
                      <Table.Th>Message</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {contactMessages?.items?.map((m: any) => (
                      <Table.Tr key={m.id}>
                        <Table.Td fw={600}>{m.name}</Table.Td>
                        <Table.Td>{m.email}</Table.Td>
                        <Table.Td>{m.phone || '-'}</Table.Td>
                        <Table.Td fw={500}>{m.subject || '-'}</Table.Td>
                        <Table.Td style={{ maxWidth: '300px' }}>
                          <Text size="xs" title={m.message}>{m.message}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={m.status === 'NEW' ? 'red' : m.status === 'READ' ? 'blue' : 'gray'}>
                            {m.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            {m.status === 'NEW' && (
                              <Button
                                size="xs"
                                variant="light"
                                color="teal"
                                onClick={() => updateMessageStatusMutation.mutate({ id: m.id, status: 'READ' })}
                              >
                                Mark Read
                              </Button>
                            )}
                            {m.status === 'READ' && (
                              <Button
                                size="xs"
                                variant="light"
                                color="gray"
                                onClick={() => updateMessageStatusMutation.mutate({ id: m.id, status: 'ARCHIVED' })}
                              >
                                Archive
                              </Button>
                            )}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                    {(!contactMessages?.items || contactMessages.items.length === 0) && (
                      <Table.Tr>
                        <Table.Td colSpan={7} style={{ textAlign: 'center' }}>No messages received</Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </div>
            </Card>
          </Tabs.Panel>

          {/* TAB: SPEAKERS EDITOR */}
          <Tabs.Panel value="speakers">
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Group justify="space-between" style={{ marginBottom: '20px' }}>
                <Title order={4} style={{ fontFamily: 'var(--font-title)' }}>Speaker Profiles</Title>
                <Button onClick={() => handleOpenSpeakerEdit()} variant="filled" color="blue" leftSection={<IconPlus size={16} />}>
                  Add Speaker
                </Button>
              </Group>

              <div style={{ overflowX: 'auto' }}>
                <Table striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Designation</Table.Th>
                      <Table.Th>Organization</Table.Th>
                      <Table.Th>Country</Table.Th>
                      <Table.Th>Sort Order</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {speakers.map((sp: any) => (
                      <Table.Tr key={sp.id}>
                        <Table.Td fw={600}>{sp.name}</Table.Td>
                        <Table.Td>{sp.designation}</Table.Td>
                        <Table.Td>{sp.organization}</Table.Td>
                        <Table.Td>{sp.country}</Table.Td>
                        <Table.Td>{sp.order}</Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon onClick={() => handleOpenSpeakerEdit(sp)} variant="light" color="blue">
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon onClick={() => { if(confirm('Delete speaker?')) deleteSpeakerMutation.mutate(sp.id); }} variant="light" color="red">
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            </Card>
          </Tabs.Panel>

          {/* TAB: AGENDA EDITOR */}
          <Tabs.Panel value="agenda">
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Group justify="space-between" style={{ marginBottom: '20px' }}>
                <Title order={4} style={{ fontFamily: 'var(--font-title)' }}>Agenda Timeline Events</Title>
                <Button onClick={() => handleOpenAgendaEdit()} variant="filled" color="blue" leftSection={<IconPlus size={16} />}>
                  Add Agenda Item
                </Button>
              </Group>

              <div style={{ overflowX: 'auto' }}>
                <Table striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Day</Table.Th>
                      <Table.Th>Time Slot</Table.Th>
                      <Table.Th>Title</Table.Th>
                      <Table.Th>Speaker</Table.Th>
                      <Table.Th>Room/Location</Table.Th>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Sort Order</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {agenda.map((ag: any) => (
                      <Table.Tr key={ag.id}>
                        <Table.Td fw={700}>Day {ag.day}</Table.Td>
                        <Table.Td>{ag.timeSlot}</Table.Td>
                        <Table.Td fw={500}>{ag.title}</Table.Td>
                        <Table.Td>{ag.speakerName || '-'}</Table.Td>
                        <Table.Td>{ag.location || '-'}</Table.Td>
                        <Table.Td><Badge size="xs" variant="light">{ag.type}</Badge></Table.Td>
                        <Table.Td>{ag.order}</Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon onClick={() => handleOpenAgendaEdit(ag)} variant="light" color="blue">
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon onClick={() => { if(confirm('Delete agenda session?')) deleteAgendaMutation.mutate(ag.id); }} variant="light" color="red">
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            </Card>
          </Tabs.Panel>

          {/* TAB: FAQs EDITOR */}
          <Tabs.Panel value="faqs">
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Group justify="space-between" style={{ marginBottom: '20px' }}>
                <Title order={4} style={{ fontFamily: 'var(--font-title)' }}>Frequently Asked Questions</Title>
                <Button onClick={() => handleOpenFAQEdit()} variant="filled" color="blue" leftSection={<IconPlus size={16} />}>
                  Add FAQ
                </Button>
              </Group>

              <div style={{ overflowX: 'auto' }}>
                <Table striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: '40%' }}>Question</Table.Th>
                      <Table.Th style={{ width: '40%' }}>Answer</Table.Th>
                      <Table.Th>Sort Order</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {faqs.map((fq: any) => (
                      <Table.Tr key={fq.id}>
                        <Table.Td fw={600}>{fq.question}</Table.Td>
                        <Table.Td style={{ maxWidth: '250px' }}>
                          <Text size="xs" truncate="end" title={fq.answer}>{fq.answer}</Text>
                        </Table.Td>
                        <Table.Td>{fq.order}</Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon onClick={() => handleOpenFAQEdit(fq)} variant="light" color="blue">
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon onClick={() => { if(confirm('Delete FAQ?')) deleteFAQMutation.mutate(fq.id); }} variant="light" color="red">
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Container>

      {/* --- SPEAKER EDIT MODAL --- */}
      <Modal
        opened={speakerModalOpened}
        onClose={closeSpeakerModal}
        title={editingSpeaker ? 'Edit Speaker' : 'Add Speaker'}
        size="md"
      >
        <form onSubmit={handleSpeakerSubmit}>
          <Stack gap="sm">
            <TextInput label="Speaker Name" name="name" defaultValue={editingSpeaker?.name || ''} required />
            <TextInput label="Designation" name="designation" defaultValue={editingSpeaker?.designation || ''} required />
            <TextInput label="Organization" name="organization" defaultValue={editingSpeaker?.organization || ''} required />
            <TextInput label="Country" name="country" defaultValue={editingSpeaker?.country || ''} required />
            <TextInput label="Image URL (Unsplash or direct)" name="imagePath" defaultValue={editingSpeaker?.imagePath || ''} />
            <Textarea label="Biography" name="bio" defaultValue={editingSpeaker?.bio || ''} rows={3} />
            <TextInput label="Twitter URL" name="twitter" defaultValue={editingSpeaker?.twitter || ''} />
            <TextInput label="LinkedIn URL" name="linkedin" defaultValue={editingSpeaker?.linkedin || ''} />
            <TextInput label="Sort Order" name="order" type="number" defaultValue={editingSpeaker?.order || 0} />
            
            <Button type="submit" loading={saveSpeakerMutation.isPending} variant="filled" color="blue" fullWidth>
              Save Speaker
            </Button>
          </Stack>
        </form>
      </Modal>

      {/* --- AGENDA EDIT MODAL --- */}
      <Modal
        opened={agendaModalOpened}
        onClose={closeAgendaModal}
        title={editingAgenda ? 'Edit Agenda Item' : 'Add Agenda Item'}
        size="md"
      >
        <form onSubmit={handleAgendaSubmit}>
          <Stack gap="sm">
            <Select
              label="Conference Day"
              name="day"
              data={[
                { value: '1', label: 'Day 1 (May 13, 2027)' },
                { value: '2', label: 'Day 2 (May 14, 2027)' }
              ]}
              defaultValue={editingAgenda?.day?.toString() || '1'}
              required
            />
            <TextInput label="Time Slot" name="timeSlot" placeholder="e.g. 09:30 AM - 10:30 AM" defaultValue={editingAgenda?.timeSlot || ''} required />
            <TextInput label="Session Title" name="title" defaultValue={editingAgenda?.title || ''} required />
            <Textarea label="Detailed Description" name="description" defaultValue={editingAgenda?.description || ''} rows={3} />
            <TextInput label="Speaker Name(s)" name="speakerName" placeholder="e.g. Dr. Jane Doe" defaultValue={editingAgenda?.speakerName || ''} />
            <TextInput label="Room / Location" name="location" placeholder="e.g. Main Hall A" defaultValue={editingAgenda?.location || ''} />
            <Select
              label="Session Type"
              name="type"
              data={['KEYNOTE', 'PANEL', 'SESSION', 'BREAK', 'SOCIAL']}
              defaultValue={editingAgenda?.type || 'SESSION'}
              required
            />
            <TextInput label="Sort Order" name="order" type="number" defaultValue={editingAgenda?.order || 0} />

            <Button type="submit" loading={saveAgendaMutation.isPending} variant="filled" color="blue" fullWidth>
              Save Agenda Item
            </Button>
          </Stack>
        </form>
      </Modal>

      {/* --- FAQ EDIT MODAL --- */}
      <Modal
        opened={faqModalOpened}
        onClose={closeFAQModal}
        title={editingFAQ ? 'Edit FAQ' : 'Add FAQ'}
        size="md"
      >
        <form onSubmit={handleFAQSubmit}>
          <Stack gap="sm">
            <TextInput label="Question" name="question" defaultValue={editingFAQ?.question || ''} required />
            <Textarea label="Answer" name="answer" defaultValue={editingFAQ?.answer || ''} rows={4} required />
            <TextInput label="Sort Order" name="order" type="number" defaultValue={editingFAQ?.order || 0} />

            <Button type="submit" loading={saveFAQMutation.isPending} variant="filled" color="blue" fullWidth>
              Save FAQ
            </Button>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}
