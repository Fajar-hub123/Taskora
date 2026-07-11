'use client';
import { useId } from 'react';

export function TaskoraMark({ size = 40 }: { size?: number }) {
  const id = 'taskora-grad-' + useId();
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Taskora">
      <defs>
        <linearGradient id={id + '-ring'} x1="10" y1="15" x2="70" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#a855f7" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id={id + '-stem'} x1="60" y1="20" x2="60" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4338ca" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id={id + '-check'} x1="55" y1="55" x2="98" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#10b981" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>

      {/* Open "C" ring forming the outer sweep of the T-in-circle monogram */}
      <path
        d="M78 24.5C71 19 61.8 16 52 16 27.7 16 8 34.6 8 57.5S27.7 99 52 99"
        stroke={`url(#${id}-ring)`}
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />

      {/* Top bar of the T, growing out of the ring */}
      <rect x="52" y="17.5" width="42" height="15" rx="7.5" fill={`url(#${id}-ring)`} />

      {/* Vertical stem of the T */}
      <rect x="53" y="25" width="15" height="63" rx="7.5" fill={`url(#${id}-stem)`} />

      {/* Checkmark */}
      <path
        d="M62 70l11 11 26-26"
        stroke={`url(#${id}-check)`}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function TaskoraLogo({
  size = 40,
  withWordmark = true,
  className = ''
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <TaskoraMark size={size} />
      {withWordmark && (
        <span className="font-display font-semibold tracking-tight" style={{ fontSize: size * 0.55 }}>
          Task<span className="gradient-text">ora</span>
        </span>
      )}
    </div>
  );
}
