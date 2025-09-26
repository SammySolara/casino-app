import React, { useState } from 'react';
import { Eye, EyeOff, DollarSign, Users, TrendingUp, Dice1 } from 'lucide-react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user, userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Dice1 className="h-8 w-8 text-yellow-400 mr-3" />
              <h1 className="text-2xl font-bold text-white">Casino Royal</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <span className="text-white font-semibold">
                  ${userProfile?.balance?.toLocaleString() || '1,000.00'}
                </span>
              </div>
              
              <div className="text-white">
                Welcome, <span className="font-semibold">{userProfile?.username || user?.email}</span>
              </div>
              
              <button
                onClick={handleSignOut}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg border border-red-500/30 transition duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-gray-300 text-sm">Current Balance</p>
                <p className="text-2xl font-bold text-white">
                  ${userProfile?.balance?.toLocaleString() || '1,000.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-gray-300 text-sm">Games Played</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-gray-300 text-sm">Friends Online</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Games Grid - Coming Soon */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Games</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {['Roulette', 'Dice', 'Coin Flip', 'Blackjack', 'Crash'].map((game) => (
              <div
                key={game}
                className="bg-white/5 border border-white/10 rounded-lg p-6 text-center hover:bg-white/10 transition duration-200 cursor-pointer"
              >
                <Dice1 className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold">{game}</h3>
                <p className="text-gray-400 text-sm mt-1">Coming Soon</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;