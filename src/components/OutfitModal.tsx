import React, { useState } from 'react';
import { OutfitId, CapySkin } from '../types';
import { CapybaraAvatar } from './CapybaraAvatar';
import { Sparkles, X, Check, Shirt, Palette, Music } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OutfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOutfit: OutfitId;
  currentSkin: CapySkin;
  onSelectOutfit: (outfit: OutfitId) => void;
  onSelectSkin: (skin: CapySkin) => void;
}

interface OutfitOption {
  id: OutfitId;
  name: string;
  emoji: string;
  tagline: string;
  tag?: string;
}

interface SkinOption {
  id: CapySkin;
  name: string;
  emoji: string;
  colorPreview: string;
  tagline: string;
}

const OUTFIT_OPTIONS: OutfitOption[] = [
  { id: 'none', name: 'Al Natural', emoji: '🦫', tagline: 'Capi zen y relajado en su hábitat', tag: 'Básico' },
  { id: 'grad', name: 'Birrete Cachimbo', emoji: '🎓', tagline: 'Visualizando la graduación', tag: 'Clásico' },
  { id: 'glasses', name: 'Lentes Pro', emoji: '👓', tagline: '+10 en cálculo y lectura', tag: 'Estudio' },
  { id: 'headphones', name: 'Audífonos Gamer', emoji: '🎧', tagline: 'Estudiando con música a todo volumen', tag: 'Nuevo ✨' },
  { id: 'coffee', name: 'Café Amanecida', emoji: '☕', tagline: 'Modo semana de parciales sin dormir', tag: 'Popular' },
  { id: 'pizza', name: 'Pizza Cachimba', emoji: '🍕', tagline: 'Banquete nocturno post-estudio', tag: 'Nuevo ✨' },
  { id: 'backpack', name: 'Mochila Cachimba', emoji: '🎒', tagline: 'Cargada de cuadernos y fe', tag: 'Favorito' },
  { id: 'scarf', name: 'Bufanda Universitaria', emoji: '🧣', tagline: 'Abrigando el promedio en invierno', tag: 'Nuevo ✨' },
  { id: 'crown', name: 'Corona Real', emoji: '👑', tagline: 'Directo al Décimo Superior', tag: 'Mérito' },
  { id: 'sunglasses', name: 'Lentes Facheros', emoji: '🕶️', tagline: 'Ocultando las ojeras de la semana 8', tag: 'Estilo' },
  { id: 'party', name: 'Gorro Fiesta', emoji: '🎉', tagline: 'Celebrando el 11.0 salvador', tag: 'Festejo' },
  { id: 'tie', name: 'Corbata Pro', emoji: '👔', tagline: 'Listo para la sustentación ante el jurado', tag: 'Formal' },
  { id: 'tutu', name: 'Tutú Bailarín', emoji: '🩰', tagline: 'Haciendo malabares con el 10.6', tag: 'Equilibrio' },
];

const SKIN_OPTIONS: SkinOption[] = [
  { id: 'classic', name: 'Caramelo Clásico', emoji: '🦫', colorPreview: '#C58D62', tagline: 'Pelaje suave original de capibara' },
  { id: 'chocolate', name: 'Chocolate Mooca', emoji: '🍫', colorPreview: '#5D3B23', tagline: 'Tostado intenso de amanecida' },
  { id: 'matcha', name: 'Té Matcha Zen', emoji: '🍵', colorPreview: '#6B8E23', tagline: 'Paz mental para no estresarse' },
  { id: 'strawberry', name: 'Fresa Pastel', emoji: '🍓', colorPreview: '#E88CA6', tagline: 'Capi dulce y estético' },
  { id: 'golden', name: 'Dorado Legendario', emoji: '✨', colorPreview: '#F59E0B', tagline: 'Exclusivo para el Primer Puesto' },
];

