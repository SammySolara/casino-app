import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Dice1, ArrowLeft, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const DiceGame = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [betAmount, setBetAmount] = useState(10);
  const [winChance, setWinChance] = useState(50);
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [balance, setBalance] = useState(userProfile?.balance || 1000);
  const [gameHistory, setGameHistory] = useState([]);

  const multiplier = (100 / winChance).toFixed(2);
  const potentialWin = (betAmount * multiplier).toFixed(2);

  useEffect(() => {
    if (userProfile?.balance) {
      setBalance(userProfile.balance);
    }
  }, [userProfile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  const updateUserBalance = async (newBalance) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating balance:', error);
        return false;
      }
      
      setBalance(newBalance);
      return true;
    } catch (error) {
      console.error('Error updating balance:', error);
      return false;
    }
  };

  const saveGameResult = async (roll, won, amount, winChance, multiplier) => {
    try {
      const { error } = await supabase
        .from('game_results')
        .insert([{
          user_id: user.id,
          game_type: 'dice',
          bet_amount: amount,
          win_chance: winChance,
          multiplier: parseFloat(multiplier),
          roll_result: roll,
          won: won,
          payout: won ? parseFloat(potentialWin) : 0,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error saving game result:', error);
      }
    } catch (error) {
      console.error('Error saving game result:', error);
    }
  };

  const rollDice = async () => {
    if (betAmount > balance) {
      alert('Insufficient balance!');
      return;
    }

    if (betAmount <= 0) {
      alert('Bet amount must be greater than 0!');
      return;
    }

    setIsRolling(true);
    setGameResult(null);

    // Simulate rolling animation
    const rollDuration = 2000;
    const rollInterval = 100;
    let currentTime = 0;

    const rollAnimation = setInterval(() => {
      setLastRoll(Math.floor(Math.random() * 100) + 1);
      currentTime += rollInterval;

      if (currentTime >= rollDuration) {
        clearInterval(rollAnimation);
        
        // Final roll
        const finalRoll = Math.floor(Math.random() * 100) + 1;
        const won = finalRoll <= winChance;
        
        setLastRoll(finalRoll);
        setIsRolling(false);

        let newBalance;
        if (won) {
          newBalance = balance - betAmount + parseFloat(potentialWin);
          setGameResult({
            type: 'win',
            message: `You won $${(parseFloat(potentialWin) - betAmount).toFixed(2)}!`,
            roll: finalRoll,
            payout: parseFloat(potentialWin)
          });
        } else {
          newBalance = balance - betAmount;
          setGameResult({
            type: 'lose',
            message: `You lost $${betAmount}!`,
            roll: finalRoll,
            payout: 0
          });
        }

        // Update balance and save game result
        updateUserBalance(newBalance);
        saveGameResult(finalRoll, won, betAmount, winChance, multiplier);

        // Add to game history
        setGameHistory(prev => [{
          id: Date.now(),
          roll: finalRoll,
          won,
          betAmount,
          winChance,
          payout: won ? parseFloat(potentialWin) : 0,
          timestamp: new Date()
        }, ...prev.slice(0, 9)]); // Keep last 10 games
      }
    }, rollInterval);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-white hover:text-yellow-400 transition duration-200"
              >
                <ArrowLeft className="h-6 w-6 mr-2" />
                Back to Dashboard
              </button>
              <div className="flex items-center">
                <Dice1 className="h-8 w-8 text-yellow-400 mr-3" />
                <h1 className="text-2xl font-bold text-white">Dice Game</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <span className="text-white font-semibold">
                  ${balance.toLocaleString()}
                </span>
              </div>
              
              <div className="text-white">
                <span className="font-semibold">{userProfile?.username || user?.email}</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dice Display */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8">
              <div className="text-center">
                <div className="mb-8">
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${
                    isRolling ? 'border-yellow-400 animate-spin' : 'border-white/20'
                  } bg-white/10`}>
                    <span className={`text-4xl font-bold ${
                      gameResult?.type === 'win' ? 'text-green-400' : 
                      gameResult?.type === 'lose' ? 'text-red-400' : 'text-white'
                    }`}>
                      {lastRoll || '?'}
                    </span>
                  </div>
                </div>

                {gameResult && (
                  <div className={`mb-4 p-4 rounded-lg ${
                    gameResult.type === 'win' ? 'bg-green-500/20 border border-green-500/30' : 
                    'bg-red-500/20 border border-red-500/30'
                  }`}>
                    <p className={`font-semibold ${
                      gameResult.type === 'win' ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {gameResult.message}
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                      Roll: {gameResult.roll} | Needed: ≤ {winChance}
                    </p>
                  </div>
                )}

                <div className="text-white mb-4">
                  <p className="text-lg">
                    Roll <span className="font-bold text-yellow-400">≤ {winChance}</span> to win!
                  </p>
                  <p className="text-sm text-gray-300">
                    Current range: 1-{winChance} (Win) | {winChance + 1}-100 (Lose)
                  </p>
                </div>
              </div>
            </div>

            {/* Game Controls */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bet Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-3">
                    Bet Amount ($)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="number"
                      min="1"
                      max={balance}
                      value={betAmount}
                      onChange={(e) => setBetAmount(Math.max(1, parseFloat(e.target.value) || 1))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      disabled={isRolling}
                    />
                    <div className="flex space-x-2">
                      {[10, 25, 50, 100].map(amount => (
                        <button
                          key={amount}
                          onClick={() => setBetAmount(amount)}
                          disabled={isRolling || amount > balance}
                          className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Win Chance */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-3">
                    Win Chance: {winChance}%
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="95"
                    value={winChance}
                    onChange={(e) => setWinChance(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    disabled={isRolling}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1%</span>
                    <span>95%</span>
                  </div>
                </div>
              </div>

              {/* Game Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20">
                <div className="text-center">
                  <p className="text-sm text-gray-300">Multiplier</p>
                  <p className="text-xl font-bold text-white">{multiplier}x</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-300">Potential Win</p>
                  <p className="text-xl font-bold text-green-400">${potentialWin}</p>
                </div>
              </div>

              {/* Roll Button */}
              <button
                onClick={rollDice}
                disabled={isRolling || betAmount > balance}
                className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 disabled:cursor-not-allowed text-lg"
              >
                {isRolling ? 'Rolling...' : `Roll Dice - Bet $${betAmount}`}
              </button>
            </div>
          </div>

          {/* Side Panel - Game History */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Recent Games
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {gameHistory.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No games played yet</p>
                ) : (
                  gameHistory.map((game) => (
                    <div
                      key={game.id}
                      className={`p-3 rounded-lg border ${
                        game.won 
                          ? 'bg-green-500/20 border-green-500/30' 
                          : 'bg-red-500/20 border-red-500/30'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`font-semibold ${
                            game.won ? 'text-green-300' : 'text-red-300'
                          }`}>
                            {game.won ? '+' : '-'}${Math.abs(game.payout - game.betAmount).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Roll: {game.roll} | Bet: ${game.betAmount} | {game.winChance}%
                          </p>
                        </div>
                        <div className="text-right">
                          <Target className={`h-4 w-4 ${game.won ? 'text-green-400' : 'text-red-400'}`} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Game Rules */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>• Choose your bet amount</p>
                <p>• Set your win chance (1-95%)</p>
                <p>• Roll needs to be ≤ your win chance to win</p>
                <p>• Higher win chance = lower multiplier</p>
                <p>• Lower win chance = higher multiplier</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #facc15;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #facc15;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default DiceGame;