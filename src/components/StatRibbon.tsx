import React from 'react';
import { CourseConfig } from '../types';
import { calculateCourse, formatGrade, getGradeColorClass } from '../utils/gradeCalculations';

interface StatRibbonProps {
  courses: CourseConfig[];
  grades: Record<string, number | null>;
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
  gpa: number | null;
  academicStanding: string;
}

export const StatRibbon: React.FC<StatRibbonProps> = ({
  courses,
  grades,
  selectedCourseId,
  onSelectCourse,
  gpa,
  academicStanding,
}) => {
  return (
    <div className="bg-[#FAF7F2] dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 py-4 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Overall Academic Standing / GPA */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs flex items-center gap-3">
            <div>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Promedio Ponderado
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-amber-950 dark:text-amber-100 tabular-nums">
                  {formatGrade(gpa)}
                </span>
                <span className="text-xs text-stone-400">/ 20.0</span>
              </div>
            </div>
            <div className="h-8 w-px bg-stone-200 dark:bg-stone-700" />
            <div>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Rendimiento
              </div>
              <div className="text-xs font-extrabold text-stone-800 dark:text-stone-200 mt-0.5">
                {academicStanding}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Course Navigator Strips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {courses.map((course) => {
            const calc = calculateCourse(course, grades);
            const isSelected = course.id === selectedCourseId;
            const score = calc.isComplete ? calc.finalGrade : calc.accumulated;
            const isScorePositive = score !== null && score > 0;
            const colorMeta = getGradeColorClass(isScorePositive ? score : null);

            return (
              <button
                key={course.id}
                onClick={() => onSelectCourse(course.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl border text-left transition-all shrink-0 ${
                  isSelected
                    ? 'bg-white dark:bg-stone-800 border-amber-600 dark:border-amber-500 shadow-xs ring-2 ring-amber-500/20'
                    : 'bg-white/60 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-stone-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-stone-800 dark:text-stone-200 line-clamp-1 max-w-[120px]">
                    {course.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className={`font-black tabular-nums ${colorMeta.text}`}>
                      {isScorePositive ? formatGrade(score) : '—'}
                    </span>
                    <span className="text-stone-400 text-[10px]">
                      {calc.isComplete ? 'final' : 'acum.'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
