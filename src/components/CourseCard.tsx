import React, { useState } from 'react';
import { CourseConfig } from '../types';
import {
  calculateCourse,
  formatGrade,
  getGradeColorClass,
  PASSING_GRADE,
} from '../utils/gradeCalculations';
import { CircularGradeProgress } from './CircularGradeProgress';
import { ShieldAlert, RotateCcw, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface CourseCardProps {
  course: CourseConfig;
  grades: Record<string, number | null>;
  onGradeChange: (fieldId: string, val: number | null) => void;
  onClearCourse: (courseId: string) => void;
  onOpenGraveMode: (course: CourseConfig) => void;
  onQuickFillCourse?: (course: CourseConfig, grade: number) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  grades,
  onGradeChange,
  onClearCourse,
  onOpenGraveMode,
  onQuickFillCourse,
}) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const calc = calculateCourse(course, grades);
  const currentDisplayGrade = calc.isComplete ? calc.finalGrade : calc.accumulated;

  // Helper to get grade value
  const getVal = (id: string): string => {
    const val = grades[id];
    if (val === null || val === undefined || isNaN(val)) return '';
    return val.toString();
  };

  const handleInputChange = (id: string, text: string) => {
    if (text.trim() === '') {
      onGradeChange(id, null);
      return;
    }
    const num = parseFloat(text);
    if (!isNaN(num)) {
      const clamped = Math.min(20, Math.max(0, num));
      onGradeChange(id, clamped);
    }
  };

  const handleStep = (id: string, delta: number) => {
    const current = grades[id];
    const base = current !== null && current !== undefined ? current : 10;
    const next = Math.min(20, Math.max(0, Math.round((base + delta) * 10) / 10));
    onGradeChange(id, next);
  };

  // Find hint for this item
  const getItemHint = (itemId: string): { text: string; color: string } | null => {
    if (grades[itemId] !== null && grades[itemId] !== undefined) return null;
    const missingItem = calc.missingEvaluations.find((m) => m.id === itemId);
    if (!missingItem) return null;

    if (calc.accumulated >= PASSING_GRADE) {
      return { text: '¡Ya aseguraste 11! (min: 0.0)', color: 'text-emerald-600 dark:text-emerald-400' };
    }

    const needed = missingItem.neededFor11;
    if (needed === null) return null;
    if (needed > 20.0) {
      return { text: `Imposible (${needed.toFixed(1)})`, color: 'text-rose-600 dark:text-rose-400 font-bold' };
    }
    if (needed <= 0) {
      return { text: 'Min: 0.0 para pasar', color: 'text-emerald-600 dark:text-emerald-400' };
    }
    if (needed <= 11.5) {
      return { text: `Min: ${needed.toFixed(1)} para pasar`, color: 'text-emerald-600 dark:text-emerald-400' };
    }
    if (needed <= 15.0) {
      return { text: `Min: ${needed.toFixed(1)} para pasar`, color: 'text-amber-600 dark:text-amber-400' };
    }
    return { text: `Min: ${needed.toFixed(1)} (¡A estudiar!)`, color: 'text-rose-600 dark:text-rose-400 font-semibold' };
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Top Banner with Circular Gauge */}
      <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-stone-50/70 via-white to-amber-50/30 dark:from-stone-900 dark:via-stone-900 dark:to-stone-900">
        <div className="flex items-start sm:items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {course.name}
              </h3>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                {course.credits} créditos
              </span>
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex flex-wrap items-center gap-2">
              <span>{course.code || 'Asignatura Universitaria'}</span>
              <span>·</span>
              <button
                type="button"
                onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                className="hover:text-amber-800 dark:hover:text-amber-400 flex items-center gap-1 transition-colors font-medium"
              >
                <span>Fórmula y ponderaciones</span>
                {showFormulaDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Circular Progress Meter */}
        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-stone-100 dark:border-stone-800">
          <div className="text-left md:text-right">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              {calc.isComplete ? 'Nota Final' : 'Puntos Acumulados'}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">
              {calc.isComplete ? 'Evaluaciones completadas' : `${calc.missingEvaluations.length} pendientes`}
            </div>
          </div>

          {/* DYNAMIC CIRCULAR PROGRESS GAUGE */}
          <CircularGradeProgress
            score={currentDisplayGrade}
            isComplete={calc.isComplete}
            size={84}
            strokeWidth={7}
            showStatusBadge={true}
          />
        </div>
      </div>

      {/* Formula breakdown drawer (if toggled) */}
      {showFormulaDetails && (
        <div className="px-6 py-4 bg-stone-50/90 dark:bg-stone-800/60 border-b border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 space-y-1.5 animate-in fade-in duration-150">
          <div className="font-bold text-stone-800 dark:text-stone-200">
            Reglamento de Calificación Oficial:
          </div>
          {course.groups.map((group) => (
            <div key={group.id} className="flex justify-between items-center text-[11px] py-0.5">
              <span>
                • {group.name} {group.description ? `(${group.description})` : ''}
              </span>
              <span className="font-extrabold tabular-nums text-stone-800 dark:text-stone-200">
                {Math.round(group.weightInCourse * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Linear Track towards 11.0 */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 mb-1.5">
          <span>Puntaje acumulado hacia la meta (11.0 para aprobar)</span>
          <span className="tabular-nums font-bold">
            {calc.accumulated.toFixed(1)} / 11.0 ({calc.progressPercent}%)
          </span>
        </div>
        <div className="relative h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              calc.accumulated >= PASSING_GRADE
                ? 'bg-emerald-500'
                : calc.accumulated >= 8
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(100, (calc.accumulated / 20) * 100)}%` }}
          />
          {/* Tick mark at 11/20 (55%) */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-stone-400 dark:bg-stone-500 z-10"
            style={{ left: '55%' }}
            title="Línea de Aprobación: 11.0"
          />
        </div>
      </div>

      {/* Groups & Inputs Section */}
      <div className="p-6 space-y-6">
        {course.groups.map((group) => (
          <div key={group.id} className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {group.name}
              </span>
              <span className="text-[11px] font-semibold text-stone-400">
                Pesa {Math.round(group.weightInCourse * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.items.map((item) => {
                const currentVal = grades[item.id];
                const inputColor = getGradeColorClass(currentVal);
                const hint = getItemHint(item.id);

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-stone-50/70 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-800 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <label
                        htmlFor={item.id}
                        className="text-xs font-semibold text-stone-700 dark:text-stone-300 truncate"
                        title={item.name}
                      >
                        {item.shortName || item.name}
                      </label>
                      {currentVal !== null && currentVal !== undefined && (
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${inputColor.badge}`}>
                          {currentVal >= 11 ? 'Aprob' : 'Jalado'}
                        </span>
                      )}
                    </div>

                    {/* Numeric Input + Quick Steppers */}
                    <div className="relative flex items-center">
                      <input
                        id={item.id}
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        placeholder="Nota (0-20)"
                        value={getVal(item.id)}
                        onChange={(e) => handleInputChange(item.id, e.target.value)}
                        className={`w-full py-2 px-3 text-center text-base font-extrabold rounded-xl border transition-all outline-none tabular-nums ${
                          currentVal !== null && currentVal !== undefined
                            ? `${inputColor.bg} ${inputColor.text} ${inputColor.border} focus:ring-2 focus:ring-amber-500/20`
                            : 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-700 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20'
                        }`}
                      />
                      <div className="absolute right-1 flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleStep(item.id, -1)}
                          className="w-5 h-6 rounded flex items-center justify-center text-xs text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-700 transition-colors"
                          title="Restar 1 punto"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStep(item.id, 1)}
                          className="w-5 h-6 rounded flex items-center justify-center text-xs text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-700 transition-colors"
                          title="Sumar 1 punto"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Real-time hint under empty input */}
                    <div className="min-h-[18px] mt-1.5 text-center">
                      {hint && (
                        <span className={`text-[10px] leading-tight block truncate ${hint.color}`}>
                          {hint.text}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions Bar */}
      <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-[#FAF7F2]/40 dark:bg-stone-900/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenGraveMode(course)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Modo Cementerio</span>
          </button>

          {onQuickFillCourse && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-stone-400">
              <span>Probar con:</span>
              <button
                onClick={() => onQuickFillCourse(course, 11)}
                className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold transition-colors"
              >
                11
              </button>
              <button
                onClick={() => onQuickFillCourse(course, 14)}
                className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold transition-colors"
              >
                14
              </button>
              <button
                onClick={() => onQuickFillCourse(course, 16)}
                className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold transition-colors"
              >
                16
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => onClearCourse(course.id)}
          className="px-3 py-1.5 rounded-xl text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-1.5"
          title="Borrar todas las notas de este curso"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Limpiar curso</span>
        </button>
      </div>
    </div>
  );
};
