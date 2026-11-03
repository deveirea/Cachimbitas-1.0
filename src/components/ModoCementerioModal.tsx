import React, { useState } from 'react';
import { CourseConfig } from '../types';
import { calculateCourse, formatGrade, PASSING_GRADE, MERIT_GRADE, EXCELLENCE_GRADE } from '../utils/gradeCalculations';
import { CapybaraAvatar } from './CapybaraAvatar';
import { Flame, X, ShieldAlert, Sparkles, Wand2, Calculator } from 'lucide-react';

interface ModoCementerioModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseConfig;
  grades: Record<string, number | null>;
  onApplyGrades?: (newGrades: Record<string, number>) => void;
}

export const ModoCementerioModal: React.FC<ModoCementerioModalProps> = ({
  isOpen,
  onClose,
  course,
  grades,
  onApplyGrades,
}) => {
  const [targetGoal, setTargetGoal] = useState<11 | 14 | 16>(11);
  const [simulatedGrades, setSimulatedGrades] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const currentCalc = calculateCourse(course, grades);
  const missing = currentCalc.missingEvaluations;
  const accum = currentCalc.accumulated;

  // Total missing weight
  const totalMissingWeight = missing.reduce((s, m) => s + m.weight, 0);

  // Target score
  const targetScore = targetGoal;
  const pointsRemaining = Math.max(0, targetScore - accum);
  const neededAverage =
    totalMissingWeight > 0 ? pointsRemaining / totalMissingWeight : 0;

  // Diagnostic status
  const isAlreadyAchieved = accum >= targetScore;
  const isImpossible = !isAlreadyAchieved && (totalMissingWeight === 0 || neededAverage > 20.0);
  const isMiracle = !isAlreadyAchieved && neededAverage > 17.5 && neededAverage <= 20.0;
  const isHard = !isAlreadyAchieved && neededAverage > 14.0 && neededAverage <= 17.5;
  const isComfortable = !isAlreadyAchieved && neededAverage <= 14.0;

  let capyMood: 'scared' | 'great' | 'ok' | 'bad' = 'ok';
  let messageTitle = '';
  let messageSub = '';
  let badgeColor = '';

  if (missing.length === 0) {
    capyMood = currentCalc.finalGrade && currentCalc.finalGrade >= 11 ? 'great' : 'bad';
    messageTitle = '¡Ya tienes todas las notas registradas!';
    messageSub = `Tu nota final calculada es ${formatGrade(currentCalc.finalGrade)}.`;
    badgeColor = 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200';
  } else if (isAlreadyAchieved) {
    capyMood = 'great';
    messageTitle = `¡Meta alcanzada! Ya aseguraste los ${targetScore} puntos 🎉`;
    messageSub = 'Incluso con 00 en lo que falta, ya cumples tu objetivo.';
    badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300';
  } else if (isImpossible) {
    capyMood = 'scared';
    messageTitle = '😱 Matemáticamente fuera de alcance';
    messageSub = `Necesitarías ${neededAverage.toFixed(1)} en promedio, superando el límite de 20.0. Habla con tu profesor o enfoca esfuerzos en los otros cursos.`;
    badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300';
  } else if (isMiracle) {
    capyMood = 'scared';
    messageTitle = '🔥 Misión Milagro: Requiere perfección';
    messageSub = `Necesitas un promedio de ${neededAverage.toFixed(1)} en lo que falta. A sacar el 20 en los finales.`;
    badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300';
  } else if (isHard) {
    capyMood = 'ok';
    messageTitle = '💪 Desafiante pero alcanzable';
    messageSub = `Necesitas un promedio de ${neededAverage.toFixed(1)} en las evaluaciones restantes. Con estudio dedicado lo logras.`;
    badgeColor = 'bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300';
  } else {
    capyMood = 'great';
    messageTitle = '🌱 ¡Vas por buen camino!';
    messageSub = `Necesitas un promedio accesible de ${neededAverage.toFixed(1)} para alcanzar ${targetScore}.`;
    badgeColor = 'bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300';
  }

  const handleApplySimulated = () => {
    if (!onApplyGrades) return;
    const toApply: Record<string, number> = {};
    missing.forEach((m) => {
      const targetVal = isImpossible
        ? 20
        : Math.min(20, Math.max(0, Math.round(neededAverage * 10) / 10));
      toApply[m.id] = targetVal;
    });
    onApplyGrades(toApply);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-stone-800 bg-[#FAF7F2]/60 dark:bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>Modo Cementerio</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 font-semibold">
                  Rescate
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {course.name} · Diagnóstico y simulación de salvación
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Goal Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
              ¿Cuál es tu objetivo?
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100 dark:bg-stone-800/70 rounded-2xl">
              <button
                onClick={() => setTargetGoal(11)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  targetGoal === 11
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                Salvar (11.0)
              </button>
              <button
                onClick={() => setTargetGoal(14)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  targetGoal === 14
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                Mérito (14.0)
              </button>
              <button
                onClick={() => setTargetGoal(16)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  targetGoal === 16
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                Excelencia (16.0)
              </button>
            </div>
          </div>

          {/* Diagnostic Hero Banner */}
          <div className={`p-4 rounded-2xl flex items-center gap-4 ${badgeColor}`}>
            <CapybaraAvatar
              outfit="none"
              mood={capyMood}
              size={65}
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold uppercase tracking-wider opacity-80">
                Diagnóstico Capi
              </div>
              <div className="text-sm font-bold mt-0.5 leading-snug">
                {messageTitle}
              </div>
              <div className="text-xs mt-1 opacity-90 leading-relaxed">
                {messageSub}
              </div>
            </div>
          </div>

          {/* Key Numbers Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800">
              <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Puntos acumulados
              </div>
              <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 tabular-nums">
                {accum.toFixed(1)}
                <span className="text-xs font-normal text-stone-400 ml-1">/ 20.0</span>
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                Aporte de notas ya ingresadas
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
              <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                Promedio requerido
              </div>
              <div className="text-2xl font-extrabold text-amber-900 dark:text-amber-300 mt-1 tabular-nums">
                {isAlreadyAchieved ? '0.0' : neededAverage > 20 ? '> 20' : neededAverage.toFixed(1)}
              </div>
              <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                En cada evaluación restante
              </div>
            </div>
          </div>

          {/* Missing Evaluations List */}
          {missing.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Evaluaciones pendientes ({missing.length})
                </span>
                <span className="text-xs text-stone-400">
                  Peso total restante: {Math.round(totalMissingWeight * 100)}%
                </span>
              </div>
              <div className="space-y-2">
                {missing.map((item) => {
                  const reqScore = isAlreadyAchieved
                    ? 0
                    : targetGoal === 11
                    ? item.neededFor11
                    : targetGoal === 14
                    ? item.neededFor14
                    : item.neededFor16;

                  const isFeasible = reqScore !== null && reqScore <= 20.0;
                  const displayScore =
                    reqScore === null
                      ? 'Variable'
                      : isAlreadyAchieved
                      ? '0.0'
                      : reqScore > 20
                      ? 'Imposible (>20)'
                      : reqScore.toFixed(1);

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/50 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          Pesa aprox. {Math.round(item.weight * 100)}% del curso
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-extrabold tabular-nums ${
                            !isFeasible && !isAlreadyAchieved
                              ? 'text-rose-600 dark:text-rose-400'
                              : isAlreadyAchieved || (reqScore !== null && reqScore <= 12)
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {displayScore}
                        </div>
                        <div className="text-[10px] text-stone-400">mínimo necesario</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-[#FAF7F2]/50 dark:bg-stone-900/50 flex items-center justify-between gap-3">
          {missing.length > 0 && !isImpossible && onApplyGrades && (
            <button
              onClick={handleApplySimulated}
              className="px-4 py-2 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Simular estas notas</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 dark:bg-stone-700 dark:hover:bg-stone-600 rounded-xl shadow-sm transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
