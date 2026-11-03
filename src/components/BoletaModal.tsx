import React, { useState } from 'react';
import { CourseConfig, CycleId, OutfitId, CapySkin } from '../types';
import { calculateCourse, calculateSemesterGPA, formatGrade, getGradeColorClass } from '../utils/gradeCalculations';
import { CapybaraAvatar } from './CapybaraAvatar';
import { X, Printer, Copy, Check, Download, GraduationCap, Palette, Award, ShieldCheck } from 'lucide-react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

interface BoletaModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: CourseConfig[];
  grades: Record<string, number | null>;
  cycleTitle: string;
  outfit: OutfitId;
  skin?: CapySkin;
}

type BoletaTheme = 'parchment' | 'navy' | 'sage';

interface ThemeConfig {
  id: BoletaTheme;
  name: string;
  badge: string;
  bgClass: string;
  darkBgClass: string;
  hex: string;
  borderClass: string;
  headerAccent: string;
  accentText: string;
}

const THEMES: Record<BoletaTheme, ThemeConfig> = {
  parchment: {
    id: 'parchment',
    name: 'Pergamino Universitario',
    badge: '🎓 Oficial',
    bgClass: 'bg-[#FBF7EE]',
    darkBgClass: 'dark:bg-[#1B1916]',
    hex: '#FBF7EE',
    borderClass: 'border-amber-900/20 dark:border-amber-700/30',
    headerAccent: 'text-amber-950 dark:text-amber-100',
    accentText: 'text-amber-900 dark:text-amber-300',
  },
  navy: {
    id: 'navy',
    name: 'Azul Notarial',
    badge: '🏛️ Clásico',
    bgClass: 'bg-[#F1F5F9]',
    darkBgClass: 'dark:bg-[#0F172A]',
    hex: '#F1F5F9',
    borderClass: 'border-slate-300 dark:border-slate-700',
    headerAccent: 'text-slate-900 dark:text-slate-100',
    accentText: 'text-indigo-900 dark:text-indigo-300',
  },
  sage: {
    id: 'sage',
    name: 'Menta & Sabiduría',
    badge: '🌿 Zen',
    bgClass: 'bg-[#F2F7F4]',
    darkBgClass: 'dark:bg-[#0F1D16]',
    hex: '#F2F7F4',
    borderClass: 'border-emerald-900/20 dark:border-emerald-700/30',
    headerAccent: 'text-emerald-950 dark:text-emerald-100',
    accentText: 'text-emerald-900 dark:text-emerald-300',
  },
};

