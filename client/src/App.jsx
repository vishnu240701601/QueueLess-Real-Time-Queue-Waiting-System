import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueueProvider } from './context/QueueContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';

// Auth Pages
import ChooseRolePage from './pages/auth/ChooseRolePage';
import StudentLoginPage from './pages/auth/StudentLoginPage';
import StudentRegisterPage from './pages/auth/StudentRegisterPage';
import StaffLoginPage from './pages/auth/StaffLoginPage';
import StaffRegisterPage from './pages/auth/StaffRegisterPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentServicesPage from './pages/student/StudentServicesPage';
import ServiceQueuePage from './pages/student/ServiceQueuePage';
import StudentHistoryPage from './pages/student/StudentHistoryPage';
import TokenLiveStatus from './pages/TokenLiveStatus';

// Staff Pages
import StaffDashboard from './pages/StaffDashboard';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminHistoryPage from './pages/admin/AdminHistoryPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueueProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* 1. Public Entry Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth/choose-role" element={<ChooseRolePage />} />
                <Route path="/auth/student/login" element={<StudentLoginPage />} />
                <Route path="/auth/student/register" element={<StudentRegisterPage />} />
                <Route path="/auth/staff/login" element={<StaffLoginPage />} />
                <Route path="/auth/staff/register" element={<StaffRegisterPage />} />
                <Route path="/auth/admin/login" element={<AdminLoginPage />} />

                {/* Legacy redirect aliases */}
                <Route path="/login" element={<Navigate to="/auth/choose-role" replace />} />
                <Route path="/register" element={<Navigate to="/auth/choose-role" replace />} />

                {/* 2. Protected Student Routes */}
                <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/services"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentServicesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/services/:serviceSlug"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <ServiceQueuePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/history"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/ticket/:id"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <TokenLiveStatus />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/live-status"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <TokenLiveStatus />
                    </ProtectedRoute>
                  }
                />

                {/* 3. Protected Staff Routes */}
                <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
                <Route
                  path="/staff/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/queue"
                  element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 4. Protected Administrator Routes */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/history"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminAnalyticsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Legacy /history route - now restricted to Admin */}
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminHistoryPage />
                    </ProtectedRoute>
                  }
                />

                {/* 5. Fallback 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </QueueProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
