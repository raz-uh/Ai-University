'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HUDCard } from './UIOverlay';
import { useLanguage } from '@/context/LanguageContext';

interface DiagnosticAgentProps {
    userId?: string;
    language?: string;
    onComplete: (result: any) => void;
    onClose: () => void;
}

export default function DiagnosticAgent({ userId, language = 'English', onComplete, onClose }: DiagnosticAgentProps) {
    const { t } = useLanguage();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [responses, setResponses] = useState<string[]>(['', '', '', '', '', '', '', '']);
    const [isFetchingStage2, setIsFetchingStage2] = useState(false);
    const [dynamicQuestions, setDynamicQuestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [thinkingIndex, setThinkingIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const STAGE1_QUESTIONS = [t('q1'), t('q2'), t('q3'), t('q4'), t('q5')];
    const ALL_QUESTIONS = [...STAGE1_QUESTIONS, ...dynamicQuestions];
    const THINKING_MESSAGES = [t('thinking1'), t('thinking2'), t('thinking3'), t('thinking4')];

    // Cycle thinking messages
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            interval = setInterval(() => {
                setThinkingIndex(prev => (prev + 1) % THINKING_MESSAGES.length);
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isLoading, THINKING_MESSAGES.length]);

    const handleInputChange = (value: string) => {
        const newResponses = [...responses];
        newResponses[currentQuestion] = value;
        setResponses(newResponses);
    };

    const handleNext = async () => {
        if (currentQuestion === 4 && dynamicQuestions.length === 0) {
            // End of Stage 1 - Fetch Dynamic Questions
            await fetchStage2Questions();
        } else if (currentQuestion < ALL_QUESTIONS.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            handleSubmit();
        }
    };

    const fetchStage2Questions = async () => {
        setIsFetchingStage2(true);
        setError(null);
        try {
            const topic = responses[2]; // Topic from Q3
            const skillLevel = responses[0]; // Experience from Q1

            const response = await fetch('/api/diagnostic/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, skillLevel, language }),
            });

            const data = await response.json();
            if (data.success && data.questions) {
                setDynamicQuestions(data.questions);
                setCurrentQuestion(5); // Move to first dynamic question
            } else {
                setError('Failed to load specific questions. Proceeding with general assessment.');
                handleSubmit(); // Fallback to submit with just 5? No, API expects 8 now.
            }
        } catch (err) {
            setError('Network error loading deep-dive questions.');
        } finally {
            setIsFetchingStage2(false);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/diagnostic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ responses, userId, language }),
            });

            const data = await response.json();

            if (data.success) {
                onComplete(data);
            } else {
                setError(data.error || 'Diagnostic failed. Please check your AI API key.');
                console.error('Diagnostic failed:', data.error);
            }
        } catch (err: any) {
            setError('Network error. Please ensure the server is running.');
            console.error('Error submitting diagnostic:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative w-full max-w-2xl"
            >
                <div className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 backdrop-blur-xl rounded-3xl p-8 border border-indigo-400/30 shadow-2xl">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-indigo-200 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {t('diagnostic_title')}
                        </h2>
                        <p className="text-indigo-200">
                            Question {currentQuestion + 1} of {ALL_QUESTIONS.length || 5}
                            {currentQuestion >= 5 && <span className="ml-2 text-xs text-indigo-400 italic">(Technical Deep Dive)</span>}
                        </p>
                        <div className="mt-4 w-full bg-indigo-950 rounded-full h-2">
                            <motion.div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentQuestion + 1) / (ALL_QUESTIONS.length || 5)) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* Error Display */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Question */}
                    <AnimatePresence mode="wait">
                        {isFetchingStage2 ? (
                            <motion.div
                                key="fetching"
                                className="h-48 flex flex-col items-center justify-center space-y-4"
                            >
                                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent animate-spin rounded-full" />
                                <p className="text-indigo-200 animate-pulse">{t('q_dynamic_thinking')}</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={currentQuestion}
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -50, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mb-6"
                            >
                                {currentQuestion === 5 && (
                                    <p className="text-sm font-bold text-indigo-400 mb-4 bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
                                        ✨ {t('q_dynamic_intro')}
                                    </p>
                                )}
                                <label className="block text-xl text-white mb-4">
                                    {ALL_QUESTIONS[currentQuestion]}
                                </label>
                                <textarea
                                    value={responses[currentQuestion]}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    placeholder="Type your answer here..."
                                    className="w-full h-32 px-4 py-3 bg-indigo-950/50 border border-indigo-500/50 rounded-lg text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    disabled={isLoading || isFetchingStage2}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center">
                        <motion.button
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-2 bg-indigo-900/50 border border-indigo-500/50 rounded-lg font-semibold text-white hover:bg-indigo-800/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {t('previous')}
                        </motion.button>

                        <motion.button
                            onClick={handleNext}
                            disabled={!responses[currentQuestion]?.trim() || isLoading || isFetchingStage2}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-semibold text-white hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg min-w-[140px]"
                        >
                            {isLoading || isFetchingStage2 ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={thinkingIndex}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="text-xs"
                                        >
                                            {isFetchingStage2 ? 'Thinking...' : THINKING_MESSAGES[thinkingIndex]}
                                        </motion.span>
                                    </AnimatePresence>
                                </span>
                            ) : currentQuestion === ALL_QUESTIONS.length - 1 && ALL_QUESTIONS.length > 5 ? (
                                t('submit')
                            ) : (
                                t('next')
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
