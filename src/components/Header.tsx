import React from 'react';
import { CycleId, OutfitId, CapyMood, CapySkin, CycleDefinition } from '../types';
import { CapybaraAvatar } from './CapybaraAvatar';
import { Sun, Moon, FileText, Plus, CheckCircle, HelpCircle, Menu, Mail } from 'lucide-react';

interface HeaderProps {
  cycles: CycleDefinition[];
  currentCycle: CycleId;
  onSelectCycle: (cycle: CycleId) => void;
  onOpenAddCycleModal: () => void;
  onOpenSidebar: () => void;
  onOpenCartaElga?: () => void;
  onOpenCapiIntro?: () => void;
  outfit: OutfitId;
  skin: CapySkin;
  capyMood: CapyMood;
  onOpenOutfitModal: () => void;
  onOpenBoletaModal: () => void;
  onOpenSaveInfoModal: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cycles,
  currentCycle,
  onSelectCycle,
  onOpenAddCycleModal,
  onOpenSidebar,
  outfit,
  skin,
  capyMood,
  onOpenOutfitModal,
  onOpenBoletaModal,
  onOpenSaveInfoModal,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-6">
        {/* Zone 1: Hamburger Menu (Las 3 rayitas) + Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenSidebar}
            className="w-10 h-10 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-300 hover:bg-stone-100 flex items-center justify-center transition-colors shadow-xs"
            title="Abrir menú universitario rápido (Las 3 rayitas)"
            aria-label="Menú principal"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>

          <a
            href="#"
            className="flex items-center gap-2 sm:gap-2.5 whitespace-nowrap group"
          >
            <div className="relative group-hover:scale-105 transition-transform">
              <CapybaraAvatar
                outfit={outfit}
                skin={skin}
                mood={capyMood}
                size={36}
                className="drop-shadow-xs"
              />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black tracking-tight text-amber-950 dark:text-amber-100 leading-none">
                El Capiómetro
              </div>
              <div className="text-[10px] text-amber-700 dark:text-amber-400 font-extrabold tracking-wide uppercase mt-0.5">
                Calculadora Universitaria 🐾
              </div>
            </div>
          </a>

          {/* Autosave Reassurance Badge */}
          <button
            onClick={onOpenSaveInfoModal}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 text-[10px] font-bold hover:bg-emerald-100 transition-colors"
            title="Tus notas se guardan automáticamente en tu navegador"
          >
            <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Guardado automático</span>
            <HelpCircle className="w-3 h-3 opacity-60 ml-0.5" />
          </button>
        </div>

        {/* Zone 2: Navigation / Cycles Switcher */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-2xl shrink-0 max-w-[420px] overflow-x-auto scrollbar-none">
          {cycles.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCycle(c.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                currentCycle === c.id
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {c.name}
            </button>
          ))}
          <button
            onClick={onOpenAddCycleModal}
            className="px-2 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-400 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 rounded-xl transition-colors flex items-center gap-1 shrink-0"
            title="Crear un nuevo ciclo (ej. Ciclo 2, Verano)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ciclo</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Quick Utility Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Capybara Outfit Trigger Button */}
          <button
            onClick={onOpenOutfitModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-[#FAF7F2] dark:bg-stone-800/60 hover:border-amber-400 transition-colors group"
            title="Personalizar look y accesorios de la Capi"
          >
            <CapybaraAvatar
              outfit={outfit}
              skin={skin}
              mood={capyMood}
              size={26}
              className="pointer-events-none group-hover:scale-110 transition-transform"
            />
            <span className="hidden sm:inline text-xs font-bold text-stone-700 dark:text-stone-300">
              Armario
            </span>
          </button>

          {/* Dark Mode Switcher */}
          <button
            onClick={onToggleDarkMode}
            className="w-9 h-9 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Alternar tema claro y oscuro"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenBoletaModal}
            className="px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-amber-900 hover:bg-amber-800 dark:bg-amber-700 dark:hover:bg-amber-600 rounded-xl shadow-xs transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Boleta</span>
          </button>
        </div>
      </div>

      {/* Mobile Cycle Tab Bar */}
      <div className="md:hidden flex items-center gap-1 px-3 py-1.5 border-t border-stone-100 dark:border-stone-800 bg-[#FAF7F2]/60 dark:bg-stone-900/60 text-xs overflow-x-auto scrollbar-none">
        {cycles.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectCycle(c.id)}
            className={`py-1 px-2.5 rounded-lg font-bold transition-colors whitespace-nowrap shrink-0 ${
              currentCycle === c.id
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300'
                : 'text-stone-500'
            }`}
          >
            {c.name}
          </button>
        ))}
        <button
          onClick={onOpenAddCycleModal}
          className="py-1 px-2 text-amber-800 font-bold whitespace-nowrap flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3 h-3" />
          <span>Ciclo</span>
        </button>
      </div>
    </header>
  );
};
