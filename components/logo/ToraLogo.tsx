'use client';
import { useId } from 'react';

export function ToraLogo({ size = 40, rounded = true }: { size?: number; rounded?: boolean }) {
  const id = 'tora-grad-' + useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Tora"
    >
      {rounded && <rect width="120" height="120" rx="28" fill="#0b0e1a" />}
      <defs>
        <linearGradient id={id + '-top'} x1="20" y1="30" x2="100" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#a855f7" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id={id + '-stem'} x1="60" y1="35" x2="60" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3730a3" />
          <stop offset="0.55" stopColor="#2563eb" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id={id + '-check'} x1="58" y1="55" x2="98" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <path
        d="M32 30c0-8 6.5-14.5 14.5-14.5h39c8 0 14.5 6.5 14.5 14.5s-6.5 14.5-14.5 14.5H67.5v6.5c0 8-6.5 14.5-14.5 14.5-6.6 0-12.1-4.4-13.9-10.4C34.7 51.6 32 44 32 30z"
        fill={`url(#${id}-top)`}
      />
      <path d="M46 44.5h15v40c0 8-6.7 14.5-15 14.5-8 0-14.4-6-14.9-13.7 3.7 3.2 8.6 3.2 12.4-1.1 2.6-2.9 2.5-6.6 2.5-9.7v-30z" fill={`url(#${id}-stem)`} />
      <path
        d="M63 87c-13 0-23.5-10.2-23.5-22.8 0-1.7 1.4-3 3-3s3 1.3 3 3C45.5 74 53.2 81 63 81c1.7 0 3 1.3 3 3s-1.3 3-3 3z"
        fill={`url(#${id}-check)`}
      />
      <path
        d="M56.5 68.5l9 9 20-20"
        stroke={`url(#${id}-check)`}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
