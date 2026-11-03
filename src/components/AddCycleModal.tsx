import React, { useState } from 'react';
import { CycleDefinition } from '../types';
import { X, CalendarPlus, Check } from 'lucide-react';

interface AddCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCycle: (cycle: CycleDefinition) => void;
}

export const AddCycleModal: React.FC<AddCycleModalProps> = ({
  isOpen,
  onClose,
  onAddCycle,
}) => {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [period, setPeriod] = useState('2026-02');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Ingresa un nombre para el ciclo (ej. Ciclo 2, Ciclo 3, Verano).');
      return;
    }

    const newCycle: CycleDefinition = {
      id: `cycle_${Date.now()}`,
      name: name.trim(),
      subtitle: subtitle.trim() || 'Semestre Académico',
      period: period.trim() || '2026',
      isCustom: true,
    };

    onAddCycle(newCycle);
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
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-stone-800 bg-[#FAF7F2]/60 dark:bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Nuevo Ciclo Académico
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Agrega un ciclo para organizar tus asignaturas
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
              Nombre del Ciclo
            </label>
            <input
              type="text"
              placeholder="Ej. Ciclo 2, Ciclo 3, Verano 2026..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg('');
              }}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
              Subtítulo / Facultad
            </label>
            <input
              type="text"
              placeholder="Ej. Segundo Semestre, Mención Finanzas..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
              Periodo / Año
            </label>
            <input
              type="text"
              placeholder="Ej. 2026-II, 2027-0"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-900 hover:bg-amber-800 dark:bg-amber-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Crear Ciclo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
