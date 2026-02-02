'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface UIOverlayProps {
    children: ReactNode;
    show: boolean;
}

export default function UIOverlay({ children, show }: UIOverlayProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="absolute inset-0 pointer-events-none"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

interface HUDCardProps {
    title: string;
    children: ReactNode;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

export function HUDCard({ title, children, position = 'top-right' }: HUDCardProps) {
    const positionClasses = {
        'top-left': 'top-8 left-8',
        'top-right': 'top-8 right-8',
        'bottom-left': 'bottom-8 left-8',
        'bottom-right': 'bottom-8 right-8',
        'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            className={`absolute ${positionClasses[position]} pointer-events-auto`}
        >
            <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 backdrop-blur-xl rounded-2xl p-6 border border-indigo-400/30 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-3 bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
                    {title}
                </h3>
                <div className="text-indigo-100">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}
