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
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-emerald-400">{stats.gamesPlayed}</div>
            <div className="text-xs text-slate-400">Played</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{winPercentage}</div>
            <div className="text-xs text-slate-400">Win %</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{stats.currentStreak}</div>
            <div className="text-xs text-slate-400">Current Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{stats.maxStreak}</div>
            <div className="text-xs text-slate-400">Max Streak</div>
          </div>
        </div>

        {/* Guess Distribution */}
        {Object.keys(stats.guessDistribution).length > 0 && (
          <div>
            <h3 className="font-bold mb-3 text-emerald-400">Guess Distribution</h3>
            <div className="space-y-1">
              {Object.entries(stats.guessDistribution)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([guesses, count]) => (
                  <div key={guesses} className="flex items-center gap-2">
                    <div className="w-4 text-sm text-slate-300">{guesses}</div>
                    <div className="flex-1 bg-slate-700 rounded-sm h-5 relative">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-sm transition-all duration-500"
                        style={{ width: `${(count / maxDistribution) * 100}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-end pr-2">
                        <span className="text-xs font-bold text-white">{count}</span>
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