import React, { useState, useEffect } from 'react';
import { OutfitId, CapyMood, CapySkin } from '../types';
import { CapybaraAvatar } from './CapybaraAvatar';
import { Sparkles, MessageCircle, RefreshCw } from 'lucide-react';

interface FloatingCapyProps {
  outfit: OutfitId;
  skin?: CapySkin;
  mood: CapyMood;
  gpa: number | null;
  onOpenOutfitModal: () => void;
}

const MESSAGES: Record<CapyMood, string[]> = {
  empty: [
    '¡Pon tus primeras notas! 🌿',
    '¿Cómo te fue esta semana? 🦫',
    '¡El ciclo recién empieza! 🌱',
    'Ingresa tus notas y calculo todo ✨',
  ],
  great: [
    '¡Estás brillando cachimbo! ✨',
    '¡Modo Tercio Superior activado! 🌟',
    '¡Orgullosa de tu esfuerzo! 🎉',
    '¡Un crack absoluto! 🦫✨',
  ],
  happy: [
    '¡La capi está feliz con tus notas! 🦫✨',
    '¡Qué buen ritmo llevas! 🥳',
    '¡Se siente el aroma a ciclo salvado! 🌱',
  ],
  good: [
    '¡Vas a buen ritmo, sigue así! 💪',
    'Buenas notas, ¡a asegurar el ciclo! 🎯',
    'Con constancia se llega lejos 🌱',
    '¡La capi confía en ti! 🐾',
  ],
  ok: [
    'Aprobando... pero no te duermas 👀',
    'Aún hay tiempo para subir notas 🍃',
    '¡Dale con todo al examen final! 🔥',
    '11 es nota y 20 es vanidad 😉',
  ],
  bad: [
    'Oye... tenemos que hablar 🚨',
    'Abre el Modo Cementerio y salvemos esto 🪦',
    '¡No te rindas, aún hay fe! ⏰',
    'Una amanecida con café y la hacemos ☕',
  ],
  scared: [
    '😱 ¡Alerta máxima en las notas!',
    '¡A sacar el 20 en los finales!',
    'La capi está rezándole a todos los santos 🙏',
  ],
  sleep: [
    'Zzz... modo siesta post-parcial 😴',
    'Descansando la mente para estudiar 💤',
  ],
};

export const FloatingCapy: React.FC<FloatingCapyProps> = ({
  outfit,
  skin = 'classic',
  mood,
  gpa,
  onOpenOutfitModal,
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isDancing, setIsDancing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Rotate messages periodically
  const messagesList = MESSAGES[mood] || MESSAGES.ok;

  useEffect(() => {
    setCurrentMessageIndex(0);
  }, [mood]);

  const handleNextMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMessageIndex((prev) => (prev + 1) % messagesList.length);
  };

  const handleCapyClick = () => {
    setIsDancing(true);
    setTimeout(() => setIsDancing(false), 1200);
    // Cycle to next quote
    setCurrentMessageIndex((prev) => (prev + 1) % messagesList.length);
  };

  const currentText = messagesList[currentMessageIndex % messagesList.length];

  return (
    <aside
      aria-label="Capiómetro acompañante"
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-auto select-none"
    >
      {/* Speech Bubble */}
      {isVisible && (
        <div
          onClick={handleNextMessage}
          className="mb-2 max-w-[210px] bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 p-3 rounded-2xl rounded-br-sm border-2 border-amber-200 dark:border-stone-700 shadow-lg text-xs font-bold cursor-pointer hover:border-amber-400 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
          title="Toca para leer otro mensaje"
        >
          <div className="flex items-center justify-between text-[10px] text-amber-800 dark:text-amber-400 font-semibold mb-1">
            <span>Capi dice:</span>
            <RefreshCw className="w-2.5 h-2.5 opacity-60" />
          </div>
          <p className="leading-snug">{currentText}</p>
        </div>
      )}

      {/* Floating Capybara Interactive Avatar */}
      <div className="relative flex items-center gap-2 group">
        {/* Quick Outfit Switcher Pill on hover */}
        <button
          onClick={onOpenOutfitModal}
          className="opacity-0 group-hover:opacity-100 transition-opacity bg-amber-900 dark:bg-amber-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md hover:bg-amber-800 flex items-center gap-1 -translate-x-1"
        >
          <Sparkles className="w-3 h-3" />
          <span>Cambiar outfit</span>
        </button>

        <div
          onClick={handleCapyClick}
          className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
          title="¡Tócame para hablar!"
        >
          <CapybaraAvatar
            outfit={outfit}
            skin={skin}
            mood={mood}
            size={72}
            isDancing={isDancing}
            className="animate-capy-bob"
          />
        </div>
      </div>
    </aside>
  );
};
