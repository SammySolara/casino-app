import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, DollarSign, Users, TrendingUp, Dice1 } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import Dashboard from './components/dashboard/Dashboard'; // assuming you have a Dashboard.js file

const App = () => {
  const [authMode, setAuthMode] = useState('signin');

  return (
    <AuthProvider>
      <AppContent authMode={authMode} setAuthMode={setAuthMode} />
    </AuthProvider>
  );
};

const AppContent = ({ authMode, setAuthMode }) => {
  const { user, loading } = useAuth();

  console.log('AppContent render:', { 
    user: user?.email, 
    loading, 
    hasUser: !!user 
  });

  // Show loading only briefly and with proper timeout
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Dice1 className="h-12 w-12 text-yellow-400 animate-spin" />
          </div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // User is not authenticated - show auth forms
  if (!user) {
    return authMode === 'signin' ? (
      <SignIn onSwitchToSignUp={() => setAuthMode('signup')} />
    ) : (
      <SignUp onSwitchToSignIn={() => setAuthMode('signin')} />
    );
  }

  // User is authenticated - show dashboard
  return <Dashboard />;
};

export default App;