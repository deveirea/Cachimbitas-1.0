import React, { useState } from 'react';
import { CourseConfig, EvaluationGroup, EvaluationItem } from '../types';
import { X, Plus, Trash2, BookPlus } from 'lucide-react';

interface CustomCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCourse: (course: CourseConfig) => void;
  initialCourse?: CourseConfig | null;
}

const EMOJI_OPTIONS = ['📐', '💻', '📖', '📊', '🏢', '📈', '⚖️', '🧪', '🔬', '🧠', '⚡', '🎨', '💼', '🩺'];

export const CustomCourseModal: React.FC<CustomCourseModalProps> = ({
  isOpen,
  onClose,
  onSaveCourse,
  initialCourse,
}) => {
  const [name, setName] = useState(initialCourse?.name || '');
  const [code, setCode] = useState(initialCourse?.code || '');
  const [icon, setIcon] = useState(initialCourse?.icon || '📚');
  const [credits, setCredits] = useState<number>(initialCourse?.credits || 3);

  // Default evaluation items
  const [items, setItems] = useState<Array<{ name: string; weight: number }>>(
    initialCourse?.groups[0]?.items.map((i) => ({
      name: i.name,
      weight: Math.round(i.weight * 100),
    })) || [
      { name: 'Práctica Calificada 1', weight: 20 },
      { name: 'Práctica Calificada 2', weight: 20 },
      { name: 'Examen Parcial', weight: 30 },
      { name: 'Examen Final', weight: 30 },
    ]
  );

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const totalWeight = items.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);

  const handleAddItem = () => {
    setItems([...items, { name: `Evaluación ${items.length + 1}`, weight: 10 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'name' | 'weight', val: string | number) => {
    const updated = [...items];
    if (field === 'name') {
      updated[index].name = val as string;
    } else {
      updated[index].weight = Number(val) || 0;
    }
    setItems(updated);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMsg('Por favor ingresa un nombre para el curso.');
      return;
    }
    if (totalWeight !== 100) {
      setErrorMsg(`La suma de pesos debe ser exactamente 100% (actualmente es ${totalWeight}%).`);
      return;
    }

    const courseId = initialCourse?.id || `custom_${Date.now()}`;
    const evalItems: EvaluationItem[] = items.map((item, idx) => ({
      id: `${courseId}_eval_${idx + 1}`,
      name: item.name,
      shortName: item.name,
      weight: item.weight / 100,
    }));

    const group: EvaluationGroup = {
      id: `${courseId}_group_main`,
      name: 'Evaluaciones del Curso',
      weightInCourse: 1.0,
      type: 'weighted_sum',
      items: evalItems,
    };

    const newCourse: CourseConfig = {
      id: courseId,
      cycleId: 'custom',
      name: name.trim(),
      code: code.trim() || undefined,
      icon,
      credits,
      groups: [group],
      customCalcType: 'standard',
    };

    onSaveCourse(newCourse);
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
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-stone-800 bg-[#FAF7F2]/60 dark:bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <BookPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {initialCourse ? 'Editar Curso' : 'Crear Curso Personalizado'}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Define tus propios pesos y evaluaciones para cualquier carrera
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
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Course Name & Icon */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Nombre del Curso
              </label>
              <input
                type="text"
                placeholder="Ej. Física II, Microeconomía..."
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
                Créditos
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={credits}
                onChange={(e) => setCredits(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2 text-sm text-center rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
              Ícono del Curso
            </label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setIcon(e)}
                  className={`w-9 h-9 rounded-xl border text-lg flex items-center justify-center transition-transform hover:scale-110 ${
                    icon === e
                      ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                      : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Evaluations List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                Evaluaciones y Pesos
              </label>
              <div
                className={`text-xs font-bold tabular-nums ${
                  totalWeight === 100
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                Total: {totalWeight}% / 100%
              </div>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                    placeholder="Nombre (ej. Parcial, PC1)"
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                  />
                  <div className="w-24 relative flex items-center">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={item.weight}
                      onChange={(e) => handleItemChange(idx, 'weight', e.target.value)}
                      className="w-full pr-6 pl-3 py-1.5 text-xs text-right font-bold rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600 tabular-nums"
                    />
                    <span className="absolute right-2 text-xs text-stone-400">%</span>
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="w-7 h-7 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors"
                      title="Eliminar evaluación"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="mt-3 w-full py-2 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar otra evaluación</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-[#FAF7F2]/50 dark:bg-stone-900/50 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-amber-900 hover:bg-amber-800 dark:bg-amber-700 dark:hover:bg-amber-600 rounded-xl shadow-xs transition-colors"
          >
            Guardar Curso
          </button>
        </div>
      </div>
    </div>
  );
};
