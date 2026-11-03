import React, { useState, useRef, useEffect } from 'react';
import { CourseConfig, ScheduleSlot } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  FileImage,
  Download,
  FileSpreadsheet,
  Grid,
  ListFilter,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  ClipboardPaste,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';

interface StudentScheduleTabProps {
  courses: CourseConfig[];
  schedule: ScheduleSlot[];
  onAddSlot: (slot: ScheduleSlot) => void;
  onRemoveSlot: (slotId: string) => void;
  onSetSchedule?: (slots: ScheduleSlot[]) => void;
  onClearSchedule?: () => void;
}

const DAYS: Array<'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado'> = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

const HOURS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
];

// Aesthetic clean soft colors for courses
const COURSE_COLORS = [
  { bg: 'bg-amber-100 dark:bg-amber-950/60', border: 'border-amber-300 dark:border-amber-800', text: 'text-amber-950 dark:text-amber-200', tag: 'bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-300' },
  { bg: 'bg-sky-100 dark:bg-sky-950/60', border: 'border-sky-300 dark:border-sky-800', text: 'text-sky-950 dark:text-sky-200', tag: 'bg-sky-200/80 dark:bg-sky-900/80 text-sky-900 dark:text-sky-300' },
  { bg: 'bg-emerald-100 dark:bg-emerald-950/60', border: 'border-emerald-300 dark:border-emerald-800', text: 'text-emerald-950 dark:text-emerald-200', tag: 'bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-300' },
  { bg: 'bg-purple-100 dark:bg-purple-950/60', border: 'border-purple-300 dark:border-purple-800', text: 'text-purple-950 dark:text-purple-200', tag: 'bg-purple-200/80 dark:bg-purple-900/80 text-purple-900 dark:text-purple-300' },
  { bg: 'bg-rose-100 dark:bg-rose-950/60', border: 'border-rose-300 dark:border-rose-800', text: 'text-rose-950 dark:text-rose-200', tag: 'bg-rose-200/80 dark:bg-rose-900/80 text-rose-900 dark:text-rose-300' },
  { bg: 'bg-indigo-100 dark:bg-indigo-950/60', border: 'border-indigo-300 dark:border-indigo-800', text: 'text-indigo-950 dark:text-indigo-200', tag: 'bg-indigo-200/80 dark:bg-indigo-900/80 text-indigo-900 dark:text-indigo-300' },
  { bg: 'bg-teal-100 dark:bg-teal-950/60', border: 'border-teal-300 dark:border-teal-800', text: 'text-teal-950 dark:text-teal-200', tag: 'bg-teal-200/80 dark:bg-teal-900/80 text-teal-900 dark:text-teal-300' },
  { bg: 'bg-orange-100 dark:bg-orange-950/60', border: 'border-orange-300 dark:border-orange-800', text: 'text-orange-950 dark:text-orange-200', tag: 'bg-orange-200/80 dark:bg-orange-900/80 text-orange-900 dark:text-orange-300' },
];

