import React, { useState, useRef } from 'react';
import { CourseConfig, CycleId, EvaluationGroup, EvaluationItem } from '../types';
import { FileUp, Sparkles, X, Check, Loader2, AlertCircle, FileText, ArrowRight, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SyllabusUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCycleId: CycleId;
  onCourseCreated: (course: CourseConfig) => void;
}

export const SyllabusUploadModal: React.FC<SyllabusUploadModalProps> = ({
  isOpen,
  onClose,
  targetCycleId,
  onCourseCreated,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Extracted Result State (editable by student before saving)
  const [extractedCourse, setExtractedCourse] = useState<{
    name: string;
    code: string;
    credits: number;
    icon: string;
    evaluations: Array<{ name: string; weight: number }>;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setErrorMsg('');
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data:...;base64,
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Fallback heuristic parser for raw text
  const parseTextHeuristically = (text: string) => {
    const lines = text.split('\n');
    let courseName = 'Nuevo Curso del Sílabo';
    let code = '';
    let credits = 4;
    const evals: Array<{ name: string; weight: number }> = [];

    // Check for common patterns like PC1: 20%, Examen Parcial: 30%
    const regex = /([a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d]+?)(?::|\s+|-)\s*(\d{1,2}(?:\.\d+)?)\s*%/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const name = match[1].trim();
      const weight = Math.round(parseFloat(match[2]));
      if (name.length > 1 && name.length < 35 && weight > 0 && weight <= 60) {
        evals.push({ name, weight });
      }
    }

    // Default structure if regex couldn't find enough
    if (evals.length === 0) {
      evals.push(
        { name: 'Práctica Calificada 1', weight: 20 },
        { name: 'Práctica Calificada 2', weight: 20 },
        { name: 'Examen Parcial', weight: 30 },
        { name: 'Examen Final', weight: 30 }
      );
    } else {
      // Normalize sum to 100%
      const sum = evals.reduce((s, e) => s + e.weight, 0);
      if (sum !== 100 && sum > 0) {
        evals.forEach((e) => {
          e.weight = Math.round((e.weight / sum) * 100);
        });
      }
    }

    // Attempt to extract title from first line
    if (lines[0] && lines[0].trim().length > 3 && lines[0].length < 40) {
      courseName = lines[0].trim();
    }

    return {
      name: courseName,
      code,
      credits,
      icon: '📖',
      evaluations: evals,
    };
  };

  const handleProcessDocument = async () => {
    if (!selectedFile && !pastedText.trim()) {
      setErrorMsg('Por favor sube un archivo (PDF, Word, imagen) o pega el texto del sílabo.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      let fileBase64: string | undefined;
      let mimeType: string | undefined;

      if (selectedFile) {
        fileBase64 = await fileToBase64(selectedFile);
        mimeType = selectedFile.type || 'application/pdf';
      }

      // Call server AI endpoint
      const res = await fetch('/api/parse-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pastedText,
          fileBase64,
          mimeType,
        }),
      });

      if (!res.ok) {
        throw new Error('El servidor de IA no respondió favorablemente.');
      }

      const data = await res.json();
      if (data.success && data.course) {
        setExtractedCourse(data.course);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } else {
        throw new Error(data.error || 'Respuesta inválida');
      }
    } catch (err: any) {
      console.warn('Fallback to heuristic text extraction:', err);
      // Fallback: parse whatever text we have
      const fallback = parseTextHeuristically(pastedText || selectedFile?.name || '');
      setExtractedCourse(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluationWeightChange = (index: number, val: number) => {
    if (!extractedCourse) return;
    const updated = [...extractedCourse.evaluations];
    updated[index].weight = Number(val) || 0;
    setExtractedCourse({ ...extractedCourse, evaluations: updated });
  };

  const handleEvaluationNameChange = (index: number, val: string) => {
    if (!extractedCourse) return;
    const updated = [...extractedCourse.evaluations];
    updated[index].name = val;
    setExtractedCourse({ ...extractedCourse, evaluations: updated });
  };

  const handleSaveCourse = () => {
    if (!extractedCourse) return;

    const courseId = `course_${Date.now()}`;
    const evalItems: EvaluationItem[] = extractedCourse.evaluations.map((item, idx) => ({
      id: `${courseId}_ev_${idx + 1}`,
      name: item.name,
      shortName: item.name,
      weight: item.weight / 100,
    }));

    const group: EvaluationGroup = {
      id: `${courseId}_group_all`,
      name: 'Sistema de Evaluación',
      weightInCourse: 1.0,
      type: 'weighted_sum',
      items: evalItems,
    };

    const newCourse: CourseConfig = {
      id: courseId,
      cycleId: targetCycleId,
      name: extractedCourse.name.trim() || 'Curso Importado',
      code: extractedCourse.code.trim() || undefined,
      icon: extractedCourse.icon || '📖',
      credits: extractedCourse.credits || 4,
      groups: [group],
      customCalcType: 'standard',
    };

    onCourseCreated(newCourse);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-stone-800 bg-[#FAF7F2]/60 dark:bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>Subir Sílabo con IA</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300">
                  Automático
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Sube tu PDF, Word o foto del sílabo y extrae el curso con sus pesos al 100%
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!extractedCourse ? (
            <>
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 ${
                  dragActive
                    ? 'border-amber-600 bg-amber-50/80 dark:bg-amber-950/40'
                    : selectedFile
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-stone-300 dark:border-stone-700 hover:border-amber-500 bg-stone-50/50 dark:bg-stone-800/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-sm">
                  {selectedFile ? <FileText className="w-6 h-6 text-emerald-600" /> : <FileUp className="w-6 h-6" />}
                </div>

                <div>
                  <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {selectedFile ? selectedFile.name : 'Arrastra tu archivo aquí o haz clic para explorar'}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB · Listo para procesar`
                      : 'Formatos admitidos: PDF, Word (.docx), Imagen del sílabo, o Texto'}
                  </div>
                </div>

                {selectedFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="text-[11px] font-semibold text-rose-600 hover:underline"
                  >
                    Quitar archivo
                  </button>
                )}
              </div>

              {/* Or paste text */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5 uppercase tracking-wider">
                  O copia y pega el texto del sílabo:
                </label>
                <textarea
                  rows={4}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Ejemplo:
Cálculo Aplicado a la Física
Fórmula de evaluación:
PC1: 15%
PC2: 15%
Laboratorios: 20%
Examen Parcial: 25%
Examen Final: 25%"
                  className="w-full p-3 text-xs rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                />
              </div>
            </>
          ) : (
            /* Extracted Preview Stage */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                <span className="text-2xl">{extractedCourse.icon}</span>
                <div className="flex-1">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    ¡Sílabo procesado exitosamente!
                  </div>
                  <div className="text-xs text-emerald-700/90 dark:text-emerald-400 mt-0.5">
                    Verifica o ajusta los datos antes de guardarlo en tu ciclo.
                  </div>
                </div>
              </div>

              {/* Course Meta Inputs */}
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                    Nombre del Curso
                  </label>
                  <input
                    type="text"
                    value={extractedCourse.name}
                    onChange={(e) => setExtractedCourse({ ...extractedCourse, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                    Créditos
                  </label>
                  <input
                    type="number"
                    value={extractedCourse.credits}
                    onChange={(e) => setExtractedCourse({ ...extractedCourse, credits: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs text-center font-bold rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Evaluations list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Evaluaciones detectadas ({extractedCourse.evaluations.length})
                  </label>
                  <div className="text-xs font-bold text-stone-700 dark:text-stone-300 tabular-nums">
                    Total:{' '}
                    {extractedCourse.evaluations.reduce((sum, e) => sum + (Number(e.weight) || 0), 0)}%
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {extractedCourse.evaluations.map((ev, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ev.name}
                        onChange={(e) => handleEvaluationNameChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                      />
                      <div className="w-20 relative flex items-center">
                        <input
                          type="number"
                          value={ev.weight}
                          onChange={(e) => handleEvaluationWeightChange(idx, Number(e.target.value))}
                          className="w-full pr-5 pl-2 py-1.5 text-xs text-right font-bold rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 tabular-nums"
                        />
                        <span className="absolute right-2 text-xs text-stone-400">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-[#FAF7F2]/50 dark:bg-stone-900/50 flex items-center justify-between">
          {extractedCourse ? (
            <>
              <button
                type="button"
                onClick={() => setExtractedCourse(null)}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
              >
                Volver a subir
              </button>
              <button
                type="button"
                onClick={handleSaveCourse}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-900 hover:bg-amber-800 dark:bg-amber-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Agregar a mi ciclo</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProcessDocument}
                disabled={isLoading || (!selectedFile && !pastedText.trim())}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-900 hover:bg-amber-800 dark:bg-amber-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analizando sílabo con IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Procesar Sílabo</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
