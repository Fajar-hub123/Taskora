'use client';
import confetti from 'canvas-confetti';

export function useConfetti() {
  return () => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#a78bfa', '#60a5fa', '#2dd4bf', '#34d399']
    });
  };
}
