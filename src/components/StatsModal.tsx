'use client';

import { GameStats } from '@/types/game';
import Modal from './Modal';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
}

export default function StatsModal({ isOpen, onClose, stats }: StatsModalProps) {
  const winPercentage = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  const maxDistribution = Math.max(...Object.values(stats.guessDistribution), 1);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Statistics">
      <div className="space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="glass-card p-4 rounded-lg">
            <div className="text-3xl font-bold gradient-text">{stats.gamesPlayed}</div>
            <div className="text-xs text-white/70 mt-1">Games Played</div>
          </div>
          <div className="glass-card p-4 rounded-lg">
            <div className="text-3xl font-bold gradient-text">{winPercentage}%</div>
            <div className="text-xs text-white/70 mt-1">Win Rate</div>
          </div>
          <div className="glass-card p-4 rounded-lg">
            <div className="text-3xl font-bold text-emerald-400">{stats.currentStreak}</div>
            <div className="text-xs text-white/70 mt-1">Current Streak</div>
          </div>
          <div className="glass-card p-4 rounded-lg">
            <div className="text-3xl font-bold text-purple-400">{stats.maxStreak}</div>
            <div className="text-xs text-white/70 mt-1">Best Streak</div>
          </div>
        </div>

        {/* Guess Distribution */}
        {Object.keys(stats.guessDistribution).length > 0 && (
          <div className="glass-card p-4 rounded-lg">
            <h3 className="font-bold mb-4 gradient-text text-lg">Guess Distribution</h3>
            <div className="space-y-2">
              {Object.entries(stats.guessDistribution)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([guesses, count]) => (
                  <div key={guesses} className="flex items-center gap-3">
                    <div className="w-6 text-sm text-white/80 font-medium">{guesses}</div>
                    <div className="flex-1 glass-card rounded-lg h-6 relative overflow-hidden">
                      <div
                        className="btn-gradient-primary h-full rounded-lg transition-all duration-700 ease-out"
                        style={{ width: `${Math.max((count / maxDistribution) * 100, 5)}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-end pr-3">
                        <span className="text-xs font-bold text-white drop-shadow-lg">{count}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
} 