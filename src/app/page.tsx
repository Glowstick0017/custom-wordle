'use client';

import { Plus, BarChart3, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatsModal from '@/components/StatsModal';
import CreateModal from '@/components/CreateModal';
import AccessibilityToggle from '@/components/AccessibilityToggle';
import { getStoredStats } from '@/utils/gameLogic';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { getDailyWord, getDailyGameDate, preloadWordList } from '@/utils/dailyGame';
import { encryptWordle } from '@/utils/encryption';

export default function Home() {
  const [showStats, setShowStats] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [isLoadingDaily, setIsLoadingDaily] = useState(false);
  const { isAccessibilityMode } = useAccessibility();
  const router = useRouter();
  const stats = getStoredStats();

  // Preload the word list when the component mounts for better performance
  useEffect(() => {
    preloadWordList();
  }, []);

  const handlePlayDaily = async () => {
    setIsLoadingDaily(true);
    try {
      const dailyWord = await getDailyWord();
      const encryptedGame = encryptWordle({
        word: dailyWord,
        maxGuesses: 6,
        hardMode: false,
        realWordsOnly: true
      });
      router.push(`/play?w=${encryptedGame}`);
    } catch (error) {
      console.error('Failed to load daily word:', error);
      setIsLoadingDaily(false);
      // Could show an alert here, but for now we'll just log the error
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Accessibility Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <AccessibilityToggle />
      </div>

      {/* Floating gradient orbs - hidden in accessibility mode */}
      {!isAccessibilityMode && (
        <>
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-500/20 to-transparent rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-purple-500/20 to-transparent rounded-full blur-xl animate-pulse delay-700"></div>
          <div className="absolute bottom-32 left-20 w-40 h-40 bg-gradient-to-r from-orange-500/20 to-transparent rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-60 left-1/2 w-28 h-28 bg-gradient-to-r from-cyan-500/15 to-transparent rounded-full blur-xl animate-pulse delay-500"></div>
          <div className="absolute bottom-20 right-10 w-36 h-36 bg-gradient-to-r from-pink-500/15 to-transparent rounded-full blur-xl animate-pulse delay-1500"></div>
          <div className="absolute top-10 right-1/3 w-20 h-20 bg-gradient-to-r from-indigo-500/20 to-transparent rounded-full blur-xl animate-pulse delay-300"></div>
          <div className="absolute bottom-60 left-1/3 w-44 h-44 bg-gradient-to-r from-teal-500/10 to-transparent rounded-full blur-xl animate-pulse delay-2000"></div>
        </>
      )}
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <h1 className={`text-4xl sm:text-6xl font-bold mb-4 drop-shadow-2xl ${
            isAccessibilityMode ? 'text-white' : 'gradient-text'
          }`}>
            Glowdle
          </h1>
          <p className="text-white/80 text-sm sm:text-lg font-medium">
            Create and play custom Wordle games
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handlePlayDaily}
            disabled={isLoadingDaily}
            className="w-full btn-gradient-accent text-white font-bold py-5 px-6 rounded-xl flex items-center justify-center gap-3 text-lg relative group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingDaily ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-transparent border-t-white"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Calendar size={24} />
                <div className="flex flex-col items-start">
                  <span>Play Daily Game</span>
                  <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors">
                    {getDailyGameDate()}
                  </span>
                </div>
              </>
            )}
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="w-full btn-gradient-primary text-white font-bold py-5 px-6 rounded-xl flex items-center justify-center gap-3 text-lg"
          >
            <Plus size={24} />
            Create Custom Glowdle
          </button>

          <button
            onClick={() => setShowStats(true)}
            className="w-full btn-gradient-secondary text-white font-bold py-5 px-6 rounded-xl flex items-center justify-center gap-3 text-lg"
          >
            <BarChart3 size={24} />
            View Statistics
          </button>
        </div>

        {/* Instructions */}
        <div className="glass-card glass-card-hover rounded-xl p-6">
          <h2 className={`font-bold text-xl mb-4 ${isAccessibilityMode ? 'text-white' : 'gradient-text'}`}>How to Play</h2>
          <ul className="space-y-3 text-sm text-white/90">
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold">•</span>
              <span>Play a new daily word challenge every day</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Create custom Wordles with any word length (1-30 letters)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">•</span>
              <span>Set custom guess limits (up to infinity)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-400 font-bold">•</span>
              <span>Share encrypted links with friends</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Track your statistics locally</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">•</span>
              <span>Share results with emoji grids</span>
            </li>
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
