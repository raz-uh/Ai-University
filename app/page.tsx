'use client';

import { useState, Suspense } from 'react';
import Scene from '@/components/Scene';
import LandingHub from '@/components/LandingHub';
import UIOverlay, { HUDCard } from '@/components/UIOverlay';
import DiagnosticAgent from '@/components/DiagnosticAgent';
import CourseViewer from '@/components/CourseViewer';
import WalletLinker from '@/components/WalletLinker';
import Loader from '@/components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import Auth from '@/components/Auth';
import { useLanguage } from '@/context/LanguageContext';
import { useSound } from '@/hooks/useSound';

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showUI, setShowUI] = useState(true);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [xp, setXp] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const { playHover, playClick, isMuted, toggleMute } = useSound();

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', uid).single();
    if (data) {
      setProfile(data);
      setXp(data.xp);
      setWalletAddress(data.wallet_address || '');
    }
  };

  const fetchLeaderboard = async () => {
    const { data } = await supabase.from('leaderboard').select('*').limit(5);
    if (data) setLeaderboard(data);
  };

  const handleCompleteQuiz = async (earnedXp: number) => {
    const newXp = xp + earnedXp;
    setXp(newXp);

    if (user) {
      await supabase.from('profiles').update({ xp: newXp }).eq('user_id', user.id);
      fetchLeaderboard();
    }
  };

  useEffect(() => {
    // Check for mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Initial check (non-blocking)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Look for real session update
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    fetchLeaderboard();
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Scene or Mobile View */}
      {isMobile ? (
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 to-black flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
            AI Adaptive University
          </h1>
          <p className="text-indigo-200 mb-8">Generated for Mobile Performance</p>
          <div className="w-full max-w-sm h-64 bg-indigo-900/30 rounded-2xl border border-indigo-500/30 backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
            <div className="w-24 h-24 rounded-full bg-indigo-500 blur-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            <div className="relative z-10 text-6xl">🎓</div>
          </div>
        </div>
      ) : (
        <Suspense fallback={<Loader />}>
          <Scene>
            <LandingHub />
          </Scene>
        </Suspense>
      )}

      {/* 2D UI Overlay */}
      <UIOverlay show={showUI}>
        {/* Title */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-auto">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl font-bold text-center bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            AI Adaptive 3D University
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-center text-indigo-300 mt-2 text-lg"
          >
            Where AI Meets Adaptive Learning
          </motion.p>
        </div>

        {/* Stats Card */}
        <HUDCard title={t('your_progress')} position="top-left">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <span>{t('level')}</span>
              <span className="text-white text-lg">1</span>
            </div>
            <div className="flex justify-between items-center text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <span>{t('xp')}</span>
              <span className="text-white text-lg">{xp} / 1000</span>
            </div>
            <div className="w-full bg-indigo-950/50 rounded-full h-3 p-0.5 border border-indigo-500/20">
              <motion.div
                animate={{ width: `${(xp / 1000) * 100}%` }}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full"
              />
            </div>
          </div>
        </HUDCard>

        {/* Quick Actions */}
        <HUDCard title={t('quick_start')} position="top-right">
          <div className="space-y-3">
            <motion.button
              onClick={() => { playClick(); setShowDiagnostic(true); }}
              onMouseEnter={playHover}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(79, 70, 229, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-semibold text-white hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg border border-indigo-400/30"
            >
              {t('start_diagnostic')}
            </motion.button>
            <motion.button
              onClick={() => { playClick(); setShowCourses(true); }}
              onMouseEnter={playHover}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-4 py-2 bg-indigo-900/40 border border-indigo-400/30 rounded-lg font-semibold text-indigo-100 hover:bg-indigo-800/60 transition-all"
            >
              {t('my_courses')}
            </motion.button>

            <div className="relative group">
              <motion.button
                onClick={() => { playClick(); setShowWallet(true); }}
                onMouseEnter={playHover}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-4 py-2 bg-indigo-900/40 border border-indigo-400/30 rounded-lg font-semibold text-indigo-100 hover:bg-indigo-800/60 transition-all flex items-center justify-center gap-2"
              >
                {walletAddress ? 'Wallet Linked ✓' : t('link_wallet')}
                {!walletAddress && (
                  <span className="w-4 h-4 rounded-full bg-indigo-500/40 text-[10px] flex items-center justify-center border border-indigo-400 text-indigo-200">?</span>
                )}
              </motion.button>

              {/* Web3 Tooltip */}
              {!walletAddress && (
                <div className="absolute right-full top-0 mr-2 w-48 p-2 bg-black/90 border border-indigo-500/30 rounded-lg text-xs text-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  We use the Sepolia Testnet—a free testing network—to reward your learning with tokens at no cost to you.
                </div>
              )}
            </div>


            {/* Language Selector & Sound Toggle */}
            <div className="pt-2 border-t border-indigo-500/20 flex gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="flex-1 bg-indigo-950/50 border border-indigo-400/30 rounded-lg px-2 py-1 text-xs text-indigo-100 focus:outline-none"
              >
                {['English', 'Spanish', 'French', 'German', 'Hindi', 'Chinese', 'Nepali'].map(l => (
                  <option key={l} value={l} className="bg-indigo-900">{l}</option>
                ))}
              </select>

              <button
                onClick={toggleMute}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border ${isMuted ? 'bg-red-900/40 border-red-500/30 text-red-300' : 'bg-indigo-900/40 border-indigo-500/30 text-indigo-300'}`}
                title={isMuted ? "Unmute" : "Mute SFX"}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
          </div>
        </HUDCard>

        {/* Instructions */}
        <HUDCard title={t('controls')} position="bottom-left">
          <div className="text-sm space-y-1 text-indigo-200">
            <p className="flex items-center gap-2"><span>🖱️</span> <strong>Drag</strong> to rotate view</p>
            <p className="flex items-center gap-2"><span>🔍</span> <strong>Scroll</strong> to zoom</p>
            <p className="flex items-center gap-2"><span>✨</span> <strong>Click</strong> AI Core to interact</p>
          </div>
        </HUDCard>

        {/* Leaderboard Preview */}
        <HUDCard title="Top Performers" position="bottom-right">
          <div className="space-y-2 text-sm">
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, idx) => (
                <div key={entry.id} className="flex items-center gap-3">
                  <span className={`font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs ${idx === 0 ? 'bg-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.5)]' : idx === 1 ? 'bg-gray-300 text-black' : idx === 2 ? 'bg-orange-400 text-black' : 'bg-indigo-900 text-indigo-300'}`}>
                    {idx + 1}
                  </span>
                  <span className="text-xs text-indigo-100/80 truncate max-w-[80px]">
                    {entry.email.split('@')[0]}
                  </span>
                  <span className="ml-auto text-xs font-bold text-white">{entry.xp} XP</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-indigo-400 italic">{t('establishing')}</p>
            )}
          </div>
        </HUDCard>
      </UIOverlay>

      {/* Toggle UI Button */}
      <motion.button
        onClick={() => { playClick(); setShowUI(!showUI); }}
        onMouseEnter={playHover}
        whileHover={{ scale: 1.1, backgroundColor: "rgba(79, 70, 229, 0.9)" }}
        whileTap={{ scale: 0.9 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-2.5 bg-indigo-600/60 backdrop-blur-md rounded-full text-white font-bold z-50 border border-indigo-400/40 shadow-2xl transition-all"
      >
        {showUI ? t('immersive_view') : t('show_interface')}
      </motion.button>


      {/* Diagnostic Agent Modal */}
      {showDiagnostic && (
        <DiagnosticAgent
          userId={profile?.id}
          language={language}
          onComplete={(result) => {
            setDiagnosticResult(result);
            setShowDiagnostic(false);
          }}
          onClose={() => setShowDiagnostic(false)}
        />
      )}

      {/* Course Viewer Modal */}
      {showCourses && (
        <CourseViewer
          userId={profile?.id}
          onClose={() => setShowCourses(false)}
          onCompleteQuiz={handleCompleteQuiz}
        />
      )}

      {/* Wallet Linker Modal */}
      {showWallet && (
        <WalletLinker
          onClose={() => setShowWallet(false)}
          onSaved={(addr) => {
            setWalletAddress(addr);
            fetchLeaderboard();
          }}
          initialAddress={walletAddress}
        />
      )}

      {/* Auth Modal */}
      <AnimatePresence>
        {!user && (
          <Auth onSession={(u) => setUser(u)} />
        )}
      </AnimatePresence>
    </div>
  );
}
