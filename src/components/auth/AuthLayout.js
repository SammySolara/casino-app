import React, { useState } from 'react';
import { Eye, EyeOff, DollarSign, Users, TrendingUp, Dice1 } from 'lucide-react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Auth Layout Component
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Dice1 className="h-12 w-12 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Clunga Casino</h1>
          <p className="text-gray-300">Your premium gambling experience</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-300">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout