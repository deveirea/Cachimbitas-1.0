import React from 'react';
import { formatGrade, PASSING_GRADE } from '../utils/gradeCalculations';
import { Check, X, AlertTriangle } from 'lucide-react';

interface CircularGradeProgressProps {
  score: number | null;
  isComplete: boolean;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showStatusBadge?: boolean;
}

export const CircularGradeProgress: React.FC<CircularGradeProgressProps> = ({
  score,
  isComplete,
  size = 88,
  strokeWidth = 7,
  className = '',
  showStatusBadge = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const validScore = score !== null && !isNaN(score) ? Math.min(20, Math.max(0, score)) : null;
  const percentage = validScore !== null ? (validScore / 20) * 100 : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Passing threshold line (11/20 = 55%)
  const passingAngle = 55 * 3.6; // degrees

  // Determine status
  const isApproved = validScore !== null && validScore >= PASSING_GRADE;
  const isFailed = isComplete && validScore !== null && validScore < PASSING_GRADE;
  const isInDanger = !isComplete && validScore !== null && validScore < PASSING_GRADE;
  const isEmpty = validScore === null || validScore === 0;

  let strokeColor = '#d6d3d1'; // stone-300
  let textColor = 'text-stone-700 dark:text-stone-300';
  let badgeColor = 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400';
  let statusText = 'En curso';
  let StatusIcon: React.ReactNode = null;

  if (isApproved) {
    strokeColor = validScore >= 14 ? '#059669' : '#10b981'; // emerald
    textColor = 'text-emerald-600 dark:text-emerald-400';
    badgeColor = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30';
    statusText = 'Aprobado';
    StatusIcon = <Check className="w-3 h-3 stroke-[3]" />;
  } else if (isFailed) {
    strokeColor = '#e11d48'; // rose-600
    textColor = 'text-rose-600 dark:text-rose-400';
    badgeColor = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30';
    statusText = 'Jalado';
    StatusIcon = <X className="w-3 h-3 stroke-[3]" />;
  } else if (isInDanger) {
    strokeColor = validScore > 7 ? '#d97706' : '#e11d48'; // amber or rose
    textColor = validScore > 7 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';
    badgeColor = validScore > 7
      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'
      : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30';
    statusText = validScore > 7 ? 'En riesgo' : 'Jalado prov.';
    StatusIcon = <AlertTriangle className="w-3 h-3" />;
  } else {
    statusText = 'Sin notas';
  }

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-stone-200 dark:text-stone-800"
            fill="transparent"
          />
          {/* Active Filled Gauge */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Numeric Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
          <span className={`text-xl font-black tabular-nums tracking-tight leading-none ${textColor}`}>
            {formatGrade(validScore)}
          </span>
          <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 mt-0.5">
            / 20
          </span>
        </div>
      </div>

      {/* Visual Status Indicator (Aprobado / Jalado) */}
      {showStatusBadge && (
        <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${badgeColor}`}>
          {StatusIcon}
          <span>{statusText}</span>
        </div>
      )}
    </div>
  );
};
