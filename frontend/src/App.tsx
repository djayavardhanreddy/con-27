import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useMantineColorScheme } from '@mantine/core';
import { db } from './services/db';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  const { toggleColorScheme } = useMantineColorScheme();

  useEffect(() => {
    // 1. Sync IndexedDB reactive cache from Python REST API backend
    db.syncFromApi();

    // 2. Toggle theme on Ctrl + J (case-insensitive)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        toggleColorScheme();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleColorScheme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Conference Landing Page */}
        <Route path="/" element={<Home />} />
        
        {/* Admin Authentication Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
