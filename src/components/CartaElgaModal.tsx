import React, { useState } from 'react';
import { CapybaraAvatar } from './CapybaraAvatar';
import {
  X,
  Share2,
  Check,
  Compass,
  GraduationCap,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CartaElgaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartaElgaModal: React.FC<CartaElgaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [sentHeart, setSentHeart] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendHeart = () => {
    setSentHeart(true);
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.7 },
    });
    setTimeout(() => setSentHeart(false), 3000);
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
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden text-stone-800 dark:text-stone-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative p-6 sm:p-7 bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 text-white overflow-hidden text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-2xl shadow-inner mb-2.5">
            🦫
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white drop-shadow-xs">
            Sobre El Capiómetro
          </h2>
          <p className="text-amber-100 text-xs sm:text-sm font-medium mt-1">
            Plataforma colaborativa para la comunidad universitaria
          </p>

          <div className="flex items-center justify-center gap-3 mt-3">
            <CapybaraAvatar outfit="grad" skin="classic" mood="happy" size={46} />
            <div className="text-left bg-black/25 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/20">
              <p className="text-[11px] font-black tracking-wide text-amber-200">EL CAPIÓMETRO 🐾</p>
              <p className="text-[10px] text-white/90">"Tu copiloto para aprobar el semestre"</p>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-7 space-y-4 max-h-[55vh] overflow-y-auto leading-relaxed text-sm text-stone-700 dark:text-stone-300">
          <div className="space-y-2">
            <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Propósito del proyecto</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              <strong>El Capiómetro</strong> fue creado con espíritu colaborativo para ayudar a todo estudiante a sobrellevar el semestre: fórmulas de cálculo vigesimal (0 a 20), alertas preventivas de inasistencias (DPI) y proyección exacta de la nota que necesitas en el examen final.
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              La meta es brindarte una herramienta clara, sin registros forzosos ni saturación visual, para que organices tu horario y notas en un solo lugar.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <p className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Cálculo Vigesimal</span>
              </p>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                Escala oficial 0 a 20 con nota aprobatoria 11.0.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Control DPI & Asistencia</span>
              </p>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                Monitoreo del límite del 30% de inasistencias.
              </p>
            </div>
          </div>

          {/* Modest Credit */}
          <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 flex items-center justify-between gap-3 text-xs">
            <div>
              <p className="text-stone-600 dark:text-stone-400 text-[11px]">
                Creado para apoyar a los estudiantes universitarios. Con la autoría e iniciativa de <strong className="text-stone-800 dark:text-stone-200">Elga</strong>.
              </p>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                Proyecto colaborativo libre para todos los cachimbos y estudiantes
              </p>
            </div>
            <span className="text-lg shrink-0">🌱</span>
          </div>
        </div>

        {/* Modal actions */}
        <div className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900/80 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
          <button
            onClick={handleSendHeart}
            className="px-3.5 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-200 transition-colors flex items-center gap-1.5"
          >
            <Heart className={`w-3.5 h-3.5 ${sentHeart ? 'fill-rose-500 text-rose-500 animate-ping' : 'text-rose-600'}`} />
            <span>{sentHeart ? '¡Ánimo en el ciclo!' : 'Mandar ánimos'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? '¡Enlace copiado!' : 'Compartir con compañeros'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
