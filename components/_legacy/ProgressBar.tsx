import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'green' | 'red' | 'blue' | 'yellow';
}

const COLOR_MAP = {
  green: 'bg-green-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
};

export default function ProgressBar({ value, max, color = 'blue' }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const displayPercentage = Math.round(percentage);

  return (
    <div
      className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-4"
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${COLOR_MAP[color]}`}
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-label={`Progresso: ${displayPercentage}%`}
        aria-valuenow={displayPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
