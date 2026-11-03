import React from 'react';
import { OutfitId, CapySkin, CapyMood } from '../types';
import { CapybaraAvatar } from './CapybaraAvatar';
import { formatGrade } from '../utils/gradeCalculations';
import {
  X,
  Calculator,
  Timer,
  Calendar,
  ShieldCheck,
  CheckSquare,
  FileUp,
  Sparkles,
  FileText,
  HelpCircle,
  Download,
  Upload,
  Moon,
  Sun,
  Plus,
  Bot,
  Mail,
} from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'courses' | 'study' | 'capi-ai' | 'schedule' | 'attendance' | 'tasks';
  onSelectTab: (tab: 'courses' | 'study' | 'capi-ai' | 'schedule' | 'attendance' | 'tasks') => void;
  outfit: OutfitId;
  skin: CapySkin;
  capyMood: CapyMood;
  gpa: number | null;
  academicStanding: string;
  pendingTasksCount: number;
  onOpenSyllabusUpload: () => void;
  onOpenOutfitModal: () => void;
  onOpenBoletaModal: () => void;
  onOpenSaveInfoModal: () => void;
  onOpenAddCycleModal: () => void;
  onOpenCartaElga: () => void;
  onOpenCapiIntro: () => void;
  onExportJSON: () => void;
  onImportJSON?: (file: File) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  outfit,
  skin,
  capyMood,
  gpa,
  academicStanding,
  pendingTasksCount,
  onOpenSyllabusUpload,
  onOpenOutfitModal,
  onOpenBoletaModal,
  onOpenSaveInfoModal,
  onOpenAddCycleModal,
  onOpenCartaElga,
  onOpenCapiIntro,
  onExportJSON,
  onImportJSON,
  darkMode,
  onToggleDarkMode,
}) => {
  const importInputRef = React.useRef<HTMLInputElement>(null);
  if (!isOpen) return null;

  const handleNavClick = (tab: 'courses' | 'study' | 'capi-ai' | 'schedule' | 'attendance' | 'tasks') => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white dark:bg-stone-900 h-full shadow-2xl border-r border-stone-200 dark:border-stone-800 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
        <div>
          {/* Top Brand Banner */}
          <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-[#FAF7F2]/80 dark:bg-stone-900/80">
            <div className="flex items-center gap-3">
              <CapybaraAvatar outfit={outfit} skin={skin} mood={capyMood} size={42} />
              <div>
                <div className="text-base font-black text-amber-950 dark:text-amber-100 tracking-tight flex items-center gap-1.5">
                  <span>El Capiómetro</span>
                  <span className="text-xs">🦫</span>
                </div>
                <div className="text-[10px] text-amber-800 dark:text-amber-400 font-extrabold tracking-wider uppercase">
                  Calculadora & Asistente 🐾
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Academic Standing Card */}
          <div className="p-4 mx-3 my-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold uppercase text-amber-800 dark:text-amber-400 tracking-wide">
                Promedio Semestre
              </div>
              <div className="text-xl font-black text-amber-950 dark:text-amber-100">
                {gpa !== null ? formatGrade(gpa) : '—'}
                <span className="text-xs font-semibold text-stone-500 ml-1">/ 20</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-stone-500">Condición:</div>
              <div className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                {academicStanding}
              </div>
            </div>
          </div>

          {/* Section 1: Core Navigation Tabs */}
          <div className="px-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
              Módulos del Estudiante
            </div>

            <button
              onClick={() => handleNavClick('courses')}
              className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between ${
                activeTab === 'courses'
                  ? 'bg-amber-900 text-white shadow-xs dark:bg-amber-700'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calculator className="w-4 h-4" />
                <span>Calificaciones (Curso por Curso)</span>
              </div>
              {gpa !== null && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${activeTab === 'courses' ? 'bg-amber-800 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'}`}>
                  {formatGrade(gpa)}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('capi-ai')}
              className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between ${
                activeTab === 'capi-ai'
                  ? 'bg-amber-900 text-white shadow-xs dark:bg-amber-700'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bot className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>Capi Consejero Académico</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick('study')}
              className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between ${
                activeTab === 'study'
                  ? 'bg-amber-900 text-white shadow-xs dark:bg-amber-700'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Timer className="w-4 h-4 text-blue-500" />
                <span>Temporizador & Pomodoro</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick('schedule')}
              className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2.5 ${
                activeTab === 'schedule'
                  ? 'bg-amber-900 text-white shadow-xs dark:bg-amber-700'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Calendar className="w-4 h-4 text-sky-500" />
              <span>Horario Semanal de Clases</span>
            </button>

            <button
              onClick={() => handleNavClick('attendance')}
              className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2.5 ${
                activeTab === 'attendance'
                  ? 'bg-amber-900 text-white shadow-xs dark:bg-amber-700'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              <span>Control de Faltas (Límite DPI)</span>
            </button>

            <button
              onClick={() => handleNavClick('tasks')}
              className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between ${
                activeTab === 'tasks'
                  ? 'bg-amber-900 text-white shadow-xs dark:bg-amber-700'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4 text-teal-500" />
                <span>Agenda de Evaluaciones</span>
              </div>
              {pendingTasksCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-black">
                  {pendingTasksCount}
                </span>
              )}
            </button>
          </div>

          {/* Section 2: Quick Features */}
          <div className="px-3 mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-1">
            <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
              Herramientas
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenSyllabusUpload();
              }}
              className="w-full p-2 rounded-xl text-left text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-900 dark:hover:text-amber-300 flex items-center gap-2.5 transition-colors"
            >
              <FileUp className="w-4 h-4 text-amber-600" />
              <span>Subir Sílabo con IA (PDF/Word)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenOutfitModal();
              }}
              className="w-full p-2 rounded-xl text-left text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Armario de la Capi</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenBoletaModal();
              }}
              className="w-full p-2 rounded-xl text-left text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2.5 transition-colors"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Ver Boleta Oficial</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenAddCycleModal();
              }}
              className="w-full p-2 rounded-xl text-left text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2.5 transition-colors"
            >
              <Plus className="w-4 h-4 text-blue-500" />
              <span>Agregar Nuevo Ciclo</span>
            </button>
          </div>
        </div>

        {/* Bottom Utility Footer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-[#FAF7F2]/60 dark:bg-stone-900/60 space-y-2">
          {/* Hidden JSON File Input for Restoring Backup */}
          <input
            type="file"
            ref={importInputRef}
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onImportJSON) onImportJSON(file);
              if (importInputRef.current) importInputRef.current.value = '';
            }}
          />

          <button
            onClick={() => {
              onClose();
              onOpenSaveInfoModal();
            }}
            className="w-full py-1.5 px-2 rounded-xl text-left text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>¿Cómo se guardan mis datos?</span>
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">100% en tu navegador</span>
          </button>

          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={onExportJSON}
              className="flex-1 py-1.5 px-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 flex items-center justify-center gap-1.5 transition-colors"
              title="Descargar archivo copia de respaldo (.json)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar</span>
            </button>

            <button
              onClick={() => importInputRef.current?.click()}
              className="flex-1 py-1.5 px-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/40 text-xs font-bold text-amber-900 dark:text-amber-300 hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5"
              title="Cargar y restaurar tus notas desde una copia (.json)"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Restaurar</span>
            </button>

            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 transition-colors shrink-0"
              title="Cambiar tema"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Discreet link to project info, strictly placed at the end */}
          <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500">
            <button
              onClick={() => {
                onClose();
                onOpenCartaElga();
              }}
              className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors flex items-center gap-1.5 py-0.5"
              title="Acerca de El Capiómetro"
            >
              <span>ℹ️ Acerca de El Capiómetro</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenCapiIntro();
              }}
              className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors text-[10px] flex items-center gap-1"
              title="Ver guía y presentación de El Capiómetro"
            >
              <span>🐾 Guía rápida</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
