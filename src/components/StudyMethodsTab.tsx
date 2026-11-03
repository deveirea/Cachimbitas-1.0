import React, { useState, useEffect, useRef, useMemo } from 'react';
import { OutfitId, CapySkin } from '../types';
import { CapybaraAvatar } from './CapybaraAvatar';
import { audioAlerts } from '../utils/audioAlerts';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
  CloudRain,
  Flame,
  Coffee,
  CheckCircle2,
  BookOpen,
  Calculator,
  Compass,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudyMethodsTabProps {
  outfit: OutfitId;
  skin: CapySkin;
}

type MethodKey = 'pomodoro' | 'ritmo' | 'deepwork' | 'custom';

interface MethodDef {
  key: MethodKey;
  title: string;
  subtitle: string;
  badge: string;
  idealFor: string;
  focusMin: number;
  breakMin: number;
  longBreakMin: number;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  whyThis: string;
}

const METHODS: MethodDef[] = [
  {
    key: 'pomodoro',
    title: 'Lectura & Repaso',
    subtitle: 'Pomodoro 25 / 5 min',
    badge: 'Lecturas rápidas',
    idealFor: 'Diapositivas, resúmenes, lecturas densas y memorización.',
    focusMin: 25,
    breakMin: 5,
    longBreakMin: 15,
    accentBg: 'bg-rose-500/10 dark:bg-rose-950/30',
    accentBorder: 'border-rose-400 dark:border-rose-700',
    accentText: 'text-rose-700 dark:text-rose-300',
    whyThis: 'Evita la procrastinación en textos aburridos. 25 minutos pasan volando y el descanso de 5 min mantiene tu atención despierta.',
  },
  {
    key: 'ritmo',
    title: 'Práctica & Ejercicios',
    subtitle: 'Ritmo 50 / 10 min',
    badge: 'Más recomendado',
    idealFor: 'Matemática, Física, ejercicios de cálculo y programación.',
    focusMin: 50,
    breakMin: 10,
    longBreakMin: 20,
    accentBg: 'bg-amber-500/10 dark:bg-amber-950/30',
    accentBorder: 'border-amber-400 dark:border-amber-700',
    accentText: 'text-amber-700 dark:text-amber-300',
    whyThis: '25 min te cortarían a la mitad de un problema matemático largo. Con 50 min logras resolver guías completas y tienes 10 min para estirarte.',
  },
  {
    key: 'deepwork',
    title: 'Amanecida & Proyecto',
    subtitle: 'Deep Work 90 / 20 min',
    badge: 'Máxima inmersión',
    idealFor: 'Monografías, proyectos finales, informes de laboratorio y tesis.',
    focusMin: 90,
    breakMin: 20,
    longBreakMin: 30,
    accentBg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
    accentBorder: 'border-emerald-400 dark:border-emerald-700',
    accentText: 'text-emerald-700 dark:text-emerald-300',
    whyThis: 'Para sesiones donde apagas el celular. 90 minutos de concentración pura permiten al cerebro alcanzar el estado de flujo (flow) total.',
  },
];