export const BoletaModal: React.FC<BoletaModalProps> = ({
  isOpen,
  onClose,
  courses,
  grades,
  cycleTitle,
  outfit,
  skin = 'classic',
}) => {
  const [studentName, setStudentName] = useState('Estudiante Cachimbo');
  const [selectedTheme, setSelectedTheme] = useState<BoletaTheme>('parchment');
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const printableRef = React.useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentTheme = THEMES[selectedTheme];
  const stats = calculateSemesterGPA(courses, grades);

  const handleCopySummary = () => {
    let text = `🎓 *Boleta Académica — ${cycleTitle}*\n`;
    text += `👤 Estudiante: ${studentName}\n\n`;

    courses.forEach((c) => {
      const calc = calculateCourse(c, grades);
      const score = calc.isComplete ? calc.finalGrade : calc.accumulated;
      text += `• ${c.name}: ${score !== null && score > 0 ? formatGrade(score) : '—'} (${calc.statusLabel})\n`;
    });

    text += `\n📊 *Promedio Ponderado:* ${stats.gpa !== null ? formatGrade(stats.gpa) : '—'}/20.0\n`;
    text += `🏆 *Estado Académico:* ${stats.academicStanding}\n`;
    text += `🦫 _Calculado con El Capiómetro_`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportImage = async () => {
    if (!printableRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(printableRef.current, {
        backgroundColor: currentTheme.hex,
        pixelRatio: 2.5,
      });
      const link = document.createElement('a');
      link.download = `Boleta_El_Capiometro_${selectedTheme}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.7 },
      });
    } catch (err) {
      console.error(err);
      alert('No se pudo generar la imagen. Intenta con el botón Imprimir.');
    } finally {
      setIsExporting(false);
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
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col print:border-none print:shadow-none print:max-h-full print:w-full">
        {/* Modal Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-stone-100 dark:border-stone-800 bg-[#FAF7F2]/80 dark:bg-stone-900/80 print:hidden">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-800 dark:text-amber-400" />
            <div>
              <h2 className="text-sm font-black text-stone-900 dark:text-stone-100 leading-none">
                Boleta Académica Oficial
              </h2>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                Elige el tono de fondo para tu certificado
              </span>
            </div>
          </div>

          {/* Color Scheme Picker */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 dark:bg-stone-800 rounded-xl">
            {(Object.keys(THEMES) as BoletaTheme[]).map((key) => {
              const th = THEMES[key];
              const isSelected = selectedTheme === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedTheme(key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                  title={th.name}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-stone-300"
                    style={{ backgroundColor: th.hex }}
                  />
                  <span>{th.badge}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={handleCopySummary}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5 transition-colors"
              title="Copiar texto resumen"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isCopied ? 'Copiado' : 'Copiar'}</span>
            </button>
            <button
              onClick={handleExportImage}
              disabled={isExporting}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5 transition-colors"
              title="Descargar imagen PNG con fondo temático"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>{isExporting ? 'Generando...' : 'Descargar'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Body with Non-White Academic Background */}
        <div
          id="printable-boleta"
          ref={printableRef}
          className={`p-6 sm:p-8 md:p-9 overflow-y-auto space-y-6 transition-colors duration-200 ${currentTheme.bgClass} ${currentTheme.darkBgClass} text-stone-900 dark:text-stone-100 border-8 border-double ${currentTheme.borderClass}`}
        >
          {/* Certificate Header Banner */}
          <div className="text-center border-b-2 border-stone-300/80 dark:border-stone-700/80 pb-5">
            <div className="inline-flex items-center justify-center mb-2.5">
              <CapybaraAvatar outfit={outfit} skin={skin} mood="great" size={72} />
            </div>
            <div className="text-[10px] font-black tracking-widest uppercase text-amber-800 dark:text-amber-400">
              REPÚBLICA UNIVERSITARIA · EL CAPIÓMETRO
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black font-display uppercase tracking-tight mt-0.5 ${currentTheme.headerAccent}`}>
              Boleta Oficial de Calificaciones
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-semibold">
              {cycleTitle} · Escala Oficial 0 a 20 · Mínimo Aprobatorio 11.0
            </p>
          </div>

          {/* Student Info Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/70 dark:bg-stone-800/60 border border-stone-300/70 dark:border-stone-700/70 backdrop-blur-xs shadow-xs">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Estudiante
              </span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full text-sm font-black text-stone-900 dark:text-stone-100 bg-transparent border-b border-dashed border-stone-400 focus:outline-none focus:border-amber-600 mt-0.5"
                placeholder="Ingresa tu nombre completo"
              />
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Condición de Rendimiento
              </span>
              <div className={`text-sm font-black mt-0.5 ${currentTheme.accentText}`}>
                {stats.academicStanding}
              </div>
            </div>
          </div>

          {/* Grades Table */}
          <div className="overflow-hidden rounded-2xl border border-stone-300/80 dark:border-stone-700/80 bg-white/60 dark:bg-stone-900/60 backdrop-blur-xs shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-200/50 dark:bg-stone-800/80 border-b border-stone-300/80 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-black uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Asignatura</th>
                  <th className="py-3 px-3 text-center">Créditos</th>
                  <th className="py-3 px-3 text-right">Nota Final</th>
                  <th className="py-3 px-4 text-right">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/70 dark:divide-stone-800">
                {courses.map((course) => {
                  const calc = calculateCourse(course, grades);
                  const score = calc.isComplete ? calc.finalGrade : calc.accumulated;
                  const isScorePositive = score !== null && score > 0;
                  const color = getGradeColorClass(isScorePositive ? score : null);

                  return (
                    <tr key={course.id} className="hover:bg-white/40 dark:hover:bg-stone-800/40">
                      <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                        <span>{course.name}</span>
                      </td>
                      <td className="py-3 px-3 text-center tabular-nums text-stone-600 dark:text-stone-400 font-semibold">
                        {course.credits}
                      </td>
                      <td className={`py-3 px-3 text-right font-black text-sm tabular-nums ${color.text}`}>
                        {isScorePositive ? formatGrade(score) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${color.badge}`}>
                          {calc.statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Box with Official Stamp */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-stone-800/80 border border-stone-300/80 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Rendimiento Académico Global
              </div>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className={`text-3xl sm:text-4xl font-black font-mono tabular-nums ${currentTheme.accentText}`}>
                  {formatGrade(stats.gpa)}
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  Promedio Ponderado General (GPA)
                </span>
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                Créditos completados: <strong>{stats.completedCredits}</strong> de {stats.totalCredits}
              </div>
            </div>

            {/* Official Capybara Seal of Academic Approval */}
            <div className="border-2 border-dashed border-amber-800 dark:border-amber-400 rounded-2xl p-3 text-center rotate-[-2deg] select-none shadow-xs bg-amber-50/60 dark:bg-stone-900/60 shrink-0">
              <div className="text-[9px] font-black uppercase tracking-widest text-amber-900 dark:text-amber-300">
                ★ CERTIFICADO VERIFICADO ★
              </div>
              <div className="text-xs font-black text-amber-950 dark:text-amber-100 mt-0.5">
                EL CAPIÓMETRO
              </div>
              <div className="text-[9px] text-amber-800 dark:text-amber-400">
                Sello del Cachimbo Aprobado
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-100 dark:border-stone-800 bg-[#FAF7F2]/60 dark:bg-stone-900/60 flex justify-between items-center print:hidden">
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            Fondo actual: <strong>{currentTheme.name}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 dark:bg-stone-700 dark:hover:bg-stone-600 rounded-xl transition-colors shadow-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
