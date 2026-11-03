/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  CourseConfig,
  CycleId,
  CycleDefinition,
  OutfitId,
  CapySkin,
  CapyMood,
  CourseAttendance,
  AcademicTask,
  ScheduleSlot,
  ChatConversation,
  ChatMessage,
} from './types';
import { DEFAULT_COURSES } from './data/coursesData';
import { calculateCourse, calculateSemesterGPA, formatGrade } from './utils/gradeCalculations';
import { Header } from './components/Header';
import { StatRibbon } from './components/StatRibbon';
import { CourseCard } from './components/CourseCard';
import { ModoCementerioModal } from './components/ModoCementerioModal';
import { OutfitModal } from './components/OutfitModal';
import { BoletaModal } from './components/BoletaModal';
import { CustomCourseModal } from './components/CustomCourseModal';
import { SyllabusUploadModal } from './components/SyllabusUploadModal';
import { AddCycleModal } from './components/AddCycleModal';
import { SaveInfoModal } from './components/SaveInfoModal';
import { StudentScheduleTab } from './components/StudentScheduleTab';
import { AttendanceTrackerTab } from './components/AttendanceTrackerTab';
import { AcademicTasksTab } from './components/AcademicTasksTab';
import { StudyMethodsTab } from './components/StudyMethodsTab';
import { SidebarDrawer } from './components/SidebarDrawer';
import { FloatingCapy } from './components/FloatingCapy';
import { CapiIntroModal } from './components/CapiIntroModal';
import { CartaElgaModal } from './components/CartaElgaModal';
import { CapiAiTab } from './components/CapiAiTab';
import { CourseGradesChart } from './components/CourseGradesChart';
import {
  FileUp,
  Plus,
  RotateCcw,
  Download,
  Upload,
  Wand2,
  Trash2,
  Calendar,
  ShieldCheck,
  CheckSquare,
  Calculator,
  Timer,
  HelpCircle,
  Bot,
  Grid,
  Maximize2,
  Check,
  Sparkles,
  ChevronRight,
  Bookmark,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'cachimbitas_pro_data_v3';

const INITIAL_CYCLES: CycleDefinition[] = [
  {
    id: 'c0',
    name: 'Ciclo 0',
    subtitle: 'Nivelación / Propedéutico',
    period: 'Ciclo 0 — Nivelación Previa',
  },
  {
    id: 'c1',
    name: 'Ciclo 1',
    subtitle: 'Primer Semestre Regular',
    period: 'Ciclo 1 — 2026-02 Semestre',
  },
  {
    id: 'custom',
    name: 'Mis Cursos',
    subtitle: 'Malla Personalizada',
    period: 'Cursos Propios',
  },
];

const INITIAL_CHAT_CONVERSATION: ChatConversation = {
  id: 'conv-1',
  title: '🎓 Consejero de Rescate Universitario',
  mode: 'advisor',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messages: [
    {
      id: 'msg-1',
      role: 'assistant',
      content: '¡Hola cachimbo! 🐾🧢 Soy tu Capi Consejero de Cachimbitas, creado por Elga (:3) para ayudarte a calcular tus notas y no jalar.\n\nPregúntame cualquier duda como:\n• "¿Puedo salvar mi curso de Matemáticas o mejor me retiro?"\n• "¿Cuánto necesito en el final para aprobar con 11 o sacar 14?"\n• "¿Cuál es mi curso más peligroso ahorita?"\n\n¿En qué materia tienes dudas hoy?',
      timestamp: new Date().toISOString(),
    },
  ],
};

export default function App() {
  const [cycles, setCycles] = useState<CycleDefinition[]>(INITIAL_CYCLES);
  const [currentCycle, setCurrentCycle] = useState<CycleId>('c0');
  const [grades, setGrades] = useState<Record<string, number | null>>({});
  const [currentOutfit, setCurrentOutfit] = useState<OutfitId>('none');
  const [currentSkin, setCurrentSkin] = useState<CapySkin>('classic');
  const [customCourses, setCustomCourses] = useState<CourseConfig[]>([]);
  const [selectedCourseTab, setSelectedCourseTab] = useState<string>('');
  const [courseViewMode, setCourseViewMode] = useState<'single' | 'grid'>('single');
  const [showGpaChart, setShowGpaChart] = useState<boolean>(true);
  const [activeToolTab, setActiveToolTab] = useState<'courses' | 'study' | 'capi-ai' | 'schedule' | 'attendance' | 'tasks'>('courses');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Student Tools State
  const [attendances, setAttendances] = useState<Record<string, CourseAttendance>>({});
  const [tasks, setTasks] = useState<AcademicTask[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([INITIAL_CHAT_CONVERSATION]);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-1');
  const [isSendingAiChat, setIsSendingAiChat] = useState(false);

  // Modals state
  const [isCapiIntroOpen, setIsCapiIntroOpen] = useState(false);
  const [isCartaElgaOpen, setIsCartaElgaOpen] = useState(false);
  const [graveCourse, setGraveCourse] = useState<CourseConfig | null>(null);
  const [isOutfitOpen, setIsOutfitOpen] = useState(false);
  const [isBoletaOpen, setIsBoletaOpen] = useState(false);
  const [isCustomCourseOpen, setIsCustomCourseOpen] = useState(false);
  const [editingCustomCourse, setEditingCustomCourse] = useState<CourseConfig | null>(null);
  const [isSyllabusUploadOpen, setIsSyllabusUploadOpen] = useState(false);
  const [isAddCycleOpen, setIsAddCycleOpen] = useState(false);
  const [isSaveInfoOpen, setIsSaveInfoOpen] = useState(false);

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('cachimbitas_dark') === 'true' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    }
    return false;
  });

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cachimbitas_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cachimbitas_dark', 'false');
    }
  }, [darkMode]);

  // Show welcome intro only on the very first time the app is opened
  useEffect(() => {
    const seen = localStorage.getItem('capiometro_welcome_seen_v3');
    if (!seen) {
      setIsCapiIntroOpen(true);
    }
  }, []);

  // Load saved state on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('cachimbitas_pro_data_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.grades) setGrades(parsed.grades);
        if (parsed.currentOutfit) setCurrentOutfit(parsed.currentOutfit);
        if (parsed.currentSkin) setCurrentSkin(parsed.currentSkin);
        if (parsed.currentCycle) setCurrentCycle(parsed.currentCycle);
        if (parsed.customCourses) setCustomCourses(parsed.customCourses);
        if (parsed.cycles && Array.isArray(parsed.cycles)) setCycles(parsed.cycles);
        if (parsed.attendances) setAttendances(parsed.attendances);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.schedule) setSchedule(parsed.schedule);
        if (parsed.chatConversations && Array.isArray(parsed.chatConversations)) {
          setChatConversations(parsed.chatConversations);
          if (parsed.chatConversations[0]) {
            setActiveConversationId(parsed.chatConversations[0].id);
          }
        }
      }
    } catch (e) {
      console.warn('Error reading stored state', e);
    }
  }, []);

  // Save state on change (Automatic LocalStorage persistence)
  useEffect(() => {
    try {
      const payload = {
        grades,
        currentOutfit,
        currentSkin,
        currentCycle,
        customCourses,
        cycles,
        attendances,
        tasks,
        schedule,
        chatConversations,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Error persisting state', e);
    }
  }, [
    grades,
    currentOutfit,
    currentSkin,
    currentCycle,
    customCourses,
    cycles,
    attendances,
    tasks,
    schedule,
    chatConversations,
  ]);

  // Combine default courses with custom courses for this cycle
  const currentCycleCourses = useMemo(() => {
    if (currentCycle === 'custom') {
      return customCourses.filter((c) => c.cycleId === 'custom' || !c.cycleId);
    }
    const defaults = DEFAULT_COURSES.filter((c) => c.cycleId === currentCycle);
    const addedCustom = customCourses.filter((c) => c.cycleId === currentCycle);
    return [...defaults, ...addedCustom];
  }, [currentCycle, customCourses]);

  // Select first course if no course is selected or invalid
  useEffect(() => {
    if (currentCycleCourses.length > 0) {
      if (!selectedCourseTab || selectedCourseTab === 'all' || !currentCycleCourses.some((c) => c.id === selectedCourseTab)) {
        setSelectedCourseTab(currentCycleCourses[0].id);
      }
    }
  }, [currentCycleCourses, currentCycle]);

  // Current Cycle definition
  const currentCycleDef = useMemo(() => {
    return (
      cycles.find((c) => c.id === currentCycle) || {
        id: currentCycle,
        name: 'Ciclo Actual',
        subtitle: 'Semestre Académico',
        period: 'Periodo 2026',
      }
    );
  }, [cycles, currentCycle]);

  // Overall Semester Stats
  const semesterStats = useMemo(() => {
    return calculateSemesterGPA(currentCycleCourses, grades);
  }, [currentCycleCourses, grades]);

  // Determine reactive Capybara mood
  const capyMood: CapyMood = useMemo(() => {
    const hasAnyGrade = Object.values(grades).some((v) => v !== null && v !== undefined);
    if (!hasAnyGrade) return 'empty';
    if (semesterStats.gpa === null) return 'empty';
    if (semesterStats.gpa >= 15.0) return 'great';
    if (semesterStats.gpa >= 13.0) return 'good';
    if (semesterStats.gpa >= 11.0) return 'ok';
    return 'bad';
  }, [grades, semesterStats.gpa]);

  // Handlers for grades
  const handleGradeChange = (fieldId: string, val: number | null) => {
    setGrades((prev) => ({
      ...prev,
      [fieldId]: val,
    }));
  };

  const handleClearCourse = (courseId: string) => {
    const course = currentCycleCourses.find((c) => c.id === courseId);
    if (!course) return;

    const nextGrades = { ...grades };
    course.groups.forEach((g) => {
      g.items.forEach((item) => {
        delete nextGrades[item.id];
      });
    });
    setGrades(nextGrades);
  };

  const handleClearAllCycle = () => {
    const nextGrades = { ...grades };
    currentCycleCourses.forEach((course) => {
      course.groups.forEach((g) => {
        g.items.forEach((item) => {
          delete nextGrades[item.id];
        });
      });
    });
    setGrades(nextGrades);
  };

  const handleQuickFill = (course: CourseConfig, targetGrade: number) => {
    const nextGrades = { ...grades };
    course.groups.forEach((g) => {
      g.items.forEach((item) => {
        nextGrades[item.id] = targetGrade;
      });
    });
    setGrades(nextGrades);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  const handleApplyGraveSimulation = (newScores: Record<string, number>) => {
    setGrades((prev) => ({
      ...prev,
      ...newScores,
    }));
  };

  // Custom Course handlers
  const handleSaveCustomCourse = (newCourse: CourseConfig) => {
    const exists = customCourses.some((c) => c.id === newCourse.id);
    if (exists) {
      setCustomCourses((prev) =>
        prev.map((c) => (c.id === newCourse.id ? newCourse : c))
      );
    } else {
      setCustomCourses((prev) => [...prev, newCourse]);
    }
    setSelectedCourseTab(newCourse.id);
  };

  const handleDeleteCustomCourse = (courseId: string) => {
    setCustomCourses((prev) => prev.filter((c) => c.id !== courseId));
    handleClearCourse(courseId);
  };

  // Cycle creation
  const handleAddCycle = (newCycle: CycleDefinition) => {
    setCycles((prev) => [...prev, newCycle]);
    setCurrentCycle(newCycle.id);
    setSelectedCourseTab('');
  };

  // Export / Import
  const handleExportJSON = () => {
    const exportData = {
      version: '3.0',
      exportDate: new Date().toISOString(),
      grades,
      currentOutfit,
      currentSkin,
      currentCycle,
      customCourses,
      cycles,
      attendances,
      tasks,
      schedule,
      chatConversations,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cachimbitas_respaldo_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackupJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.grades) setGrades(parsed.grades);
        if (parsed.currentOutfit) setCurrentOutfit(parsed.currentOutfit);
        if (parsed.currentSkin) setCurrentSkin(parsed.currentSkin);
        if (parsed.currentCycle) setCurrentCycle(parsed.currentCycle);
        if (parsed.customCourses) setCustomCourses(parsed.customCourses);
        if (parsed.cycles) setCycles(parsed.cycles);
        if (parsed.attendances) setAttendances(parsed.attendances);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.schedule) setSchedule(parsed.schedule);
        if (parsed.chatConversations) setChatConversations(parsed.chatConversations);

        confetti({
          particleCount: 50,
          spread: 60,
        });
      } catch (err) {
        console.error('Error importing backup:', err);
      }
    };
    reader.readAsText(file);
  };

  // Demo grades loader
  const handleLoadDemoGrades = () => {
    const demo: Record<string, number> = {};
    currentCycleCourses.forEach((course) => {
      course.groups.forEach((g) => {
        g.items.forEach((item, idx) => {
          if (idx < 2) {
            demo[item.id] = Math.floor(Math.random() * 6) + 11; // 11 to 16
          }
        });
      });
    });
    setGrades((prev) => ({ ...prev, ...demo }));
    confetti({
      particleCount: 40,
      spread: 60,
    });
  };

  // Attendance handlers
  const handleUpdateAttendance = (courseId: string, absences: number) => {
    setAttendances((prev) => ({
      ...prev,
      [courseId]: {
        courseId,
        totalHoursPerWeek: 4,
        totalWeeks: 16,
        maxAbsencePercentage: 30,
        absencesRecorded: absences,
      },
    }));
  };

  // Task handlers
  const handleAddTask = (task: AcademicTask) => {
    setTasks((prev) => [task, ...prev]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Schedule handlers
  const handleAddScheduleSlot = (slot: ScheduleSlot) => {
    setSchedule((prev) => [...prev, slot]);
  };

  const handleRemoveScheduleSlot = (slotId: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== slotId));
  };



  // Capi AI Chat handlers
  const handleCreateChatConversation = (mode: 'advisor' | 'tutor', title?: string) => {
    const newId = `conv-${Date.now()}`;
    const newConv: ChatConversation = {
      id: newId,
      title: title || (mode === 'advisor' ? '🎓 Consejero de Notas' : '📚 Tutor de Estudio'),
      mode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content:
            mode === 'advisor'
              ? '¡Hola! 🐾 ¿Tienes dudas sobre si salvas algún curso, cuánto necesitas en el examen final o si te conviene retirarte para salvar el promedio? ¡Pregúntame!'
              : '¡Hola! 🐾 Soy tu tutor Capi. ¿Qué tema o fórmula universitaria se te complica? Explícamelo y lo desglosamos paso a paso.',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setChatConversations((prev) => [newConv, ...prev]);
    return newId;
  };

  const handleDeleteChatConversation = (id: string) => {
    setChatConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length > 0 && activeConversationId === id) {
        setActiveConversationId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleSendAiChatMessage = async (
    conversationId: string,
    text: string,
    imageBase64?: string,
    mimeType?: string
  ) => {
    const targetConv = chatConversations.find((c) => c.id === conversationId);
    if (!targetConv) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      imageUrl: imageBase64
        ? imageBase64.startsWith('data:')
          ? imageBase64
          : `data:${mimeType || 'image/png'};base64,${imageBase64}`
        : undefined,
    };

    // Update conversation with user message immediately
    const updatedMessages = [...targetConv.messages, userMessage];
    setChatConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, messages: updatedMessages, updatedAt: new Date().toISOString() } : c))
    );

    setIsSendingAiChat(true);

    try {
      // Build context summary from current cycle courses and grades
      const coursesSummary = currentCycleCourses
        .map((c) => {
          const res = calculateCourse(c, grades);
          return `• ${c.name}: Acumulado ${res.accumulated}/20 (Estado: ${res.statusLabel}, Necesita promedio ${res.neededAverageFor11 ?? 'N/A'} para 11)`;
        })
        .join('\n');

      const selectedCourse = currentCycleCourses.find((c) => c.id === selectedCourseTab);

      const res = await fetch('/api/chat-capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'advisor',
          messages: updatedMessages.map((m) => ({ role: m.role === 'user' ? 'user' : 'model', content: m.content })),
          imageBase64,
          mimeType,
          context: {
            coursesSummary,
            currentGpa: semesterStats.gpa,
            selectedCourse: selectedCourse ? { name: selectedCourse.name, accumulated: calculateCourse(selectedCourse, grades).accumulated } : null,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al comunicarse con el Capi');
      }

      const botMessage: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      setChatConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...updatedMessages, botMessage], updatedAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: 'assistant',
        content: '🐾 Hubo un pequeño error al contactar al Capi. Por favor revisa tu conexión e inténtalo nuevamente.',
        timestamp: new Date().toISOString(),
      };
      setChatConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, messages: [...updatedMessages, errorMessage] } : c
        )
      );
    } finally {
      setIsSendingAiChat(false);
    }
  };



  // Find currently active course object for single-course view
  const activeSelectedCourse = useMemo(() => {
    return currentCycleCourses.find((c) => c.id === selectedCourseTab) || currentCycleCourses[0] || null;
  }, [currentCycleCourses, selectedCourseTab]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#121110] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar Header */}
      <Header
        cycles={cycles}
        currentCycle={currentCycle}
        onSelectCycle={(c) => {
          setCurrentCycle(c);
          setSelectedCourseTab('');
        }}
        onOpenAddCycleModal={() => setIsAddCycleOpen(true)}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenCartaElga={() => setIsCartaElgaOpen(true)}
        onOpenCapiIntro={() => setIsCapiIntroOpen(true)}
        outfit={currentOutfit}
        skin={currentSkin}
        capyMood={capyMood}
        onOpenOutfitModal={() => setIsOutfitOpen(true)}
        onOpenBoletaModal={() => setIsBoletaOpen(true)}
        onOpenSaveInfoModal={() => setIsSaveInfoOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* KPI & Quick Course Ribbon */}
      <StatRibbon
        courses={currentCycleCourses}
        grades={grades}
        selectedCourseId={selectedCourseTab}
        onSelectCourse={(id) => {
          setSelectedCourseTab(id);
          setActiveToolTab('courses');
        }}
        gpa={semesterStats.gpa}
        academicStanding={semesterStats.academicStanding}
      />

      {/* Student App Navigation Bar (Intuitive, clean, non-saturated tabs) */}
      <div className="bg-white/95 dark:bg-stone-900/95 border-b border-stone-200 dark:border-stone-800 sticky top-16 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none py-2.5">
          <div className="flex items-center gap-1.5 p-1 bg-stone-100/90 dark:bg-stone-800/80 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveToolTab('courses')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeToolTab === 'courses'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Cursos & Calificaciones</span>
            </button>

            <button
              onClick={() => setActiveToolTab('capi-ai')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeToolTab === 'capi-ai'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Capi Consejero</span>
            </button>

            <button
              onClick={() => setActiveToolTab('study')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeToolTab === 'study'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Timer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Pomodoro & Métodos</span>
            </button>

            <button
              onClick={() => setActiveToolTab('schedule')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeToolTab === 'schedule'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Horario</span>
            </button>

            <button
              onClick={() => setActiveToolTab('attendance')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeToolTab === 'attendance'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Faltas DPI</span>
            </button>

            <button
              onClick={() => setActiveToolTab('tasks')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeToolTab === 'tasks'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Tareas ({tasks.filter((t) => !t.completed).length})</span>
            </button>
          </div>

          {/* Session Indicator Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSaveInfoOpen(true)}
              className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1.5 px-3 py-1 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Tus datos y notas se guardan de forma permanente en este navegador"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>Sesión activa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
        {/* Active Tab: CAPI AI ASSISTANT & TUTOR */}
        {activeToolTab === 'capi-ai' && (
          <CapiAiTab
            courses={currentCycleCourses}
            grades={grades}
            gpa={semesterStats.gpa}
            outfit={currentOutfit}
            skin={currentSkin}
            conversations={chatConversations}
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
            onCreateConversation={handleCreateChatConversation}
            onDeleteConversation={handleDeleteChatConversation}
            onSendMessage={handleSendAiChatMessage}
            isSending={isSendingAiChat}
            selectedCourseId={selectedCourseTab}
          />
        )}



        {/* Active Tab: STUDY METHODS & POMODORO */}
        {activeToolTab === 'study' && (
          <StudyMethodsTab outfit={currentOutfit} skin={currentSkin} />
        )}

        {/* Active Tab: SCHEDULE */}
        {activeToolTab === 'schedule' && (
          <StudentScheduleTab
            courses={currentCycleCourses}
            schedule={schedule}
            onAddSlot={handleAddScheduleSlot}
            onRemoveSlot={handleRemoveScheduleSlot}
            onSetSchedule={(newSlots) => setSchedule(newSlots)}
            onClearSchedule={() => setSchedule([])}
          />
        )}

        {/* Active Tab: ATTENDANCE TRACKER (DPI) */}
        {activeToolTab === 'attendance' && (
          <AttendanceTrackerTab
            courses={currentCycleCourses}
            attendances={attendances}
            onUpdateAttendance={handleUpdateAttendance}
          />
        )}

        {/* Active Tab: TASKS / EXAM AGENDA */}
        {activeToolTab === 'tasks' && (
          <AcademicTasksTab
            courses={currentCycleCourses}
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onRemoveTask={handleRemoveTask}
          />
        )}

        {/* Active Tab: COURSES & GRADES CALCULATOR (ORGANIZED, CLEAN, SINGLE-COURSE FOCUS) */}
        {activeToolTab === 'courses' && (
          <div className="space-y-6">
            {/* Top Bar for Courses: Subtitle & Tools */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-amber-950 dark:text-amber-100 tracking-tight">
                    {currentCycleDef.name}
                  </h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300">
                    {currentCycleDef.subtitle}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  {currentCycleDef.period} · {currentCycleCourses.length} cursos configurados
                </p>
              </div>

              {/* View mode switcher & Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Single vs Grid Mode Toggle */}
                <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                  <button
                    onClick={() => setCourseViewMode('single')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      courseViewMode === 'single'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                    title="Ver un solo curso enfocado sin pantallas saturadas"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Individual (Limpio)</span>
                  </button>
                  <button
                    onClick={() => setCourseViewMode('grid')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      courseViewMode === 'grid'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                    title="Ver todos los cursos juntos en cuadrícula"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Ver Todos</span>
                  </button>
                </div>

                {/* Course Grades Chart Toggle */}
                <button
                  onClick={() => setShowGpaChart(!showGpaChart)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                    showGpaChart
                      ? 'bg-amber-800 text-white dark:bg-amber-700'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-amber-400'
                  }`}
                  title="Mostrar u ocultar la gráfica de rendimiento por curso (Recharts)"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{showGpaChart ? 'Ocultar Gráfica' : 'Gráfica Cursos'}</span>
                </button>

                {/* Upload Syllabus with AI Button */}
                <button
                  onClick={() => setIsSyllabusUploadOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-900 dark:text-amber-300 transition-colors flex items-center gap-1.5 shadow-xs"
                  title="Subir documento PDF, Word o foto del sílabo para extraer el curso con IA"
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Subir Sílabo (IA)</span>
                </button>

                <button
                  onClick={() => {
                    setEditingCustomCourse(null);
                    setIsCustomCourseOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-400 text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1.5 shadow-xs"
                  title="Agregar un curso nuevo manualmente"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Manual</span>
                </button>

                <button
                  onClick={handleLoadDemoGrades}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-400 text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1 shadow-xs"
                  title="Cargar notas de ejemplo"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Demo</span>
                </button>

                <button
                  onClick={handleClearAllCycle}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Limpiar notas de este ciclo"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Course Selector Tabs (Clean, distinct cards with mini grades) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {currentCycleCourses.map((c) => {
                const calc = calculateCourse(c, grades);
                const isSelected = c.id === selectedCourseTab;
                const score = calc.isComplete ? calc.finalGrade : calc.accumulated;

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCourseTab(c.id);
                      setCourseViewMode('single');
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2.5 shrink-0 border ${
                      isSelected
                        ? 'bg-amber-900 text-white shadow-md border-amber-900 dark:bg-amber-700 dark:border-amber-600 scale-[1.02]'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-300 border-stone-200/90 dark:border-stone-700/80 shadow-xs'
                    }`}
                  >
                    <span className="font-bold">{c.name}</span>
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : score !== null && score >= 11
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : score !== null && score > 0
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-stone-100 text-stone-500 dark:bg-stone-700'
                      }`}
                    >
                      {score !== null && score > 0 ? formatGrade(score) : '—'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Course Grades & Evaluations Chart (Recharts) */}
            {showGpaChart && (
              <CourseGradesChart
                courses={currentCycleCourses}
                grades={grades}
                selectedCourseId={selectedCourseTab}
                onSelectCourse={(courseId) => setSelectedCourseTab(courseId)}
              />
            )}

            {/* Empty State */}
            {currentCycleCourses.length === 0 && (
              <div className="p-12 text-center rounded-3xl border border-dashed border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4">
                <div className="text-4xl">📚</div>
                <div>
                  <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
                    Aún no hay asignaturas en {currentCycleDef.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
                    Sube el sílabo en PDF o imagen para crearlo automáticamente, o créalo de forma manual con tus propios pesos.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setIsSyllabusUploadOpen(true)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-900 hover:bg-amber-800 dark:bg-amber-700 transition-colors inline-flex items-center gap-2"
                  >
                    <FileUp className="w-4 h-4" />
                    <span>Subir Sílabo (IA)</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingCustomCourse(null);
                      setIsCustomCourseOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Manual</span>
                  </button>
                </div>
              </div>
            )}

            {/* Course Display: SINGLE-COURSE FOCUS (Requested by user) */}
            {currentCycleCourses.length > 0 && courseViewMode === 'single' && activeSelectedCourse && (
              <div className="space-y-4 animate-fade-in">
                {/* Focused Course Card */}
                <div className="relative group">
                  <CourseCard
                    course={activeSelectedCourse}
                    grades={grades}
                    onGradeChange={handleGradeChange}
                    onClearCourse={handleClearCourse}
                    onOpenGraveMode={(c) => setGraveCourse(c)}
                    onQuickFillCourse={handleQuickFill}
                  />

                  {activeSelectedCourse.cycleId === 'custom' && (
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteCustomCourse(activeSelectedCourse.id)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 transition-colors"
                        title="Eliminar curso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Shortcuts for the active course */}
                <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      Herramientas para {activeSelectedCourse.name}:
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setGraveCourse(activeSelectedCourse)}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>🪦</span>
                      <span>Modo Cementerio</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveToolTab('capi-ai');
                        const newId = handleCreateChatConversation('advisor', `Salvar ${activeSelectedCourse.name}`);
                        setActiveConversationId(newId);
                        handleSendAiChatMessage(newId, `¿Puedo salvar ${activeSelectedCourse.name} o mejor me retiro?`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Preguntar al Capi IA</span>
                    </button>



                    <button
                      onClick={() => setActiveToolTab('attendance')}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                      <span>Faltas DPI</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Course Display: GRID MODE (When toggled) */}
            {currentCycleCourses.length > 0 && courseViewMode === 'grid' && (
              <div className="space-y-6 animate-fade-in">
                {currentCycleCourses.map((course) => (
                  <div key={course.id} className="relative group">
                    <CourseCard
                      course={course}
                      grades={grades}
                      onGradeChange={handleGradeChange}
                      onClearCourse={handleClearCourse}
                      onOpenGraveMode={(c) => setGraveCourse(c)}
                      onQuickFillCourse={handleQuickFill}
                    />
                    {course.cycleId === 'custom' && (
                      <div className="absolute top-4 right-4 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeleteCustomCourse(course.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 transition-colors"
                          title="Eliminar curso"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Interactive Capybara Mascot */}
      <FloatingCapy
        outfit={currentOutfit}
        skin={currentSkin}
        mood={capyMood}
        gpa={semesterStats.gpa}
        onOpenOutfitModal={() => setIsOutfitOpen(true)}
      />

      {/* Capi Intro / Presentation Modal (Shown only on first visit) */}
      <CapiIntroModal
        isOpen={isCapiIntroOpen}
        onClose={() => {
          localStorage.setItem('capiometro_welcome_seen_v3', 'true');
          setIsCapiIntroOpen(false);
        }}
        onOpenCartaElga={() => setIsCartaElgaOpen(true)}
      />

      {/* Carta de Elga :3 Envelope Modal */}
      <CartaElgaModal
        isOpen={isCartaElgaOpen}
        onClose={() => setIsCartaElgaOpen(false)}
      />

      {/* Modo Cementerio Modal */}
      {graveCourse && (
        <ModoCementerioModal
          isOpen={!!graveCourse}
          onClose={() => setGraveCourse(null)}
          course={graveCourse}
          grades={grades}
          onApplyGrades={handleApplyGraveSimulation}
        />
      )}

      {/* Outfit Wardrobe Modal with Skins */}
      <OutfitModal
        isOpen={isOutfitOpen}
        onClose={() => setIsOutfitOpen(false)}
        currentOutfit={currentOutfit}
        currentSkin={currentSkin}
        onSelectOutfit={(newOutfit) => setCurrentOutfit(newOutfit)}
        onSelectSkin={(newSkin) => setCurrentSkin(newSkin)}
      />

      {/* Boleta de Notas Modal */}
      <BoletaModal
        isOpen={isBoletaOpen}
        onClose={() => setIsBoletaOpen(false)}
        courses={currentCycleCourses}
        grades={grades}
        cycleTitle={currentCycleDef.name}
        outfit={currentOutfit}
        skin={currentSkin}
      />

      {/* Custom Course Modal */}
      <CustomCourseModal
        isOpen={isCustomCourseOpen}
        onClose={() => {
          setIsCustomCourseOpen(false);
          setEditingCustomCourse(null);
        }}
        onSaveCourse={handleSaveCustomCourse}
        initialCourse={editingCustomCourse}
      />

      {/* AI Syllabus Upload Modal */}
      <SyllabusUploadModal
        isOpen={isSyllabusUploadOpen}
        onClose={() => setIsSyllabusUploadOpen(false)}
        targetCycleId={currentCycle}
        onCourseCreated={handleSaveCustomCourse}
      />

      {/* Add Cycle Modal */}
      <AddCycleModal
        isOpen={isAddCycleOpen}
        onClose={() => setIsAddCycleOpen(false)}
        onAddCycle={handleAddCycle}
      />

      {/* Save Information Reassurance Modal */}
      <SaveInfoModal
        isOpen={isSaveInfoOpen}
        onClose={() => setIsSaveInfoOpen(false)}
        onExport={handleExportJSON}
        onImport={handleImportBackupJSON}
      />

      {/* 3-Bar Hamburger Navigation Drawer */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeToolTab}
        onSelectTab={(tab) => {
          setActiveToolTab(tab);
          setIsSidebarOpen(false);
        }}
        outfit={currentOutfit}
        skin={currentSkin}
        capyMood={capyMood}
        gpa={semesterStats.gpa}
        academicStanding={semesterStats.academicStanding}
        pendingTasksCount={tasks.filter((t) => !t.completed).length}
        onOpenSyllabusUpload={() => {
          setIsSidebarOpen(false);
          setIsSyllabusUploadOpen(true);
        }}
        onOpenOutfitModal={() => {
          setIsSidebarOpen(false);
          setIsOutfitOpen(true);
        }}
        onOpenBoletaModal={() => {
          setIsSidebarOpen(false);
          setIsBoletaOpen(true);
        }}
        onOpenSaveInfoModal={() => {
          setIsSidebarOpen(false);
          setIsSaveInfoOpen(true);
        }}
        onOpenAddCycleModal={() => {
          setIsSidebarOpen(false);
          setIsAddCycleOpen(true);
        }}
        onOpenCartaElga={() => {
          setIsSidebarOpen(false);
          setIsCartaElgaOpen(true);
        }}
        onOpenCapiIntro={() => {
          setIsSidebarOpen(false);
          setIsCapiIntroOpen(true);
        }}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportBackupJSON}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
    </div>
  );
}
