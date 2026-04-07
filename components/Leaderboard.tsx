'use client';

import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useState } from 'react';
import Image from 'next/image';

const GAME_TYPES = [
  'Total Score',
  'Balance',
  'Rock Paper Scissors',
  'Word Rush',
  'Market Sprint',
  'Tic-Tac-Toe',
  'Gem Puzzle',
  'Vault Run',
  'Boss Siege',
];

export default function Leaderboard() {
  const { isAuthenticated } = useAuth();
  const { leaderboard, user, refreshLeaderboards } = useUser();
  const [selectedGame, setSelectedGame] = useState<string>('Total Score');

  const getScore = (player: typeof leaderboard[number], game: string) => {
    if (game === 'Balance') {
      return player.balance;
    }

    if (game === 'Total Score') {
      return player.balance + player.gameLog.reduce((sum, entry) => sum + entry.points, 0);
    }

    return player.gameLog
      .filter(entry => entry.game === game)
      .reduce((sum, entry) => sum + entry.points, 0);
  };

  const leaderboardWithScores = leaderboard.map((player) => ({
    ...player,
    displayName: player.displayName || player.username,
    gameScore: getScore(player, selectedGame),
  }));

  const sortedLeaderboard = [...leaderboardWithScores].sort((a, b) => b.gameScore - a.gameScore);
  const champion = sortedLeaderboard[0];
  const overallChampion = [...leaderboardWithScores].sort((a, b) => b.totalScore - a.totalScore)[0];
  const championGameTotal = overallChampion ? getScore(overallChampion, selectedGame) : 0;
  const topPlayers = sortedLeaderboard.slice(0, 10);
  const currentPlayer = sortedLeaderboard.find((player) => player.id === user?.id);
  const currentRank = currentPlayer ? sortedLeaderboard.findIndex((player) => player.id === user?.id) + 1 : null;

  const hasScore = topPlayers.length > 0;

  if (!hasScore) {
    return (
      <div className="rounded-3xl border border-green-500 bg-black/80 p-6 text-green-200 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-green-300">Game Leaderboards</p>
            <h3 className="text-3xl font-bold">{selectedGame} Champions</h3>
          </div>
          <div className="rounded-full bg-green-900/80 px-4 py-2 text-sm text-green-200">Real-time</div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {GAME_TYPES.map(game => (
            <button
              key={game}
              onClick={() => setSelectedGame(game)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedGame === game
                  ? 'bg-green-600 text-black'
                  : 'bg-slate-700 text-green-300 hover:bg-slate-600'
              }`}
            >
              {game}
            </button>
          ))}
        </div>

        <p className="text-sm text-green-300">
          No activity recorded yet for {selectedGame}. Start the challenge to record your score and secure your spot.
        </p>

        {!isAuthenticated && (
          <p className="mt-4 text-sm text-green-200">
            Sign in to track activity, save your progress, and appear on the live leaderboard.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-green-500 bg-black/80 p-6 text-green-100 shadow-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between mb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-green-300">Game Leaderboards</p>
          <h3 className="text-3xl font-bold">{selectedGame} Champions</h3>
          <p className="mt-1 text-sm text-green-300 max-w-2xl">
            Real-time ranking for the most played challenges. Play now to move up the leaderboard.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => void refreshLeaderboards()}
            className="rounded-full bg-slate-800/90 px-4 py-2 text-sm text-green-200 border border-green-500/40 hover:bg-slate-700 transition"
          >
            Refresh
          </button>
          <div className="rounded-full bg-green-900/80 px-4 py-2 text-sm text-green-200">Live updates</div>
        </div>
      </div>

      {overallChampion && (
        <div className="mb-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 p-6 text-green-100 shadow-inner animate-pulse-glow">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-float">
            <div className="flex items-center gap-3">
              {overallChampion.avatar_url && (
                <Image
                  src={overallChampion.avatar_url}
                  alt="Avatar"
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-emerald-400"
                />
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">GGHub Champion</p>
                <p className="mt-2 text-2xl font-bold text-white">{overallChampion.displayName || overallChampion.username}</p>
                <p className="text-sm text-green-300">Total score across all activity: {overallChampion.totalScore}</p>
              </div>
            </div>
            <div className="rounded-full bg-black/80 px-5 py-3 text-sm font-semibold text-green-200">
              {overallChampion.totalPoints} total game points
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-green-200">
            <div className="rounded-3xl border border-green-700/50 bg-slate-950/80 p-4">
              <p className="uppercase tracking-[0.2em] text-emerald-300 text-xs">Selected game total</p>
              <p className="mt-2 text-xl font-semibold text-white">{championGameTotal}</p>
              <p className="text-green-400">{selectedGame}</p>
            </div>
            <div className="rounded-3xl border border-green-700/50 bg-slate-950/80 p-4">
              <p className="uppercase tracking-[0.2em] text-emerald-300 text-xs">Sum of all game points</p>
              <p className="mt-2 text-xl font-semibold text-white">{overallChampion.totalPoints}</p>
              <p className="text-green-400">Including all games</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-green-300">
            {overallChampion.id === user?.id
              ? 'You are the current GGHub Champion. Keep dominating the leaderboard in real time.'
              : `Live champion: ${overallChampion.displayName || overallChampion.username}. Play more games to challenge the top spot.`}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {GAME_TYPES.map(game => (
          <button
            key={game}
            onClick={() => setSelectedGame(game)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedGame === game
                ? 'bg-green-600 text-black'
                : 'bg-slate-700 text-green-300 hover:bg-slate-600'
            }`}
          >
            {game}
          </button>
        ))}
      </div>

      {currentPlayer && currentRank && (
        <div className="mb-6 rounded-3xl border border-emerald-500/50 bg-emerald-950/10 p-5 text-green-200 shadow-inner">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Your leaderboard status</p>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              {currentPlayer.avatar_url && (
                <Image
                  src={currentPlayer.avatar_url}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-emerald-400"
                />
              )}
              <div>
                <p className="text-xl font-semibold text-white">#{currentRank} in {selectedGame}</p>
                <p className="text-sm text-green-300">{currentPlayer.displayName} • {currentPlayer.username}</p>
              </div>
            </div>
            <div className="rounded-full bg-black/70 px-4 py-2 text-sm text-green-200">
              {currentPlayer.gameScore} {selectedGame === 'Balance' ? 'coins' : 'points'}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {topPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex flex-col gap-4 rounded-3xl border border-green-700 bg-slate-950/80 p-4 transition-transform duration-300 ${player.id === user?.id ? 'ring-2 ring-emerald-400 shadow-emerald-500/20 animate-float' : 'hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/10'}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                {player.avatar_url && (
                  <Image
                    src={player.avatar_url}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-green-400"
                  />
                )}
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-green-400">Rank {index + 1}</p>
                  <p className="font-semibold text-white text-lg">{player.displayName || player.username}</p>
                  <p className="text-sm text-green-300">{player.username}</p>
                </div>
              </div>
              <div className="rounded-full bg-black/70 px-4 py-2 text-sm text-green-200">
                {selectedGame === 'Balance' ? `${player.gameScore} coins` : `${player.gameScore} points`}
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 text-sm text-green-300">
              <p className="rounded-2xl bg-black/60 p-3">Total Score: <span className="font-semibold text-white">{player.totalScore}</span></p>
              <p className="rounded-2xl bg-black/60 p-3">Total Game Points: <span className="font-semibold text-white">{player.totalPoints}</span></p>
            </div>
          </div>
        ))}
      </div>

      {currentPlayer && currentRank && currentRank > 10 && (
        <div className="mt-6 rounded-3xl border border-green-700 bg-slate-950/80 p-4">
          <p className="text-sm text-green-300">You are currently ranked <span className="font-semibold text-white">#{currentRank}</span> on the {selectedGame} leaderboard.</p>
          <p className="text-sm text-green-400">Keep playing to climb into the top 10.</p>
        </div>
      )}
    </div>
  );
}
