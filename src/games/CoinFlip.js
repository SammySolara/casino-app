import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Coins,
  ArrowLeft,
  Users,
  RefreshCw,
  Trophy,
  Crown,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

const CoinFlip = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState("lobby-list"); // 'lobby-list', 'create-lobby', 'in-lobby', 'flipping'
  const [lobbies, setLobbies] = useState([]);
  const [currentLobby, setCurrentLobby] = useState(null);
  const [stakeAmount, setStakeAmount] = useState(10);
  const [selectedSide, setSelectedSide] = useState("heads");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(userProfile?.balance || 1000);
  const [flipping, setFlipping] = useState(false);
  const [flipResult, setFlipResult] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  useEffect(() => {
    if (userProfile?.balance) {
      setBalance(userProfile.balance);
    }
  }, [userProfile]);

  const executeFlip = async (lobby) => {
    setView("flipping");
    setFlipping(true);
    setFlipResult(null);
    setGameResult(null);

    // Animate coin flip
    const flipDuration = 3000;
    const flipInterval = 100;
    let currentTime = 0;

    const flipAnimation = setInterval(() => {
      setFlipResult(Math.random() > 0.5 ? "heads" : "tails");
      currentTime += flipInterval;

      if (currentTime >= flipDuration) {
        clearInterval(flipAnimation);

        // Generate final result (server-side RNG simulation)
        const finalResult = Math.random() > 0.5 ? "heads" : "tails";
        setFlipResult(finalResult);
        setFlipping(false);

        // Determine winner
        const isCreator = lobby.creator_id === user.id;
        const mySide = isCreator
          ? lobby.creator_side
          : lobby.creator_side === "heads"
          ? "tails"
          : "heads";
        const won = finalResult === mySide;

        let newBalance;
        if (won) {
          newBalance = balance + lobby.stake_amount;
          setGameResult({
            type: "win",
            message: `You won ${lobby.stake_amount.toFixed(2)}!`,
            result: finalResult,
          });
        } else {
          newBalance = balance - lobby.stake_amount;
          setGameResult({
            type: "lose",
            message: `You lost ${lobby.stake_amount.toFixed(2)}!`,
            result: finalResult,
          });
        }

        // Update balance and save result
        updateUserBalance(newBalance);
        saveGameResult(lobby, won, finalResult);

        // Update lobby status
        updateLobbyStatus(
          lobby.id,
          finalResult,
          won ? user.id : isCreator ? lobby.opponent_id : lobby.creator_id
        );
      }
    }, flipInterval);
  };

  useEffect(() => {
    fetchLobbies();

    // Set up realtime subscription
    const channel = supabase
      .channel("coinflip-lobbies")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "coinflip_lobbies",
        },
        (payload) => {
          fetchLobbies();

          // If we're in a lobby and it gets updated
          if (currentLobby && payload.new?.id === currentLobby.id) {
            if (payload.new.status === "filled" && payload.new.opponent_id) {
              setCurrentLobby(payload.new);
              // Start flip if opponent joined
              if (payload.new.creator_id === user.id) {
                setTimeout(() => executeFlip(payload.new), 2000);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentLobby, user.id]);

  const fetchLobbies = async () => {
    try {
      const { data, error } = await supabase
        .from("coinflip_lobbies")
        .select(
          "*, creator:users!creator_id(username), opponent:users!opponent_id(username)"
        )
        .in("status", ["open"])
        .order("created_at", { ascending: false });

      if (!error) {
        setLobbies(data || []);
      }
    } catch (error) {
      console.error("Error fetching lobbies:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

  const updateUserBalance = async (newBalance) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ balance: newBalance })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating balance:", error);
        return false;
      }

      setBalance(newBalance);
      return true;
    } catch (error) {
      console.error("Error updating balance:", error);
      return false;
    }
  };

  const saveGameResult = async (lobby, won, result) => {
    try {
      const { error } = await supabase.from("game_results").insert([
        {
          user_id: user.id,
          game_type: "coinflip",
          bet_amount: lobby.stake_amount,
          win_chance: 50,
          multiplier: 2,
          roll_result: result === "heads" ? 1 : 0,
          won: won,
          payout: won ? lobby.stake_amount * 2 : 0,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error saving game result:", error);
      }
    } catch (error) {
      console.error("Error saving game result:", error);
    }
  };

  const createLobby = async () => {
    if (stakeAmount <= 0) {
      alert("Please enter a valid stake amount");
      return;
    }

    if (stakeAmount > balance) {
      alert("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("coinflip_lobbies")
        .insert({
          creator_id: user.id,
          stake_amount: stakeAmount,
          creator_side: selectedSide,
          status: "open",
        })
        .select()
        .single();

      if (!error && data) {
        setCurrentLobby(data);
        setView("in-lobby");
      } else {
        alert("Failed to create lobby");
      }
    } catch (error) {
      console.error("Error creating lobby:", error);
      alert("Error creating lobby");
    } finally {
      setLoading(false);
    }
  };

  const joinLobby = async (lobby) => {
    if (lobby.stake_amount > balance) {
      alert("Insufficient balance");
      return;
    }

    if (lobby.creator_id === user.id) {
      alert("You cannot join your own lobby");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("coinflip_lobbies")
        .update({
          opponent_id: user.id,
          status: "filled",
        })
        .eq("id", lobby.id)
        .select()
        .single();

      if (!error && data) {
        setCurrentLobby(data);
        setView("in-lobby");
        // Trigger flip after joining
        setTimeout(() => executeFlip(data), 2000);
      } else {
        alert("Failed to join lobby");
      }
    } catch (error) {
      console.error("Error joining lobby:", error);
      alert("Error joining lobby");
    } finally {
      setLoading(false);
    }
  };

  const renderLobbyList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Coinflip Lobbies</h2>
        <button
          onClick={() => setView("create-lobby")}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
        >
          Create Lobby
        </button>
      </div>

      {lobbies.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-12 text-center">
          <Coins className="h-16 w-16 text-yellow-400 mx-auto mb-4 opacity-50" />
          <p className="text-gray-300 text-lg mb-2">No active lobbies</p>
          <p className="text-gray-400 text-sm">
            Create a lobby to start playing!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lobbies.map((lobby) => (
            <div
              key={lobby.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 hover:bg-white/15 transition duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="text-white font-semibold">
                      {lobby.creator?.username || "Anonymous"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">
                    Side:{" "}
                    <span className="font-semibold capitalize text-yellow-400">
                      {lobby.creator_side}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">
                    ${lobby.stake_amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Stake</div>
                </div>
              </div>

              <button
                onClick={() => joinLobby(lobby)}
                disabled={loading || lobby.creator_id === user.id}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:cursor-not-allowed"
              >
                {lobby.creator_id === user.id ? "Your Lobby" : "Join Game"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreateLobby = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          Create Coinflip Lobby
        </h2>

        <div className="space-y-6">
          {/* Stake Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-3">
              Stake Amount ($)
            </label>
            <input
              type="number"
              min="1"
              max={balance}
              value={stakeAmount}
              onChange={(e) =>
                setStakeAmount(Math.max(1, parseFloat(e.target.value) || 1))
              }
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <div className="flex space-x-2 mt-3">
              {[10, 25, 50, 100, 250].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setStakeAmount(amount)}
                  disabled={amount > balance}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded text-sm text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {/* Choose Side */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-3">
              Choose Your Side
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedSide("heads")}
                className={`p-6 rounded-lg border-2 transition duration-200 ${
                  selectedSide === "heads"
                    ? "bg-yellow-500/20 border-yellow-500"
                    : "bg-white/5 border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="text-4xl mb-2">👑</div>
                <div className="text-white font-semibold">Heads</div>
              </button>
              <button
                onClick={() => setSelectedSide("tails")}
                className={`p-6 rounded-lg border-2 transition duration-200 ${
                  selectedSide === "tails"
                    ? "bg-yellow-500/20 border-yellow-500"
                    : "bg-white/5 border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-white font-semibold">Tails</div>
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              <strong>Note:</strong> Your opponent will automatically be
              assigned the opposite side. Winner takes $
              {(stakeAmount * 2).toFixed(2)} (both stakes combined).
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => setView("lobby-list")}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold border border-white/20 transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={createLobby}
              disabled={loading || stakeAmount > balance}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Lobby"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInLobby = () => {
    const isCreator = currentLobby?.creator_id === user.id;
    const waiting = currentLobby?.status === "open";

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {waiting ? "Waiting for Opponent..." : "Opponent Joined!"}
          </h2>

          <div className="space-y-6">
            {/* Stake Display */}
            <div className="text-center">
              <div className="text-5xl font-bold text-yellow-400 mb-2">
                ${currentLobby?.stake_amount.toLocaleString()}
              </div>
              <div className="text-gray-300">Stake Amount</div>
              <div className="text-sm text-gray-400 mt-2">
                Winner takes ${(currentLobby?.stake_amount * 2).toFixed(2)}
              </div>
            </div>

            {/* Sides */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">
                  {currentLobby?.creator_side === "heads" ? "👑" : "🎯"}
                </div>
                <div className="text-white font-semibold mb-1">You</div>
                <div className="text-sm text-gray-400 capitalize">
                  {currentLobby?.creator_side}
                </div>
              </div>
              <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">
                  {currentLobby?.creator_side === "heads" ? "🎯" : "👑"}
                </div>
                <div className="text-white font-semibold mb-1">
                  {waiting ? "Waiting..." : "Opponent"}
                </div>
                <div className="text-sm text-gray-400 capitalize">
                  {currentLobby?.creator_side === "heads" ? "tails" : "heads"}
                </div>
              </div>
            </div>

            {waiting && (
              <>
                <div className="text-center">
                  <RefreshCw className="h-12 w-12 text-yellow-400 mx-auto mb-3 animate-spin" />
                  <p className="text-gray-300">
                    Waiting for someone to join your lobby...
                  </p>
                </div>

                <button
                  onClick={cancelLobby}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-3 rounded-lg font-semibold border border-red-500/30 transition duration-200"
                >
                  Cancel Lobby
                </button>
              </>
            )}

            {!waiting && (
              <div className="text-center">
                <p className="text-green-400 font-semibold mb-2">Get ready!</p>
                <p className="text-gray-300 text-sm">
                  The coin is about to flip...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFlipping = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Flipping Coin...
        </h2>

        {/* Coin Animation */}
        <div className="flex justify-center mb-8">
          <div
            className={`w-40 h-40 rounded-full flex items-center justify-center text-6xl ${
              flipping ? "animate-spin" : ""
            } bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-2xl`}
          >
            {flipResult === "heads" ? "👑" : "🎯"}
          </div>
        </div>

        {!flipping && gameResult && (
          <div
            className={`p-6 rounded-lg text-center ${
              gameResult.type === "win"
                ? "bg-green-500/20 border border-green-500/30"
                : "bg-red-500/20 border border-red-500/30"
            }`}
          >
            <div
              className={`text-4xl font-bold mb-2 ${
                gameResult.type === "win" ? "text-green-300" : "text-red-300"
              }`}
            >
              {gameResult.type === "win" ? "🎉 YOU WON!" : "😔 YOU LOST"}
            </div>
            <p
              className={`text-xl mb-2 ${
                gameResult.type === "win" ? "text-green-300" : "text-red-300"
              }`}
            >
              {gameResult.message}
            </p>
            <p className="text-gray-300">
              Result: <span className="font-bold capitalize">{flipResult}</span>
            </p>

            <button
              onClick={resetGame}
              className="mt-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-200"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center text-white hover:text-yellow-400 transition duration-200"
              >
                <ArrowLeft className="h-6 w-6 mr-2" />
                Back to Dashboard
              </button>
              <div className="flex items-center">
                <Coins className="h-8 w-8 text-yellow-400 mr-3" />
                <h1 className="text-2xl font-bold text-white">Coinflip Duel</h1>
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
                <span className="font-semibold">
                  {userProfile?.username || user?.email}
                </span>
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
        {view === "lobby-list" && renderLobbyList()}
        {view === "create-lobby" && renderCreateLobby()}
        {view === "in-lobby" && renderInLobby()}
        {view === "flipping" && renderFlipping()}
      </main>
    </div>
  );
};

export default CoinFlip;