export const StudyMethodsTab: React.FC<StudyMethodsTabProps> = ({ outfit, skin }) => {
  const [selectedMethodKey, setSelectedMethodKey] = useState<MethodKey>('ritmo');
  const [timerPhase, setTimerPhase] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(50 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [soundChoice, setSoundChoice] = useState<'zen' | 'boing' | 'break'>('zen');
  const [isRainActive, setIsRainActive] = useState<boolean>(false);

  // Quick Session Calculator
  const [calcTotalHours, setCalcTotalHours] = useState<number>(3);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeMethod = useMemo(() => {
    return METHODS.find((m) => m.key === selectedMethodKey) || METHODS[1];
  }, [selectedMethodKey]);

  // Total duration in seconds for progress bar
  const totalPhaseSeconds = useMemo(() => {
    return timerPhase === 'focus' ? activeMethod.focusMin * 60 : activeMethod.breakMin * 60;
  }, [timerPhase, activeMethod]);

  // Handle switching method
  const handleSelectMethod = (key: MethodKey) => {
    setSelectedMethodKey(key);
    const chosen = METHODS.find((m) => m.key === key) || METHODS[1];
    setIsRunning(false);
    setTimerPhase('focus');
    setTimeLeft(chosen.focusMin * 60);
  };

  // Play test sound
  const handleTestSound = (type: 'zen' | 'boing' | 'break') => {
    setSoundChoice(type);
    if (type === 'zen') audioAlerts.playZenChime();
    else if (type === 'boing') audioAlerts.playCapyBoing();
    else audioAlerts.playBreakEndAlert();
  };

  // Timer Tick Effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Phase completed!
            if (timerPhase === 'focus') {
              if (soundChoice === 'zen') audioAlerts.playZenChime();
              else if (soundChoice === 'boing') audioAlerts.playCapyBoing();
              else audioAlerts.playBreakEndAlert();

              confetti({
                particleCount: 35,
                spread: 50,
                origin: { y: 0.6 },
              });

              setTimerPhase('break');
              setCompletedCycles((c) => c + 1);
              return activeMethod.breakMin * 60;
            } else {
              audioAlerts.playBreakEndAlert();
              setTimerPhase('focus');
              return activeMethod.focusMin * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timerPhase, activeMethod, soundChoice]);

  // Toggle ambient rain
  const handleToggleRain = () => {
    const isPlaying = audioAlerts.toggleAmbientRain(!isRainActive);
    setIsRainActive(isPlaying);
  };

  // Cleanup rain on unmount
  useEffect(() => {
    return () => {
      audioAlerts.toggleAmbientRain(false);
    };
  }, []);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Adjust time by delta
  const handleAdjustTime = (deltaMinutes: number) => {
    setTimeLeft((prev) => Math.max(60, prev + deltaMinutes * 60));
  };

  // Reset current phase
  const handleResetPhase = () => {
    setIsRunning(false);
    setTimeLeft(timerPhase === 'focus' ? activeMethod.focusMin * 60 : activeMethod.breakMin * 60);
  };

  // Calculated session plan
  const calculatedPlan = useMemo(() => {
    const totalMinutes = calcTotalHours * 60;
    const blockDuration = 50 + 10; // default to 50/10 ritmo
    const blocksCount = Math.max(1, Math.floor(totalMinutes / blockDuration));
    const focusMinutes = blocksCount * 50;
    const breakMinutes = Math.max(0, (blocksCount - 1) * 10);
    return {
      blocksCount,
      focusMinutes,
      breakMinutes,
    };
  }, [calcTotalHours]);

  const progressPercent = Math.min(
    100,
    Math.max(0, ((totalPhaseSeconds - timeLeft) / totalPhaseSeconds) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CapybaraAvatar
            outfit={outfit}
            skin={skin}
            mood={isRunning ? (timerPhase === 'focus' ? 'great' : 'happy') : 'ok'}
            size={56}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-stone-900 dark:text-stone-100 tracking-tight">
                Métodos de Estudio & Concentración
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                CapiTimer
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-xl">
              Diferenciados por tipo de curso universitario: no es lo mismo leer diapositivas de historia que resolver una guía de cálculo de 4 horas.
            </p>
          </div>
        </div>

        {/* Ambient Noise Quick Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleRain}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 ${
              isRainActive
                ? 'bg-blue-500 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
            }`}
          >
            <CloudRain className="w-4 h-4" />
            <span>{isRainActive ? 'Lluvia activada 🌧️' : 'Sonido de lluvia'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Selector on the left, Timer on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Clear Choice Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-1">
            ¿Qué vas a estudiar ahora? Elige tu método:
          </div>

          <div className="grid grid-cols-1 gap-3">
            {METHODS.map((m) => {
              const isSelected = selectedMethodKey === m.key;
              return (
                <div
                  key={m.key}
                  onClick={() => handleSelectMethod(m.key)}
                  className={`p-4 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? `${m.accentBorder} ${m.accentBg} shadow-sm ring-2 ring-amber-500/10`
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm ${
                          isSelected
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {m.key === 'pomodoro' ? '🍅' : m.key === 'ritmo' ? '⚡' : '🧠'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">
                            {m.title}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                            {m.subtitle}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mt-0.5">
                          Para: {m.idealFor}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2 py-1 rounded-xl whitespace-nowrap ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                      }`}
                    >
                      {m.badge}
                    </span>
                  </div>

                  {/* Why this method explanation */}
                  <div className="mt-3 pt-3 border-t border-stone-200/60 dark:border-stone-800/60 flex items-start gap-2 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0">💡 ¿Por qué?</span>
                    <p>{m.whyThis}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Study Calculator Box */}
          <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wide">
                  Calculador Inteligente: ¿Cuántas horas tienes hoy?
                </h4>
              </div>
              <span className="text-sm font-black text-amber-900 dark:text-amber-300">
                {calcTotalHours} horas totales
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={calcTotalHours}
                onChange={(e) => setCalcTotalHours(parseFloat(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-stone-800 dark:text-stone-200">
                  Plan sugerido por la Capi: <strong>{calculatedPlan.blocksCount} bloques de estudio</strong>
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  {calculatedPlan.focusMinutes} min de enfoque neto + {calculatedPlan.breakMinutes} min de pausas para estirarse.
                </p>
              </div>

              <button
                onClick={() => handleSelectMethod('ritmo')}
                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 transition-colors shadow-xs shrink-0 flex items-center gap-1"
              >
                <span>Usar 50/10</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Sleek Focus Timer */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden">
          {/* Top Status */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              {timerPhase === 'focus' ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>Modo Concentración</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                  <Coffee className="w-4 h-4 text-emerald-600" />
                  <span>Modo Descanso</span>
                </div>
              )}
            </div>

            <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
              Sesiones completadas: <strong className="text-amber-700 dark:text-amber-400">{completedCycles}</strong>
            </div>
          </div>

          {/* Big Sleek Timer Center */}
          <div className="my-8 flex flex-col items-center justify-center text-center">
            {/* Circular Progress Bar Frame */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  className="stroke-stone-100 dark:stroke-stone-800"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  className={`transition-all duration-500 ${
                    timerPhase === 'focus'
                      ? 'stroke-amber-600 dark:stroke-amber-500'
                      : 'stroke-emerald-600 dark:stroke-emerald-500'
                  }`}
                  strokeWidth="6"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                  strokeLinecap="round"
                />
              </svg>

              {/* Digits in Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-4xl sm:text-5xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mt-1">
                  {timerPhase === 'focus' ? 'Enfoque' : 'Descanso'}
                </span>
              </div>
            </div>

            {/* Quick time nudges */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => handleAdjustTime(-5)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
                title="Restar 5 minutos"
              >
                -5 min
              </button>
              <button
                onClick={() => handleAdjustTime(5)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
                title="Añadir 5 minutos"
              >
                +5 min
              </button>
            </div>
          </div>

          {/* Primary Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex-1 py-3.5 px-4 rounded-2xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                  isRunning
                    ? 'bg-stone-800 hover:bg-stone-900 dark:bg-stone-700'
                    : 'bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 shadow-amber-900/20'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Comenzar Sesión</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetPhase}
                className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Reiniciar este bloque"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setTimerPhase(timerPhase === 'focus' ? 'break' : 'focus');
                  setTimeLeft(
                    timerPhase === 'focus' ? activeMethod.breakMin * 60 : activeMethod.focusMin * 60
                  );
                }}
                className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Saltar a siguiente fase"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Sound Notification Selector with Preview */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
              <span className="text-stone-500 dark:text-stone-400 font-semibold flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-stone-400" />
                <span>Alerta sonora:</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleTestSound('zen')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
                    soundChoice === 'zen'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                  title="Campanita zen al terminar"
                >
                  🔔 Zen
                </button>
                <button
                  onClick={() => handleTestSound('boing')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
                    soundChoice === 'boing'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                  title="Boing de la Capi"
                >
                  🦫 Capi
                </button>
                <button
                  onClick={() => handleTestSound('break')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
                    soundChoice === 'break'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                  title="Alarma suave"
                >
                  ⏰ Alarma
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