export const OutfitModal: React.FC<OutfitModalProps> = ({
  isOpen,
  onClose,
  currentOutfit,
  currentSkin,
  onSelectOutfit,
  onSelectSkin,
}) => {
  const [activeTab, setActiveTab] = useState<'outfits' | 'skins'>('outfits');

  if (!isOpen) return null;

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      // Audio not permitted or silent fallback
    }
  };

  const handleOutfitClick = (outfitId: OutfitId) => {
    onSelectOutfit(outfitId);
    playChime();
    confetti({ particleCount: 20, spread: 45, origin: { y: 0.45 } });
  };

  const handleSkinClick = (skinId: CapySkin) => {
    onSelectSkin(skinId);
    playChime();
  };

  const currentOutfitObj = OUTFIT_OPTIONS.find((o) => o.id === currentOutfit);
  const currentSkinObj = SKIN_OPTIONS.find((s) => s.id === currentSkin);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800 bg-[#FAF7F2]/60 dark:bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Boutique de la Capi</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 dark:bg-pink-950/50 dark:text-pink-300">
                  Fashion Cachimbo
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Personaliza la apariencia y accesorios de tu fiel compañera
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

        {/* Live Podium Preview Area */}
        <div className="p-6 bg-gradient-to-b from-[#F5EFE6] to-[#FAF7F2] dark:from-stone-900 dark:to-stone-950 flex flex-col items-center justify-center border-b border-stone-200 dark:border-stone-800 relative">
          <div className="relative p-5 rounded-3xl bg-white/80 dark:bg-stone-800/70 backdrop-blur-md border border-stone-200/80 dark:border-stone-700/80 shadow-md flex flex-col items-center min-w-[220px]">
            <CapybaraAvatar
              outfit={currentOutfit}
              skin={currentSkin}
              mood="happy"
              size={124}
              isDancing={true}
            />
            <div className="mt-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-100">
                <span>{currentOutfitObj?.emoji}</span>
                <span>{currentOutfitObj?.name}</span>
                <span className="text-stone-400">·</span>
                <span>{currentSkinObj?.name}</span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-400 font-semibold mt-0.5">
                {currentOutfitObj?.tagline}
              </p>
            </div>
          </div>

          {/* Sub-Tabs: Outfits vs Skins */}
          <div className="mt-4 flex items-center p-1 bg-stone-200/60 dark:bg-stone-800 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('outfits')}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'outfits'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Accesorios ({OUTFIT_OPTIONS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('skins')}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'skins'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Pelajes & Skins ({SKIN_OPTIONS.length})</span>
            </button>
          </div>
        </div>

        {/* Selection Area */}
        <div className="p-6 overflow-y-auto max-h-[380px]">
          {activeTab === 'outfits' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {OUTFIT_OPTIONS.map((item) => {
                const isSelected = item.id === currentOutfit;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleOutfitClick(item.id)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between group relative overflow-hidden ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-500 shadow-sm ring-2 ring-amber-500/20'
                        : 'border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-stone-700 bg-white dark:bg-stone-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <span className="text-2xl group-hover:scale-125 transition-transform duration-200">
                        {item.emoji}
                      </span>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      ) : (
                        item.tag && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500">
                            {item.tag}
                          </span>
                        )
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                        {item.tagline}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SKIN_OPTIONS.map((skin) => {
                const isSelected = skin.id === currentSkin;
                return (
                  <button
                    key={skin.id}
                    onClick={() => handleSkinClick(skin.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-500 shadow-sm ring-2 ring-amber-500/20'
                        : 'border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-stone-700 bg-white dark:bg-stone-800/50'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-2xl border border-white/40 shadow-xs flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: skin.colorPreview }}
                    >
                      {skin.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                        <span>{skin.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {skin.tagline}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-[#FAF7F2]/50 dark:bg-stone-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-amber-900 hover:bg-amber-800 dark:bg-amber-700 rounded-xl shadow-xs transition-colors"
          >
            ¡Me encanta este look!
          </button>
        </div>
      </div>
    </div>
  );
};
