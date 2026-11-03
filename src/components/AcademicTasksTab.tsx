import React, { useState } from 'react';
import { CourseConfig, AcademicTask } from '../types';
import { CheckSquare, Square, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';

interface AcademicTasksTabProps {
  courses: CourseConfig[];
  tasks: AcademicTask[];
  onAddTask: (task: AcademicTask) => void;
  onToggleTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
}

export const AcademicTasksTab: React.FC<AcademicTasksTabProps> = ({
  courses,
  tasks,
  onAddTask,
  onToggleTask,
  onRemoveTask,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<'pc' | 'parcial' | 'final' | 'trabajo' | 'control'>('pc');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;

    const newTask: AcademicTask = {
      id: `task_${Date.now()}`,
      title: title.trim(),
      courseId,
      dueDate,
      type,
      completed: false,
    };

    onAddTask(newTask);
    setTitle('');
    setIsAdding(false);
  };

  const getDaysDiff = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr + 'T00:00:00');
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            <span>Agenda de Evaluaciones y Tareas</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Fechas límite de PCs, exámenes parciales y entregas
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-900 hover:bg-amber-800 dark:bg-amber-700 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Tarea</span>
        </button>
      </div>

      {/* Form Drawer */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-900/60 shadow-md space-y-4 animate-in fade-in"
        >
          <div className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
            Anotar Evaluación Pendiente
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Título de la Evaluación / Tarea
              </label>
              <input
                type="text"
                placeholder="Ej. Examen Parcial de Mate, PC2 de Informática..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Asignatura
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Fecha de entrega / Examen
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              >
                <option value="pc">Práctica Calificada (PC)</option>
                <option value="parcial">Examen Parcial</option>
                <option value="final">Examen Final</option>
                <option value="trabajo">Trabajo / Ensayo</option>
                <option value="control">Control de Lectura</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-amber-900 hover:bg-amber-800 dark:bg-amber-700 rounded-xl"
            >
              Guardar en Agenda
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <div className="p-8 text-center rounded-3xl border border-dashed border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-400">
            No tienes evaluaciones pendientes anotadas. ¡Agrega tu primera PC o examen!
          </div>
        ) : (
          tasks.map((task) => {
            const course = courses.find((c) => c.id === task.courseId);
            const daysDiff = getDaysDiff(task.dueDate);

            let statusLabel = '';
            let statusClass = '';

            if (task.completed) {
              statusLabel = 'Completada ✓';
              statusClass = 'bg-stone-100 text-stone-500 dark:bg-stone-800';
            } else if (daysDiff < 0) {
              statusLabel = `Venció hace ${Math.abs(daysDiff)} días`;
              statusClass = 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40';
            } else if (daysDiff === 0) {
              statusLabel = '¡Hoy es la entrega!';
              statusClass = 'bg-rose-100 text-rose-800 font-extrabold dark:bg-rose-900/60';
            } else if (daysDiff <= 3) {
              statusLabel = `Faltan ${daysDiff} días`;
              statusClass = 'bg-amber-100 text-amber-800 font-bold dark:bg-amber-900/50';
            } else {
              statusLabel = `En ${daysDiff} días`;
              statusClass = 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40';
            }

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  task.completed
                    ? 'bg-stone-50/70 dark:bg-stone-800/30 border-stone-200/60 dark:border-stone-800 opacity-60'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="text-stone-400 hover:text-amber-800 transition-colors"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div>
                    <div
                      className={`text-xs font-bold ${
                        task.completed
                          ? 'line-through text-stone-400'
                          : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                      <span>{course?.icon} {course?.name || 'Curso'}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusClass}`}>
                    {statusLabel}
                  </span>
                  <button
                    onClick={() => onRemoveTask(task.id)}
                    className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                    title="Eliminar tarea"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
