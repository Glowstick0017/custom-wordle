'use client';

import { Plus, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import StatsModal from '@/components/StatsModal';
import CreateModal from '@/components/CreateModal';
import { getStoredStats } from '@/utils/gameLogic';

export default function Home() {
  const [showStats, setShowStats] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const stats = getStoredStats();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 gradient-text">
            Custom Wordle
          </h1>
          <p className="text-slate-300 text-sm sm:text-base">
            Create and play Wordle games with any word length
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => setShowCreate(true)}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-all duration-200 text-lg shadow-lg hover:shadow-emerald-500/25"
          >
            <Plus size={24} />
            Create Custom Wordle
          </button>

          <button
            onClick={() => setShowStats(true)}
            className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-all duration-200 text-lg shadow-lg hover:shadow-slate-500/25"
          >
            <BarChart3 size={24} />
            View Statistics
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-slate-700/50 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-slate-600/30">
          <h2 className="font-bold text-lg mb-3 text-emerald-400">How to Play</h2>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• Create custom Wordles with any word length (1-30 letters)</li>
            <li>• Set custom guess limits (up to infinity)</li>
            <li>• Share encrypted links with friends</li>
            <li>• Track your statistics locally</li>
            <li>• Share results with emoji grids</li>
          </ul>
        </div>
      </div>

      <StatsModal 
        isOpen={showStats} 
        onClose={() => setShowStats(false)} 
        stats={stats} 
      />

      <CreateModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}
