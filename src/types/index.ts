export type CycleId = string;

export interface CycleDefinition {
  id: CycleId;
  name: string;
  subtitle: string;
  period: string;
  isCustom?: boolean;
}

export type OutfitId =
  | 'none'
  | 'grad'
  | 'glasses'
  | 'coffee'
  | 'crown'
  | 'party'
  | 'tutu'
  | 'tie'
  | 'astro'
  | 'sunglasses'
  | 'headphones'
  | 'backpack'
  | 'pizza'
  | 'scarf';

export type CapySkin = 'classic' | 'chocolate' | 'matcha' | 'strawberry' | 'golden';

export type CapyMood = 'empty' | 'great' | 'good' | 'ok' | 'bad' | 'scared' | 'sleep' | 'happy';

export interface EvaluationItem {
  id: string;
  name: string;
  shortName?: string;
  weight: number; // percentage (0.1 to 1.0, or relative integer)
  minHint?: number | null;
}

export interface EvaluationGroup {
  id: string;
  name: string;
  weightInCourse: number; // e.g. 0.40 for 40%
  description?: string;
  type: 'weighted_sum' | 'simple_average' | 'single';
  items: EvaluationItem[];
}

export interface CourseConfig {
  id: string;
  cycleId: CycleId;
  name: string;
  code?: string;
  icon: string;
  credits: number;
  groups: EvaluationGroup[];
  // Direct calculations for courses with nested formulas
  customCalcType?: 'mat0' | 'inf0' | 'len0' | 'con0' | 'emp0' | 'mat1' | 'eco1' | 'len1' | 'eth1' | 'standard';
}

export interface MissingEvaluation {
  id: string;
  name: string;
  weight: number;
  neededFor11: number | null;
  neededFor14: number | null;
  neededFor16: number | null;
}

export interface CourseCalculationResult {
  accumulated: number;
  isComplete: boolean;
  finalGrade: number | null;
  currentEstimatedGrade: number | null;
  missingEvaluations: MissingEvaluation[];
  neededAverageFor11: number | null;
  neededAverageFor14: number | null;
  neededAverageFor16: number | null;
  status: 'passed' | 'failed' | 'in_progress' | 'impossible' | 'empty';
  statusLabel: string;
  progressPercent: number; // towards passing 11
  scorePercent: number; // 0 to 100% based on 20.0
}

// Student Tools: Attendance Tracker (DPI limit)
export interface CourseAttendance {
  courseId: string;
  totalHoursPerWeek: number; // e.g. 4 hours
  totalWeeks: number; // e.g. 16 weeks
  maxAbsencePercentage: number; // default 30%
  absencesRecorded: number;
}

// Student Tools: Tasks & Deadlines
export interface AcademicTask {
  id: string;
  title: string;
  courseId: string;
  dueDate: string; // YYYY-MM-DD
  type: 'pc' | 'parcial' | 'final' | 'trabajo' | 'control';
  completed: boolean;
}

// Student Tools: Weekly Schedule Slot
export interface ScheduleSlot {
  id: string;
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';
  startTime: string; // "08:00"
  endTime: string; // "10:00"
  courseId: string;
  classroom: string;
  color?: string;
  courseName?: string;
}

// Student Tools: Note Taking Tool
export interface NoteItem {
  id: string;
  title: string;
  content: string;
  courseId: string; // or 'general'
  tags: string[];
  createdAt: string;
  updatedAt: string;
  color?: string;
}

// Student Tools: Flashcards / Tarjetas de Aprendizaje
export interface FlashcardItem {
  id: string;
  courseId: string; // or 'general'
  front: string; // Pregunta o concepto
  back: string; // Respuesta o explicación
  difficulty: 'easy' | 'medium' | 'hard' | 'unreviewed';
  reviewCount: number;
  lastReviewed?: string;
}

// Student Tools: Capi AI Chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  imageUrl?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  mode: 'advisor' | 'tutor';
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// Global App State
export interface AppState {
  cycles: CycleDefinition[];
  currentCycle: CycleId;
  selectedCourseId: string;
  grades: Record<string, number | null>;
  currentOutfit: OutfitId;
  currentSkin: CapySkin;
  darkMode: boolean;
  customCourses: CourseConfig[];
  attendances: Record<string, CourseAttendance>;
  tasks: AcademicTask[];
  schedule: ScheduleSlot[];
  notes: NoteItem[];
  flashcards: FlashcardItem[];
  chatConversations: ChatConversation[];
  activeViewTab: 'courses' | 'study' | 'capi-ai' | 'schedule' | 'attendance' | 'tasks';
}
