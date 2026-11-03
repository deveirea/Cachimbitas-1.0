import React, { useState } from 'react';
import { CourseConfig, FlashcardItem } from '../types';
import {
  Layers,
  Plus,
  Sparkles,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trash2,
  Flame,
  Brain,
  ThumbsUp,
  X,
  Shuffle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FlashcardsTabProps {
  courses: CourseConfig[];
  flashcards: FlashcardItem[];
  onAddFlashcard: (card: Omit<FlashcardItem, 'id' | 'reviewCount'>) => void;
  onAddBulkFlashcards: (cards: Omit<FlashcardItem, 'id' | 'reviewCount'>[]) => void;
  onRateFlashcard: (id: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  onDeleteFlashcard: (id: string) => void;
}

export const FlashcardsTab: React.FC<FlashcardsTabProps> = ({
  courses,
  flashcards,
  onAddFlashcard,
  onAddBulkFlashcards,
  onRateFlashcard,
  onDeleteFlashcard,
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Manual creation state
  const [manualFront, setManualFront] = useState('');
  const [manualBack, setManualBack] = useState('');
  const [manualCourseId, setManualCourseId] = useState<string>(courses[0]?.id || 'general');

  // AI Generator state
  const [aiTopic, setAiTopic] = useState('');
  const [aiCourseId, setAiCourseId] = useState<string>(courses[0]?.id || 'general');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const filteredCards = flashcards.filter(
    (card) => selectedCourseFilter === 'all' || card.courseId === selectedCourseFilter
  );

  const activeCard = filteredCards[currentIndex] || null;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
  };

  const handleRate = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!activeCard) return;

    if (difficulty === 'easy') {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
      });
    }

    onRateFlashcard(activeCard.id, difficulty);
    handleNext();
  };

  const handleSaveManual = () => {
    if (!manualFront.trim() || !manualBack.trim()) return;

    onAddFlashcard({
      courseId: manualCourseId,
      front: manualFront.trim(),
      back: manualBack.trim(),
      difficulty: 'unreviewed',
    });

    setManualFront('');
    setManualBack('');
    setIsCreatingModal(false);
  };

  const handleGenerateAi = async () => {
    if (!aiTopic.trim()) return;

    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const courseName = courses.find((c) => c.id === aiCourseId)?.name || 'General';
      const res = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          courseName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al generar tarjetas');
      }

      const generated = data.cards.map((c: any) => ({
        courseId: aiCourseId,
        front: c.front,
        back: c.back,
        difficulty: 'unreviewed' as const,
      }));

      onAddBulkFlashcards(generated);
      confetti({
        particleCount: 50,
        spread: 60,
      });

      setAiTopic('');
      setIsAiModalOpen(false);
    } catch (err: any) {
      setAiError(err.message || 'No se pudieron generar las tarjetas.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const masteredCount = filteredCards.filter((c) => c.difficulty === 'easy').length;
  const progressPercent = filteredCards.length > 0 ? Math.round((masteredCount / filteredCards.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Layers className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-black font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>Tarjetas de Memoria & Active Recall 🃏✨</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Método Anki de repetición espaciada: pon a prueba tu memoria antes del examen.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Generar con IA</span>
          </button>

          <button
            onClick={() => setIsCreatingModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Tarjeta</span>
          </button>
        </div>
      </div>

      {/* Course Filter Bar & Stats */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-stone-100/80 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => {
              setSelectedCourseFilter('all');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
              selectedCourseFilter === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300'
            }`}
          >
            Todas ({flashcards.length})
          </button>
          {courses.map((c) => {
            const count = flashcards.filter((card) => card.courseId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCourseFilter(c.id);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                  selectedCourseFilter === c.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.name.split(' ')[0]}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Progress gauge */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          <span className="text-stone-500 font-medium">
            Dominadas: <strong className="text-emerald-600 dark:text-emerald-400">{masteredCount}</strong> / {filteredCards.length}
          </span>
          <div className="w-24 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-bold text-stone-700 dark:text-stone-300">{progressPercent}%</span>
        </div>
      </div>

      {/* Main Flashcard View */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl">
            🃏
          </div>
          <h3 className="text-lg font-black text-stone-800 dark:text-stone-200">
            No tienes tarjetas en este mazo
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Crea preguntas y respuestas para estudiar activamente o pídele a la IA de Cachimbitas que genere 5 tarjetas de cualquier tema en segundos.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-xs hover:bg-purple-500 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generar con IA</span>
            </button>
            <button
              onClick={() => setIsCreatingModal(true)}
              className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs hover:bg-stone-300"
            >
              + Crear Manual
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Deck card indicator */}
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 px-2">
            <span>
              Tarjeta {currentIndex + 1} de {filteredCards.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px]">
                {activeCard?.difficulty === 'easy'
                  ? '🟢 Dominada'
                  : activeCard?.difficulty === 'medium'
                  ? '🟡 En Repaso'
                  : activeCard?.difficulty === 'hard'
                  ? '🔴 Difícil'
                  : '⚪ Por Revisar'}
              </span>
              <button
                onClick={() => activeCard && onDeleteFlashcard(activeCard.id)}
                className="p-1 rounded text-stone-400 hover:text-rose-600"
                title="Eliminar tarjeta"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Flip Card */}
          <div
            onClick={handleFlip}
            className="group relative h-80 w-full cursor-pointer rounded-3xl bg-white dark:bg-stone-900 border-2 border-stone-200/80 dark:border-stone-800 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center p-8 text-center select-none"
          >
            <div className="absolute top-4 left-4 text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <span>{isFlipped ? '💡 RESPUESTA' : '❓ PREGUNTA / CONCEPTO'}</span>
            </div>

            <div className="absolute top-4 right-4 text-xs font-medium text-stone-400 flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
              <span>Haz clic para voltear</span>
            </div>

            <div className="max-w-lg my-auto animate-fade-in">
              {isFlipped ? (
                <div className="space-y-3">
                  <p className="text-base sm:text-lg font-medium text-stone-800 dark:text-stone-100 leading-relaxed">
                    {activeCard?.back}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black font-display text-stone-900 dark:text-stone-100 leading-snug">
                    {activeCard?.front}
                  </h3>
                </div>
              )}
            </div>

            <div className="absolute bottom-4 text-[11px] font-semibold text-stone-400">
              {isFlipped ? 'Califica qué tan fácil lo recordaste abajo 👇' : 'Intenta recordarlo antes de voltear ✨'}
            </div>
          </div>

          {/* Rate Recall Buttons (Anki Style) */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => handleRate('hard')}
              className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/60 font-bold text-xs transition-colors flex flex-col items-center gap-1"
            >
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>🔴 Difícil</span>
              <span className="text-[10px] opacity-70 font-normal">Repetir pronto</span>
            </button>

            <button
              onClick={() => handleRate('medium')}
              className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 font-bold text-xs transition-colors flex flex-col items-center gap-1"
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>🟡 Bien</span>
              <span className="text-[10px] opacity-70 font-normal">En 3 días</span>
            </button>

            <button
              onClick={() => handleRate('easy')}
              className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 font-bold text-xs transition-colors flex flex-col items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>🟢 Fácil</span>
              <span className="text-[10px] opacity-70 font-normal">Dominado</span>
            </button>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-200 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <button
              onClick={handleFlip}
              className="px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-200 flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Voltear Tarjeta</span>
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-200 flex items-center gap-1.5"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Manual Add Card Modal */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-stone-900 dark:text-stone-100 text-base flex items-center gap-2">
                <span>Crear Tarjeta de Memoria 🃏</span>
              </h3>
              <button onClick={() => setIsCreatingModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1">Curso</label>
                <select
                  value={manualCourseId}
                  onChange={(e) => setManualCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                >
                  <option value="general">📚 General / Libre</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1">
                  Frente (Pregunta, Fórmula o Concepto)
                </label>
                <textarea
                  rows={3}
                  value={manualFront}
                  onChange={(e) => setManualFront(e.target.value)}
                  placeholder="Ej. ¿Cuál es la fórmula para la derivada de un producto?"
                  className="w-full p-3 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1">
                  Reverso (Respuesta, Demostración o Tip)
                </label>
                <textarea
                  rows={3}
                  value={manualBack}
                  onChange={(e) => setManualBack(e.target.value)}
                  placeholder="Ej. (u · v)' = u' · v + u · v'"
                  className="w-full p-3 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCreatingModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveManual}
                disabled={!manualFront.trim() || !manualBack.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 disabled:opacity-50"
              >
                Guardar Tarjeta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Flashcards Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600">
                  <Sparkles className="w-5 h-5 text-purple-600 animate-spin" />
                </span>
                <h3 className="font-black text-stone-900 dark:text-stone-100 text-base">
                  Generar Tarjetas con IA ✨
                </h3>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Escribe un tema de clase (ej. <em>"Matrices y Determinantes"</em>, <em>"Leyes de Newton"</em>, <em>"Cuentas T en Contabilidad"</em>) y Gemini creará 5 tarjetas de active recall al instante.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1">Curso</label>
                <select
                  value={aiCourseId}
                  onChange={(e) => setAiCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                >
                  <option value="general">📚 General / Libre</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1">Tema a Estudiar</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ej. Límites indeterminados 0/0 y regla de L'Hôpital"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {aiError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
                  {aiError}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateAi}
                disabled={!aiTopic.trim() || isGeneratingAi}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {isGeneratingAi ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Creando tarjetas...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generar 5 Tarjetas</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