export const StudentScheduleTab: React.FC<StudentScheduleTabProps> = ({
  courses,
  schedule,
  onAddSlot,
  onRemoveSlot,
  onSetSchedule,
  onClearSchedule,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('grid');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDay, setSelectedDay] = useState<'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado'>('Lunes');
  const [courseInput, setCourseInput] = useState(courses[0]?.name || 'Matemáticas');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [classroom, setClassroom] = useState('Aula 301');

  // AI Screenshot OCR State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export State
  const [isExportingPng, setIsExportingPng] = useState(false);
  const scheduleTableRef = useRef<HTMLDivElement>(null);

  // Map courses to colors consistently
  const getCourseColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COURSE_COLORS.length;
    return COURSE_COLORS[index];
  };

  const getSlotCourseName = (slot: ScheduleSlot): string => {
    if (slot.courseName) return slot.courseName;
    const course = courses.find((c) => c.id === slot.courseId);
    return course ? course.name : 'Asignatura';
  };

  // Convert time string "HH:MM" to fractional hour number (e.g. "08:30" -> 8.5)
  const timeToHour = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10) || 0);
    return h + m / 60;
  };

  // Add Single Slot Handler
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseInput.trim()) return;

    const matched = courses.find(
      (c) => c.name.toLowerCase().trim() === courseInput.toLowerCase().trim()
    );

    const newSlot: ScheduleSlot = {
      id: `slot_${Date.now()}`,
      day: selectedDay,
      startTime,
      endTime,
      courseId: matched ? matched.id : `custom_${Date.now()}`,
      courseName: courseInput.trim(),
      classroom: classroom.trim() || 'Aula por asignar',
    };

    onAddSlot(newSlot);
    setIsAdding(false);
  };

  // Process any image blob (from file picker or clipboard paste)
  const processImageBlob = async (file: Blob) => {
    setUploadError(null);
    setUploadSuccess(null);
    setIsUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const resultStr = reader.result as string;
          const base64Data = resultStr.includes(';base64,') ? resultStr.split(';base64,')[1] : resultStr;
          let mime = (file.type || 'image/png').toLowerCase();
          if (mime === 'image/jpg' || mime.includes('jpg')) {
            mime = 'image/jpeg';
          }
          
          const response = await fetch('/api/parse-schedule-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: mime,
            }),
          });

          const data = await response.json();
          if (!response.ok || !data.success) {
            throw new Error(data.error || 'No se pudo leer la captura de horario automáticamente.');
          }

          const parsedClasses: any[] = data.schedule || [];
          if (parsedClasses.length === 0) {
            throw new Error('No se detectaron clases en la imagen. Asegúrate de que la captura incluya los nombres de los cursos y las horas, o agrégalas con "+ Agregar Clase".');
          }

          const newSlots: ScheduleSlot[] = parsedClasses.map((item, index) => {
            const matched = courses.find((c) =>
              c.name.toLowerCase().includes(item.courseName.toLowerCase()) ||
              item.courseName.toLowerCase().includes(c.name.toLowerCase())
            );

            return {
              id: `slot_ai_${Date.now()}_${index}`,
              day: (item.day as any) || 'Lunes',
              startTime: item.startTime || '08:00',
              endTime: item.endTime || '10:00',
              courseId: matched ? matched.id : `course_ai_${index}`,
              courseName: item.courseName || 'Curso',
              classroom: item.classroom || 'Aula por asignar',
            };
          });

          if (onSetSchedule) {
            onSetSchedule(newSlots);
          } else {
            newSlots.forEach((slot) => onAddSlot(slot));
          }

          setUploadSuccess(`¡Éxito! Se digitalizaron ${newSlots.length} clases automáticamente.`);
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (err: any) {
          console.error(err);
          setUploadError(err.message || 'Error al procesar la captura de horario con IA.');
        } finally {
          setIsUploadingImage(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };

      reader.onerror = () => {
        setUploadError('No se pudo leer la imagen.');
        setIsUploadingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(err.message || 'Ocurrió un error inesperado.');
      setIsUploadingImage(false);
    }
  };

  // Listen to Ctrl+V / Cmd+V paste globally on this tab
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processImageBlob(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [courses]);

  // Click handler to paste from clipboard via API if supported
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            processImageBlob(blob);
            return;
          }
        }
        setUploadError('No hay ninguna imagen copiada en tu portapapeles. Toma una captura con Win+Shift+S y presiona Ctrl+V.');
      } else {
        alert('Para pegar tu captura de pantalla, simplemente presiona Ctrl+V (o Cmd+V) en tu teclado.');
      }
    } catch (err) {
      alert('Presiona Ctrl+V (o Cmd+V) en cualquier parte de la pantalla para pegar tu captura copiada.');
    }
  };

  // AI Screenshot Upload Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageBlob(file);
  };

  // Export Schedule as PNG Image
  const handleExportPNG = async () => {
    if (!scheduleTableRef.current) return;
    setIsExportingPng(true);
    try {
      const dataUrl = await toPng(scheduleTableRef.current, {
        backgroundColor: '#FAF7F2',
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `Horario_El_Capiometro_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err) {
      console.error('Error generating PNG:', err);
      alert('No se pudo exportar la imagen. Intenta de nuevo.');
    } finally {
      setIsExportingPng(false);
    }
  };

  // Export Schedule as Excel (.xlsx) file
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Title & Subtitle Rows
      const sheetData: any[][] = [
        ['HORARIO SEMANAL DE CLASES · EL CAPIÓMETRO'],
        ['Generado automáticamente · Universidad & Semestre Académico'],
        [], // blank row
        ['HORA', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'],
      ];

      // Build rows for each hour from 07:00 to 21:00
      HOURS.forEach((hourStr) => {
        const nextHour = `${(parseInt(hourStr.split(':')[0], 10) + 1).toString().padStart(2, '0')}:00`;
        const timeBlockLabel = `${hourStr} - ${nextHour}`;
        const row: string[] = [timeBlockLabel];

        DAYS.forEach((day) => {
          const hourNum = timeToHour(hourStr);
          // Find slots for this day that cover this hour
          const activeSlots = schedule.filter((s) => {
            if (s.day !== day) return false;
            const start = timeToHour(s.startTime);
            const end = timeToHour(s.endTime);
            return start <= hourNum && hourNum < end;
          });

          if (activeSlots.length > 0) {
            const cellText = activeSlots
              .map((s) => `${getSlotCourseName(s)} (${s.classroom})`)
              .join(' // ');
            row.push(cellText);
          } else {
            row.push('');
          }
        });

        sheetData.push(row);
      });

      // Add a summary table at the bottom of the worksheet
      sheetData.push([]);
      sheetData.push(['RESUMEN DE ASIGNATURAS Y SESIONES:']);
      sheetData.push(['CURSO', 'DÍA', 'HORARIO', 'AULA']);

      const sortedSlots = [...schedule].sort((a, b) => {
        const dayDiff = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.startTime.localeCompare(b.startTime);
      });

      sortedSlots.forEach((slot) => {
        sheetData.push([
          getSlotCourseName(slot),
          slot.day,
          `${slot.startTime} - ${slot.endTime}`,
          slot.classroom,
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(sheetData);

      // Define column widths for Excel formatting
      ws['!cols'] = [
        { wch: 16 }, // Hora
        { wch: 25 }, // Lunes
        { wch: 25 }, // Martes
        { wch: 25 }, // Miércoles
        { wch: 25 }, // Jueves
        { wch: 25 }, // Viernes
        { wch: 25 }, // Sábado
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Horario');
      XLSX.writeFile(wb, 'Mi_Horario_Universitario_El_Capiometro.xlsx');

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err) {
      console.error('Error generating Excel:', err);
      alert('Ocurrió un error al generar el archivo Excel.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            <span>Horario Semanal de Clases</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Digitaliza tu horario desde una captura de pantalla o descárgalo en Excel y PNG
          </p>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Grid vs Cards View Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              title="Vista cuadrícula semanal estilo Excel"
            >
              <Grid className="w-3.5 h-3.5 text-amber-600" />
              <span>Cuadrícula (Excel)</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              title="Vista lista por días"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Por Días</span>
            </button>
          </div>

          {/* AI Screenshot Upload Trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-950 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-800 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            title="Subir foto o captura del horario universitario (Banner, Intranet, SIA)"
          >
            {isUploadingImage ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
            ) : (
              <FileImage className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            )}
            <span>{isUploadingImage ? 'Digitalizando...' : 'Subir Imagen'}</span>
          </button>

          {/* Pegar desde Portapapeles (Ctrl+V) */}
          <button
            onClick={handlePasteFromClipboard}
            disabled={isUploadingImage}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-950 dark:text-emerald-200 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-800 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            title="Pegar captura directamente del portapapeles o presiona Ctrl+V"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Pegar (Ctrl+V)</span>
          </button>

          {/* Export PNG */}
          <button
            onClick={handleExportPNG}
            disabled={isExportingPng || schedule.length === 0}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-400 text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-40"
            title="Descargar como imagen PNG de alta calidad"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>Descargar PNG</span>
          </button>

          {/* Export Excel (.xlsx) */}
          <button
            onClick={handleExportExcel}
            disabled={schedule.length === 0}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-emerald-500 text-emerald-800 dark:text-emerald-300 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-40"
            title="Descargar horario en archivo Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Descargar Excel</span>
          </button>

          {/* Add Slot Button */}
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-900 hover:bg-amber-800 dark:bg-amber-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Clase</span>
          </button>
        </div>
      </div>

      {/* Upload Feedback Banners */}
      {uploadError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-stone-400 hover:text-stone-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
          <button
            onClick={() => setUploadSuccess(null)}
            className="text-stone-400 hover:text-stone-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* AI Screenshot Banner Helper */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
              ¿Tienes captura de tu horario de matrícula o intranet?
            </p>
            <p className="text-[11px] text-stone-600 dark:text-stone-400">
              Sube la imagen y la inteligencia artificial extraerá los días, horas y aulas sin que escribas uno por uno.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-900 text-white hover:bg-amber-800 dark:bg-amber-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Seleccionar Captura</span>
          </button>
          {schedule.length > 0 && onClearSchedule && (
            <button
              onClick={() => {
                if (confirm('¿Deseas vaciar el horario actual?')) onClearSchedule();
              }}
              className="px-2.5 py-1.5 text-[11px] font-semibold text-stone-500 hover:text-rose-600 transition-colors"
            >
              Vaciar
            </button>
          )}
        </div>
      </div>

      {/* Add Slot Form Drawer (if open) */}
      {isAdding && (
        <form
          onSubmit={handleSaveSlot}
          className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-900/60 shadow-md space-y-4 animate-in fade-in"
        >
          <div className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
            Nueva Sesión de Clase
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Día de la semana
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Asignatura (Limpio, sin emojis)
              </label>
              <input
                type="text"
                list="courses-datalist"
                placeholder="Ej. Cálculo I / Física II"
                value={courseInput}
                onChange={(e) => setCourseInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                required
              />
              <datalist id="courses-datalist">
                {courses.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Horario (Inicio - Fin)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-1/2 px-2 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
                <span className="text-stone-400 text-xs">-</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-1/2 px-2 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Aula / Pabellón
              </label>
              <input
                type="text"
                placeholder="Ej. Aula 204 / Lab B"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
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
              Guardar Clase
            </button>
          </div>
        </form>
      )}

      {/* Schedule Table / Grid Container (Export Target for PNG) */}
      <div
        ref={scheduleTableRef}
        className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm"
      >
        {/* Table Watermark & Branding in Exported Image */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="text-base font-black text-amber-950 dark:text-amber-100 tracking-tight flex items-center gap-1.5">
              <span>El Capiómetro</span>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">· Horario Semanal</span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {schedule.length} sesiones académicas registradas
            </p>
          </div>
          <div className="text-right text-[11px] font-semibold text-stone-400">
            Escala Universitaria
          </div>
        </div>

        {/* VIEW 1: WEEKLY EXCEL-STYLE GRID */}
        {viewMode === 'grid' && (
          <div className="overflow-x-auto pb-2">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-800/80">
                  <th className="py-3 px-3 font-black text-stone-500 dark:text-stone-400 text-[11px] uppercase tracking-wider w-20 text-center">
                    Hora
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="py-3 px-3 font-black text-amber-950 dark:text-amber-200 text-xs uppercase tracking-wider border-l border-stone-200/60 dark:border-stone-700/60 text-center"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80 font-normal">
                {HOURS.map((hourStr) => {
                  const hourNum = timeToHour(hourStr);
                  const nextHourStr = `${(parseInt(hourStr.split(':')[0], 10) + 1).toString().padStart(2, '0')}:00`;

                  return (
                    <tr
                      key={hourStr}
                      className="hover:bg-amber-50/20 dark:hover:bg-stone-800/30 transition-colors"
                    >
                      {/* Time Column */}
                      <td className="py-2.5 px-2 text-center text-[11px] font-mono font-bold text-stone-400 border-r border-stone-100 dark:border-stone-800/80 select-none">
                        <div>{hourStr}</div>
                        <div className="text-[9px] text-stone-300 dark:text-stone-600">{nextHourStr}</div>
                      </td>

                      {/* Day Columns */}
                      {DAYS.map((day) => {
                        // Find matching slots that start in this hour or cover this block
                        const activeSlots = schedule.filter((s) => {
                          if (s.day !== day) return false;
                          const start = timeToHour(s.startTime);
                          const end = timeToHour(s.endTime);
                          return start <= hourNum && hourNum < end;
                        });

                        return (
                          <td
                            key={day}
                            className="py-1 px-1.5 align-top border-l border-stone-100 dark:border-stone-800/80 h-14 min-w-[110px]"
                          >
                            {activeSlots.map((slot) => {
                              const courseName = getSlotCourseName(slot);
                              const colors = getCourseColor(courseName);
                              const isStartHour = Math.floor(timeToHour(slot.startTime)) === Math.floor(hourNum);

                              return (
                                <div
                                  key={slot.id}
                                  className={`p-2 rounded-xl border ${colors.bg} ${colors.border} shadow-2xs group relative transition-transform hover:scale-[1.01] mb-1`}
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <div className="space-y-0.5">
                                      <div className={`font-bold text-xs leading-tight line-clamp-2 ${colors.text}`}>
                                        {courseName}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-stone-600 dark:text-stone-300">
                                        <span className="font-semibold tabular-nums">
                                          {slot.startTime} - {slot.endTime}
                                        </span>
                                      </div>
                                      <div className="pt-0.5">
                                        <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-medium ${colors.tag}`}>
                                          {slot.classroom}
                                        </span>
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => onRemoveSlot(slot.id)}
                                      className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-600 p-0.5 transition-opacity"
                                      title="Eliminar sesión"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: CARDS LIST BY DAY */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS.map((day) => {
              const slotsForDay = schedule
                .filter((s) => s.day === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              return (
                <div
                  key={day}
                  className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-stone-200/70 dark:border-stone-700/60 pb-2 mb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                        {day}
                      </span>
                      <span className="text-[10px] text-stone-400 font-semibold">
                        {slotsForDay.length} clase{slotsForDay.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {slotsForDay.length === 0 ? (
                      <div className="py-6 text-center text-xs text-stone-400">
                        Sin clases este día
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {slotsForDay.map((slot) => {
                          const courseName = getSlotCourseName(slot);
                          const colors = getCourseColor(courseName);

                          return (
                            <div
                              key={slot.id}
                              className={`p-2.5 rounded-xl border ${colors.bg} ${colors.border} flex items-start justify-between group`}
                            >
                              <div className="space-y-1">
                                <div className={`font-bold text-xs ${colors.text}`}>
                                  {courseName}
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-stone-600 dark:text-stone-300">
                                  <span className="flex items-center gap-1 font-semibold tabular-nums">
                                    <Clock className="w-3 h-3 opacity-70" />
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 opacity-60" />
                                    {slot.classroom}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => onRemoveSlot(slot.id)}
                                className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-600 p-1 transition-opacity"
                                title="Eliminar clase"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
