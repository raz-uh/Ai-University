'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthProps {
    onSession: (user: any) => void;
}

export default function Auth({ onSession }: AuthProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = isLogin
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({ email, password });

            if (error) throw error;
            if (data.user) onSession(data.user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-md bg-indigo-950/40 border border-indigo-500/30 backdrop-blur-xl p-8 rounded-2xl shadow-2xl"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Academic</h2>
                    <p className="text-indigo-300 text-sm">Secure your progress and earn rewards</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-indigo-900/40 border border-indigo-400/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-400/50 transition-all"
                            placeholder="cadet@ai-university.edu"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1 ml-1">Access Key (Password)</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-indigo-900/40 border border-indigo-400/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-400/50 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-red-400 text-sm text-center font-medium bg-red-400/10 py-2 rounded-lg"
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : isLogin ? 'Infiltrate System' : 'Establish Profile'}
                    </motion.button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-indigo-300 hover:text-white text-sm transition-colors"
                    >
                        {isLogin ? "New here? Create a profile" : "Already established? Sign in"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
