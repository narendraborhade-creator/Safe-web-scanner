import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ParticleField from './components/ParticleField';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b14]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-sm text-slate-400 font-medium animate-pulse">Initializing SafeWeb Inspector...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] relative">
      <ParticleField />
      <div className="relative z-10 flex-1 flex flex-col">
        {isAuthenticated ? <Dashboard /> : <LoginPage />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
