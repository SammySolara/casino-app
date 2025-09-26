import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Users, TrendingUp, Dice1, Trophy, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Dashboard = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, balance')
        .order('balance', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard:', error);
      } else {
        setLeaderboard(data || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  const games = [
    { name: 'Roulette', path: '/games/roulette', icon: Dice1, color: 'text-red-400' },
    { name: 'Dice', path: '/games/dice', icon: Dice1, color: 'text-blue-400' },
    { name: 'Coin Flip', path: '/games/coinflip', icon: Dice1, color: 'text-yellow-400' },
    { name: 'Blackjack', path: '/games/blackjack', icon: Dice1, color: 'text-green-400' },
    { name: 'Crash', path: '/games/crash', icon: Dice1, color: 'text-purple-400' },
  ];

  const handleGameClick = (gamePath) => {
    navigate(gamePath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => navigate('/dashboard')}
            >
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

        {/* Games Grid */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Games</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {games.map((game) => {
              const IconComponent = game.icon;
              return (
                <div
                  key={game.name}
                  onClick={() => handleGameClick(game.path)}
                  className="bg-white/5 border border-white/10 rounded-lg p-6 text-center hover:bg-white/10 hover:border-white/20 transition duration-200 cursor-pointer transform hover:scale-105"
                >
                  <IconComponent className={`h-12 w-12 ${game.color} mx-auto mb-3`} />
                  <h3 className="text-white font-semibold">{game.name}</h3>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="text-gray-300">
              <p>Welcome to Casino Royal! Start playing to see your activity here.</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
              Leaderboard
            </h3>
            {loading ? (
              <div className="text-center text-gray-300 py-4">Loading...</div>
            ) : leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((player, index) => (
                  <div 
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      player.id === user?.id ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-yellow-600 text-black' :
                        'bg-white/20 text-white'
                      }`}>
                        {index === 0 && <Crown className="h-3 w-3" />}
                        {index !== 0 && (index + 1)}
                      </div>
                      <div>
                        <p className={`font-semibold ${
                          player.id === user?.id ? 'text-yellow-300' : 'text-white'
                        }`}>
                          {player.username || 'Anonymous'}
                          {player.id === user?.id && ' (You)'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">
                        ${player.balance?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-300 text-center py-4">No players yet!</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;