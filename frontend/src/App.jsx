import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentDashboard } from './pages/StudentDashboard';
import { CounsellingIntake } from './pages/CounsellingIntake';
import { RequestStatus } from './pages/RequestStatus';
import { CounsellorDashboard } from './pages/CounsellorDashboard';
import { CounsellorReview } from './pages/CounsellorReview';
import { SupportGroups } from './pages/SupportGroups';
import { ImmediateSupport } from './pages/ImmediateSupport';
import { Analytics } from './pages/Analytics';
import { StudentProfile } from './pages/StudentProfile';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'counsellor') return <Navigate to="/counsellor" replace />;
  if (user.role === 'admin') return <Navigate to="/analytics" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-900 selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Root */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/counselling/new"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <CounsellingIntake />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/counselling/request/:id"
                element={
                  <ProtectedRoute>
                    <RequestStatus />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />

              {/* Counsellor & Staff Routes */}
              <Route
                path="/counsellor"
                element={
                  <ProtectedRoute allowedRoles={['counsellor', 'admin']}>
                    <CounsellorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/counsellor/request/:id"
                element={
                  <ProtectedRoute allowedRoles={['counsellor', 'admin']}>
                    <CounsellorReview />
                  </ProtectedRoute>
                }
              />

              {/* Shared Routes */}
              <Route
                path="/groups"
                element={
                  <ProtectedRoute>
                    <SupportGroups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/immediate-support"
                element={
                  <ProtectedRoute>
                    <ImmediateSupport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={['counsellor', 'admin']}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
