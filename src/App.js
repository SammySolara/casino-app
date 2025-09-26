import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import Dashboard from './components/dashboard/Dashboard';
import DiceGame from './games/DiceGame';
import { Dice1 } from 'lucide-react';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

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

  return user ? children : <Navigate to="/signin" replace />;
};

// Auth Route Component (redirects to dashboard if already logged in)
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();

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

  return user ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/signin" element={
            <AuthRoute>
              <SignIn />
            </AuthRoute>
          } />
          <Route path="/signup" element={
            <AuthRoute>
              <SignUp />
            </AuthRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Game Routes - Add these as you create the components */}
          <Route path="/games/roulette" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-2xl">Roulette Game - Coming Soon!</div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/games/dice" element={
            <ProtectedRoute>
              <DiceGame />
            </ProtectedRoute>
          } />
          <Route path="/games/coinflip" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-2xl">Coin Flip - Coming Soon!</div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/games/blackjack" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-2xl">Blackjack - Coming Soon!</div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/games/crash" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-2xl">Crash Game - Coming Soon!</div>
              </div>
            </ProtectedRoute>
          } />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 Route */}
          <Route path="*" element={
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-xl">Page not found</p>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;