'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface WalletLinkerProps {
    userId?: string;
    onClose: () => void;
    onSaved: (address: string) => void;
    initialAddress?: string;
}

export default function WalletLinker({ userId, onClose, onSaved, initialAddress = '' }: WalletLinkerProps) {
    const [address, setAddress] = useState(initialAddress);
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSave = async () => {
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            setStatus('error');
            return;
        }

        setIsSaving(true);
        setStatus('idle');

        try {
            if (userId) {
                const { error } = await supabase
                    .from('profiles')
                    .update({ wallet_address: address })
                    .eq('id', userId);

                if (error) throw error;
            }

            setStatus('success');
            setTimeout(() => {
                onSaved(address);
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Error saving wallet:', error);
            setStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] pointer-events-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-900/90 border border-indigo-400/50 p-8 rounded-3xl w-full max-w-md shadow-2xl relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-indigo-300 hover:text-white"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-3xl">🦊</span> Link Ethereum Wallet
                </h3>

                <p className="text-indigo-200 text-sm mb-6">
                    Enter your Sepolia-compatible wallet address to receive **EDU Token** rewards if you reach the Top 5 on the leaderboard.
                </p>

                <div className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="0x..."
                            className={`w-full bg-indigo-950/50 border ${status === 'error' ? 'border-red-500' : 'border-indigo-400/30'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm`}
                        />
                        {status === 'error' && (
                            <p className="text-red-400 text-xs mt-2 font-semibold">Please enter a valid Ethereum address</p>
                        )}
                        {status === 'success' && (
                            <p className="text-green-400 text-xs mt-2 font-semibold">Wallet address linked successfully!</p>
                        )}
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving || status === 'success'}
                        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-bold text-white hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-50"
                    >
                        {isSaving ? 'Linking...' : status === 'success' ? 'Linked ✅' : 'Link Wallet Address'}
                    </button>

                    <p className="text-[10px] text-indigo-400/60 uppercase text-center tracking-widest mt-4">
                        Sepolia Testnet Rewards Only
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
