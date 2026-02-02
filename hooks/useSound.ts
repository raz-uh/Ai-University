'use client';

import { useState, useCallback, useEffect } from 'react';

// Simple sound synthesizer using Web Audio API to avoid external asset dependencies
const AudioContextClass = (typeof window !== 'undefined' ? (window.AudioContext || (window as any).webkitAudioContext) : null);

export function useSound() {
    const [isMuted, setIsMuted] = useState(false);
    const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

    useEffect(() => {
        if (AudioContextClass) {
            const ctx = new AudioContextClass();
            setAudioCtx(ctx);
            return () => {
                ctx.close();
            };
        }
    }, []);

    const playHover = useCallback(() => {
        if (isMuted || !audioCtx) return;

        // Create oscillator for a quick "click" or "hover" chirp
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    }, [isMuted, audioCtx]);

    const playClick = useCallback(() => {
        if (isMuted || !audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }, [isMuted, audioCtx]);

    const playSuccess = useCallback(() => {
        if (isMuted || !audioCtx) return;

        // Play a major chord arpeggio
        const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        const now = audioCtx.currentTime;

        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.type = 'sine';
            osc.frequency.value = freq;

            const startTime = now + i * 0.1;
            const duration = 0.5;

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    }, [isMuted, audioCtx]);

    const toggleMute = () => setIsMuted(prev => !prev);

    return { playHover, playClick, playSuccess, isMuted, toggleMute };
}
