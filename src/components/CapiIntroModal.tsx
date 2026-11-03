import React, { useState } from 'react';
import { CapybaraAvatar } from './CapybaraAvatar';
import {
  Sparkles,
  Rocket,
  CheckCircle2,
  X,
  Compass,
  GraduationCap,
  Brain,
  Layers,
  Heart,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CapiIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCartaElga?: () => void;
}

export const CapiIntroModal: React.FC<CapiIntroModalProps> = ({
  isOpen,
  onClose,
  onOpenCartaElga,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleStart = () => {
    localStorage.setItem('capiometro_welcome_seen_v3', 'true');
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
    onClose();
  };

  const handleClose = () => {
    localStorage.setItem('capiometro_welcome_seen_v3', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden text-stone-800 dark:text-stone-100 animate-scale-up">
        {/* Glow header banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-amber-500 via-amber-600 to-emerald-600 text-white overflow-hidden text-center">
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white to-transparent" />
          
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/25 backdrop-blur-xs text-white border border-white/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin" />
              Plataforma Universitaria
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white drop-shadow-xs">
            ¡El Capiómetro! 🦫🐾
          </h2>
          <p className="text-amber-100 text-sm sm:text-base max-w-md mx-auto mt-2 font-medium">
            Tu copiloto universitario para no jalar el ciclo, calcular notas con IA y estudiar sin colapsar.
          </p>

          {/* Floating Capy Mascot */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="relative transform -rotate-3 hover:rotate-0 transition-transform">
              <CapybaraAvatar outfit="glasses" skin="matcha" mood="happy" size={72} />
              <span className="absolute -bottom-1 -right-1 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-700 text-white shadow-xs">
                Estudio 👓
              </span>
            </div>
            <div className="relative transform rotate-3 hover:rotate-0 transition-transform">
              <CapybaraAvatar outfit="grad" skin="classic" mood="great" size={72} />
              <span className="absolute -bottom-1 -right-1 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-700 text-white shadow-xs">
                Cachimbo 🎓
              </span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="p-6 sm:p-7 space-y-4 max-h-[50vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-stone-100">Vista Curso por Curso</p>
                <p className="text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                  Selecciona tu curso para verlo individualmente con barra circular y estado de aprobación.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-stone-100">Capi IA Consejero & Tutor</p>
                <p className="text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                  Pregúntale si puedes salvar la materia, si conviene retirarte o cómo estudiar un tema difícil.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-stone-100">Apuntes & Flashcards 3D</p>
                <p className="text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                  Toma notas de clase y practica active recall con tarjetas volteables y generadas por IA.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-stone-100">Subida de Sílabo con IA</p>
                <p className="text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                  Sube tu PDF o Word del sílabo y el Capi extrae las ponderaciones automáticamente.
                </p>
              </div>
            </div>
          </div>

          {/* Creation & Collaborative Teaser */}
          <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🌱</span>
              <div>
                <span className="font-bold text-stone-900 dark:text-stone-100">Iniciativa 100% Colaborativa</span>
                <p className="text-stone-500 dark:text-stone-400 text-[11px]">Creado con dedicación para acompañar a los estudiantes en cada ciclo :3</p>
              </div>
            </div>
            {onOpenCartaElga && (
              <button
                onClick={() => {
                  handleClose();
                  onOpenCartaElga();
                }}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 font-bold text-amber-800 dark:text-amber-400 hover:bg-stone-50 transition-colors shrink-0 text-xs"
              >
                Saber más
              </button>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-6 bg-stone-50 dark:bg-stone-900/80 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
          <div className="text-[11px] text-stone-400 dark:text-stone-500 hidden sm:block">
            <span>Esta pantalla solo se muestra la primera vez que abres la app.</span>
          </div>

          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-emerald-600 text-white font-bold text-sm shadow-md hover:from-amber-500 hover:to-emerald-500 transition-all flex items-center justify-center gap-2 ml-auto"
          >
            <Rocket className="w-4 h-4" />
            <span>¡Entrar al Capiómetro!</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
