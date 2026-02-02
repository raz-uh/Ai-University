'use client';

import { useProgress } from '@react-three/drei';
import { motion } from 'framer-motion';

export default function Loader() {
    const { progress } = useProgress();

    return (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-[100]">
            <div className="w-64 space-y-4">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 text-center animate-pulse">
                    Initializing Core...
                </h2>

                {/* Progress Bar Container */}
                <div className="h-2 w-full bg-indigo-950 rounded-full overflow-hidden border border-indigo-500/30">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'spring', stiffness: 50 }}
                    />
                </div>

                <div className="flex justify-between text-xs text-indigo-400 font-mono">
                    <span>LOADING ASSETS</span>
                    <span>{progress.toFixed(0)}%</span>
                </div>
            </div>
        </div>
    );
}
