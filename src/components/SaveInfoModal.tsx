import React, { useRef } from 'react';
import { X, HardDrive, Download, Upload, ShieldCheck, Smartphone, Check, FileJson } from 'lucide-react';

interface SaveInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport?: (file: File) => void;
}

export const SaveInfoModal: React.FC<SaveInfoModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImport) {
      onImport(file);
      onClose();
    }
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
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-stone-800 bg-[#FAF7F2]/60 dark:bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Tus Notas y Copias de Seguridad
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Guardado permanente y restauración en cualquier dispositivo
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
        <div className="p-6 space-y-4 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
          {/* Card 1: LocalStorage automatic */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/60 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                1. Guardado Automático en este Navegador
              </h4>
              <p className="mt-1 text-stone-500 dark:text-stone-400">
                Cada calificación o cambio se guarda inmediatamente en la memoria de este dispositivo (LocalStorage). No necesitas iniciar sesión ni pulsar guardar.
              </p>
            </div>
          </div>

          {/* Card 2: Restore backup explanation */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/70 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0">
              <FileJson className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200">
                2. ¿Dónde pongo mi archivo de copia si cambio de dispositivo?
              </h4>
              <p className="mt-1 text-stone-600 dark:text-stone-400">
                Si descargaste tu copia (.json) y entraste desde otra laptop o celular, presiona el botón <strong>"Restaurar Copia"</strong> aquí abajo y selecciona tu archivo descargado. ¡Todas tus notas y horarios se recuperarán al instante!
              </p>
            </div>
          </div>

          {/* Action Boxes */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={onExport}
              className="p-3 rounded-2xl border border-stone-200 dark:border-stone-700 hover:border-amber-400 bg-white dark:bg-stone-800 text-left transition-colors flex items-center gap-3"
            >
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-stone-900 dark:text-stone-100 block">
                  Descargar Copia (.json)
                </span>
                <span className="text-[10px] text-stone-400">Guarda un archivo de respaldo</span>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-100/70 hover:bg-amber-200/80 dark:bg-amber-950/60 text-left transition-colors flex items-center gap-3"
            >
              <div className="p-2 rounded-xl bg-amber-900 text-white shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-amber-950 dark:text-amber-200 block">
                  Restaurar Copia (.json)
                </span>
                <span className="text-[10px] text-amber-800/80 dark:text-amber-300">Cargar tu archivo respaldado</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-[#FAF7F2]/50 dark:bg-stone-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-amber-900 hover:bg-amber-800 rounded-xl transition-colors shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
