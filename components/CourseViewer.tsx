'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { useSound } from '@/hooks/useSound';


interface Course {
    id: string;
    title: string;
    description: string;
    jsonb_content: any;
    skill_level: string;
}

interface CourseViewerProps {
    userId?: string;
    onClose: () => void;
    onCompleteQuiz: (xp: number) => void;
}

export default function CourseViewer({ userId, onClose, onCompleteQuiz }: CourseViewerProps) {
    const { t } = useLanguage();
    const { playSuccess } = useSound();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuizStep, setCurrentQuizStep] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [feedbackInputs, setFeedbackInputs] = useState<{ [key: number]: string }>({});
    const [isPersonalizing, setIsPersonalizing] = useState<number | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!userId) {
                setCourses([]);
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setCourses(data || []);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, [userId]);

    const handleStartQuiz = () => {
        setShowQuiz(true);
        setCurrentQuizStep(0);
        setQuizCompleted(false);
    };

    const handleCompleteQuiz = () => {
        setQuizCompleted(true);
        playSuccess();
        onCompleteQuiz(250); // Fixed XP for now
    };

    const handlePersonalize = async (moduleIndex: number) => {
        if (isPersonalizing !== null || !selectedCourse) return;
        const feedback = feedbackInputs[moduleIndex];
        if (!feedback) return;

        setIsPersonalizing(moduleIndex);
        try {
            const response = await fetch('/api/personalize-lesson', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: selectedCourse.id,
                    moduleIndex,
                    feedback,
                    language: t('lang_name') || 'English' // Fallback to context language
                })
            });

            const data = await response.json();
            if (data.success && data.updatedCourse) {
                // Update local state
                setCourses(prev => prev.map(c => c.id === selectedCourse.id ? data.updatedCourse : c));
                setSelectedCourse(data.updatedCourse);
                setFeedbackInputs({ ...feedbackInputs, [moduleIndex]: '' });
                playSuccess();
            } else {
                console.error('Failed to personalize:', data.error);
            }
        } catch (error) {
            console.error('Error in personalization flow:', error);
        } finally {
            setIsPersonalizing(null);
        }
    };

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 pointer-events-auto overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-indigo-950/40 border border-indigo-500/30 rounded-3xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-indigo-500/20 flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                        {t('lab_title')}
                    </h2>
                    <button onClick={onClose} className="text-indigo-300 hover:text-white transition-colors">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Course List Sidebar */}
                    <div className="w-80 border-r border-indigo-500/20 overflow-y-auto p-4 space-y-4">
                        <h3 className="text-indigo-400 font-semibold uppercase tracking-wider text-sm mb-4">{t('syllabi')}</h3>
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : courses.length === 0 ? (
                            <p className="text-indigo-300/60 text-sm italic">{t('no_courses')}</p>
                        ) : (
                            courses.map((course) => (
                                <button
                                    key={course.id}
                                    onClick={() => { setSelectedCourse(course); setShowQuiz(false); }}
                                    className={`w-full text-left p-4 rounded-xl transition-all border ${selectedCourse?.id === course.id
                                        ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                                        : 'bg-indigo-900/20 border-indigo-800/50 text-indigo-200 hover:bg-indigo-800/30'
                                        }`}
                                >
                                    <div className="font-bold truncate">{course.title}</div>
                                    <div className="text-xs opacity-70 mt-1 uppercase tracking-tighter">{course.skill_level}</div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {selectedCourse ? (
                                !showQuiz ? (
                                    <motion.div
                                        key={selectedCourse.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div>
                                            <h3 className="text-4xl font-extrabold text-white mb-2">{selectedCourse.title}</h3>
                                            <span className="px-3 py-1 bg-indigo-500/20 rounded-full text-xs font-bold text-indigo-300 uppercase">
                                                {selectedCourse.skill_level}
                                            </span>
                                        </div>

                                        <div className="space-y-6">
                                            {selectedCourse.jsonb_content.modules.map((module: any, idx: number) => (
                                                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h4 className="text-xl font-bold text-indigo-300">Module {idx + 1}: {module.title}</h4>
                                                    </div>
                                                    <p className="text-gray-300 leading-relaxed mb-6">{module.content}</p>

                                                    {/* Personalization Section */}
                                                    <div className="mt-4 pt-4 border-t border-white/5">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{t('personalize_lesson')}</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={feedbackInputs[idx] || ''}
                                                                onChange={(e) => setFeedbackInputs({ ...feedbackInputs, [idx]: e.target.value })}
                                                                placeholder={t('feedback_placeholder')}
                                                                className="flex-1 bg-black/40 border border-indigo-500/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                                                disabled={isPersonalizing !== null}
                                                            />
                                                            <button
                                                                onClick={() => handlePersonalize(idx)}
                                                                disabled={isPersonalizing !== null || !feedbackInputs[idx]}
                                                                className="px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 rounded-xl text-xs font-bold text-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {isPersonalizing === idx ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-3 h-3 border-2 border-indigo-300 border-t-transparent animate-spin rounded-full" />
                                                                        {t('personalizing')}
                                                                    </div>
                                                                ) : 'Apply AI Magic'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleStartQuiz}
                                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold text-white text-xl hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-900/40 transition-all border border-indigo-400/30"
                                        >
                                            {t('start_quiz')}
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="quiz"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="h-full flex flex-col items-center justify-center text-center space-y-6"
                                    >
                                        {!quizCompleted ? (
                                            <>
                                                <h3 className="text-3xl font-bold text-white">Quiz: {selectedCourse.title}</h3>
                                                <div className="p-8 bg-black/40 border border-indigo-400/20 rounded-2xl max-w-xl w-full">
                                                    <p className="text-xl text-indigo-100 mb-8">
                                                        Applying the concepts of {selectedCourse.jsonb_content.modules[0].title},
                                                        how would you optimize the current architectural pattern?
                                                    </p>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {["Scale horizontally", "Use an Edge Function", "Implement SSR", "Decentralize nodes"].map((opt) => (
                                                            <button
                                                                key={opt}
                                                                onClick={handleCompleteQuiz}
                                                                className="py-3 px-6 bg-indigo-900/50 hover:bg-indigo-600/50 border border-indigo-500/30 rounded-xl text-white transition-all text-left"
                                                            >
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <motion.div
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="space-y-6"
                                            >
                                                <div className="text-6xl mb-4">🏆</div>
                                                <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                                                    QUIZ COMPLETED!
                                                </h3>
                                                <p className="text-2xl text-white">+250 XP AWARDED</p>
                                                <button
                                                    onClick={() => { setShowQuiz(false); setQuizCompleted(false); }}
                                                    className="px-8 py-3 bg-indigo-500 text-white font-bold rounded-full hover:bg-indigo-400 transition-colors"
                                                >
                                                    Return to Syllabus
                                                </button>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-indigo-300/40 text-center">
                                    <div className="text-8xl mb-6 opacity-20">📚</div>
                                    <p className="text-xl italic">{t('select_course')}</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
