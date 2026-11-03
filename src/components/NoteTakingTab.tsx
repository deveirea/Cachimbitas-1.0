import React, { useState } from 'react';
import { CourseConfig, NoteItem } from '../types';
import {
  StickyNote,
  Plus,
  Trash2,
  Search,
  Tag,
  BookOpen,
  Calendar,
  Sparkles,
  Bot,
  Edit3,
  Check,
  X,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface NoteTakingTabProps {
  courses: CourseConfig[];
  notes: NoteItem[];
  onAddNote: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, updates: Partial<NoteItem>) => void;
  onDeleteNote: (id: string) => void;
  onSendToAi?: (noteText: string) => void;
}

const COLOR_OPTIONS = [
  { id: 'amber', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-900/40', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' },
  { id: 'emerald', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-900/40', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' },
  { id: 'blue', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-900/40', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
  { id: 'purple', bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-900/40', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' },
  { id: 'rose', bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-900/40', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300' },
];

export const NoteTakingTab: React.FC<NoteTakingTabProps> = ({
  courses,
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onSendToAi,
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // New Note Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCourseId, setNewCourseId] = useState<string>(courses[0]?.id || 'general');
  const [newTagInput, setNewTagInput] = useState('');
  const [newTags, setNewTags] = useState<string[]>(['Clase']);
  const [newColor, setNewColor] = useState<string>('amber');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredNotes = notes.filter((n) => {
    const matchesCourse = selectedCourseFilter === 'all' || n.courseId === selectedCourseFilter;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCourse && matchesSearch;
  });

  const handleAddTag = () => {
    if (newTagInput.trim() && !newTags.includes(newTagInput.trim())) {
      setNewTags([...newTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTags(newTags.filter((t) => t !== tagToRemove));
  };

  const insertSnippet = (snippet: string) => {
    setNewContent((prev) => (prev ? `${prev}\n${snippet} ` : `${snippet} `));
  };

  const handleSaveNote = () => {
    if (!newTitle.trim()) return;

    if (editingNoteId) {
      onUpdateNote(editingNoteId, {
        title: newTitle.trim(),
        content: newContent,
        courseId: newCourseId,
        tags: newTags,
        color: newColor,
        updatedAt: new Date().toISOString(),
      });
      setEditingNoteId(null);
    } else {
      onAddNote({
        title: newTitle.trim(),
        content: newContent,
        courseId: newCourseId,
        tags: newTags,
        color: newColor,
      });
    }

    // Reset
    setNewTitle('');
    setNewContent('');
    setNewTags(['Clase']);
    setIsCreating(false);
  };

  const handleStartEdit = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setNewTitle(note.title);
    setNewContent(note.content);
    setNewCourseId(note.courseId);
    setNewTags(note.tags);
    setNewColor(note.color || 'amber');
    setIsCreating(true);
  };

  const handleCopyNote = (note: NoteItem) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCourseName = (courseId: string) => {
    if (courseId === 'general') return 'Notas Generales 📚';
    const c = courses.find((item) => item.id === courseId);
    return c ? `${c.icon} ${c.name}` : 'Curso';
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <StickyNote className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black font-display text-stone-900 dark:text-stone-100">
                Apuntes & Note Taking 📝
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Tus apuntes organizados por curso, fórmulas y resúmenes con autoguardado permanente.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingNoteId(null);
            setNewTitle('');
            setNewContent('');
            setNewTags(['Clase']);
            setIsCreating(!isCreating);
          }}
          className="px-4 py-2.5 rounded-2xl bg-amber-700 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isCreating ? 'Cerrar Editor' : 'Nueva Nota'}</span>
        </button>
      </div>

      {/* Editor Box */}
      {isCreating && (
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border-2 border-amber-500/40 dark:border-amber-500/30 shadow-md space-y-4 animate-scale-up">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-600" />
              <span>{editingNoteId ? 'Editar Nota' : 'Crear Nueva Nota'}</span>
            </h3>

            {/* Color selector */}
            <div className="flex items-center gap-1.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setNewColor(c.id)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    newColor === c.id ? 'scale-125 border-stone-900 dark:border-white' : 'border-transparent'
                  } ${
                    c.id === 'amber'
                      ? 'bg-amber-400'
                      : c.id === 'emerald'
                      ? 'bg-emerald-400'
                      : c.id === 'blue'
                      ? 'bg-blue-400'
                      : c.id === 'purple'
                      ? 'bg-purple-400'
                      : 'bg-rose-400'
                  }`}
                  title={c.id}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-stone-500 block mb-1">Título del apunte</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej. Fórmulas de Integrales por Partes / Resumen Semana 4"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">Curso Asignado</label>
              <select
                value={newCourseId}
                onChange={(e) => setNewCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="general">📚 Notas Generales</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Snippet Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold text-stone-400 uppercase mr-1">Snippets rápidos:</span>
            <button
              type="button"
              onClick={() => insertSnippet('📐 [FÓRMULA]:')}
              className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-[11px] hover:bg-stone-200"
            >
              📐 Fórmula
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('⚠️ [OJO EXAMEN]:')}
              className="px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold text-[11px] hover:bg-rose-200"
            >
              ⚠️ Ojo Examen
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('💡 [DEFINICIÓN CLAVE]:')}
              className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] hover:bg-emerald-200"
            >
              💡 Definición
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('📝 [PASO A PASO]:\n1. \n2. \n3. ')}
              className="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold text-[11px] hover:bg-blue-200"
            >
              📝 Pasos
            </button>
          </div>

          {/* Content TextArea */}
          <div>
            <textarea
              rows={6}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Escribe tus notas, fórmulas, ejercicios resueltos o tips de la clase..."
              className="w-full p-4 rounded-2xl text-sm font-mono bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed resize-y"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Añadir etiqueta..."
                className="px-3 py-1.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-2.5 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold"
              >
                +
              </button>
            </div>

            {newTags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1"
              >
                #{tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveNote}
              disabled={!newTitle.trim()}
              className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs shadow-xs disabled:opacity-50"
            >
              Guardar Apunte
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en tus notas o etiquetas..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Course Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setSelectedCourseFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCourseFilter === 'all'
                ? 'bg-amber-700 text-white'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
            }`}
          >
            Todos ({notes.length})
          </button>
          <button
            onClick={() => setSelectedCourseFilter('general')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCourseFilter === 'general'
                ? 'bg-amber-700 text-white'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
            }`}
          >
            📚 General
          </button>
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCourseFilter(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedCourseFilter === c.id
                  ? 'bg-amber-700 text-white'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <StickyNote className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
            {searchQuery ? 'No encontramos notas con esa búsqueda' : 'Aún no tienes notas guardadas'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Crea tu primer apunte para guardar fórmulas, ejercicios resueltos o preguntas que vendrán en el examen.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-bold hover:bg-amber-600 shadow-xs"
          >
            + Crear Apunte
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const colorConfig = COLOR_OPTIONS.find((c) => c.id === note.color) || COLOR_OPTIONS[0];

            return (
              <div
                key={note.id}
                className={`p-5 rounded-3xl border transition-all hover:shadow-md flex flex-col justify-between space-y-3 ${colorConfig.bg} ${colorConfig.border}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${colorConfig.badge}`}>
                      {getCourseName(note.courseId)}
                    </span>

                    <div className="flex items-center gap-1 opacity-70 hover:opacity-100">
                      <button
                        onClick={() => handleCopyNote(note)}
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-stone-600 dark:text-stone-300"
                        title="Copiar texto"
                      >
                        {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleStartEdit(note)}
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-stone-600 dark:text-stone-300"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-black text-stone-900 dark:text-stone-100 text-sm leading-snug">
                    {note.title}
                  </h4>

                  <p className="text-xs text-stone-700 dark:text-stone-300 mt-2 whitespace-pre-wrap leading-relaxed line-clamp-6 font-mono">
                    {note.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2">
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((t) => (
                        <span key={t} className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                    <span>{new Date(note.updatedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>

                    {onSendToAi && (
                      <button
                        onClick={() => onSendToAi(`Por favor ayúdame a entender o estudiar este apunte del curso:\n\nTítulo: ${note.title}\nContenido:\n${note.content}`)}
                        className="font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Bot className="w-3 h-3" />
                        <span>Preguntar al Capi</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
