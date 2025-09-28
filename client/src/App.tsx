import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ParticipantLayout from './components/ParticipantLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Participants from './pages/Participants';
import AssessmentPage from './pages/Assessment';
import Report from './pages/Report';
import Reports from './pages/Reports';
import AdminDashboard from './pages/AdminDashboard';
import { Analytics } from "@vercel/analytics/react"
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Rotas de login e registro */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/participant/login" element={<Navigate to="/login" replace />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Rotas do administrador */}
            <Route path="/app" element={
              <ProtectedRoute requiredRole="admin">
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="participants" element={<Participants />} />
              <Route path="reports" element={<Reports />} />
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
            
            {/* Rotas dos participantes */}
            <Route path="/participant" element={
              <ProtectedRoute requiredRole="participant">
                <ParticipantLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/participant/assessment" replace />} />
              <Route path="assessment" element={<AssessmentPage />} />
              <Route path="report" element={<Report />} />
            </Route>
            
            {/* Rota para avaliação individual (acessível por admin) */}
            <Route path="/assessment/:code" element={
              <ProtectedRoute requiredRole="admin">
                <AssessmentPage />
              </ProtectedRoute>
            } />
            
            {/* Rota para relatório individual (acessível por admin) */}
            <Route path="/report/:code" element={
              <ProtectedRoute requiredRole="admin">
                <Report />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Analytics />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;