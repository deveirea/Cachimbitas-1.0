import { CourseConfig, CycleId } from '../types';

export const DEFAULT_COURSES: CourseConfig[] = [
  // ── CICLO 0: PRE / PROPEDÉUTICO ──────────────────────
  {
    id: 'mat0',
    cycleId: 'c0',
    name: 'Matemáticas',
    code: 'MAT-001',
    icon: '📐',
    credits: 4,
    customCalcType: 'mat0',
    groups: [
      {
        id: 'mat0_pcs',
        name: 'Nota de Trabajo (50%)',
        weightInCourse: 0.50,
        description: 'Promedio ponderado con pesos: PC1(2), PC2(2), PC3(3), PC4(3)',
        type: 'weighted_sum',
        items: [
          { id: 'm1', name: 'Práctica Calificada 1', shortName: 'PC1 (Peso 2)', weight: 2 },
          { id: 'm2', name: 'Práctica Calificada 2', shortName: 'PC2 (Peso 2)', weight: 2 },
          { id: 'm3', name: 'Práctica Calificada 3', shortName: 'PC3 (Peso 3)', weight: 3 },
          { id: 'm4', name: 'Práctica Calificada 4', shortName: 'PC4 (Peso 3)', weight: 3 },
        ],
      },
      {
        id: 'mat0_exams',
        name: 'Exámenes (50%)',
        weightInCourse: 0.50,
        type: 'weighted_sum',
        items: [
          { id: 'mep', name: 'Examen Parcial', shortName: 'Parcial (20%)', weight: 0.20 },
          { id: 'mef', name: 'Examen Final', shortName: 'Final (30%)', weight: 0.30 },
        ],
      },
    ],
  },
  {
    id: 'inf0',
    cycleId: 'c0',
    name: 'Informática',
    code: 'INF-001',
    icon: '💻',
    credits: 3,
    customCalcType: 'inf0',
    groups: [
      {
        id: 'inf0_nt',
        name: 'Nota de Trabajo (35%)',
        weightInCourse: 0.35,
        description: 'PC1 (35%), PC2 (45%) y Promedio de Controles de Lab (20%)',
        type: 'weighted_sum',
        items: [
          { id: 'ipc1', name: 'Práctica Calificada 1', shortName: 'PC1 (35% NT)', weight: 0.35 },
          { id: 'ipc2', name: 'Práctica Calificada 2', shortName: 'PC2 (45% NT)', weight: 0.45 },
          { id: 'ic1', name: 'Control de Lab 1', shortName: 'Control 1', weight: 0.20 / 3 },
          { id: 'ic2', name: 'Control de Lab 2', shortName: 'Control 2', weight: 0.20 / 3 },
          { id: 'ic3', name: 'Control de Lab 3', shortName: 'Control 3', weight: 0.20 / 3 },
        ],
      },
      {
        id: 'inf0_exams',
        name: 'Exámenes (65%)',
        weightInCourse: 0.65,
        type: 'weighted_sum',
        items: [
          { id: 'iep', name: 'Examen Parcial', shortName: 'Parcial (30%)', weight: 0.30 },
          { id: 'ief', name: 'Examen Final', shortName: 'Final (35%)', weight: 0.35 },
        ],
      },
    ],
  },
  {
    id: 'len0',
    cycleId: 'c0',
    name: 'Lenguaje',
    code: 'LEN-001',
    icon: '📖',
    credits: 3,
    customCalcType: 'len0',
    groups: [
      {
        id: 'len0_pcs',
        name: 'Prácticas Calificadas (40%)',
        weightInCourse: 0.40,
        description: 'Promedio simple de 3 Prácticas Calificadas',
        type: 'simple_average',
        items: [
          { id: 'lp1', name: 'Práctica Calificada 1', shortName: 'PC1', weight: 0.40 / 3 },
          { id: 'lp2', name: 'Práctica Calificada 2', shortName: 'PC2', weight: 0.40 / 3 },
          { id: 'lp3', name: 'Práctica Calificada 3', shortName: 'PC3', weight: 0.40 / 3 },
        ],
      },
      {
        id: 'len0_exams',
        name: 'Exámenes (60%)',
        weightInCourse: 0.60,
        type: 'weighted_sum',
        items: [
          { id: 'lep', name: 'Examen Parcial', shortName: 'Parcial (30%)', weight: 0.30 },
          { id: 'lef', name: 'Examen Final', shortName: 'Final (30%)', weight: 0.30 },
        ],
      },
    ],
  },
  {
    id: 'con0',
    cycleId: 'c0',
    name: 'Contabilidad',
    code: 'CON-001',
    icon: '📊',
    credits: 3,
    customCalcType: 'con0',
    groups: [
      {
        id: 'con0_nt',
        name: 'Nota de Trabajo (40%)',
        weightInCourse: 0.40,
        description: 'Controles (25%), Prácticas (70%), Participación (5%)',
        type: 'weighted_sum',
        items: [
          { id: 'ccl1', name: 'Control de Lectura 1', shortName: 'Ctrl 1 (CL)', weight: 0.10 },
          { id: 'ccl2', name: 'Control de Lectura 2', shortName: 'Ctrl 2 (CL)', weight: 0.10 },
          { id: 'cp1', name: 'Práctica Calificada 1', shortName: 'PC1', weight: 0.14 },
          { id: 'cp2', name: 'Práctica Calificada 2', shortName: 'PC2', weight: 0.14 },
          { id: 'cp3', name: 'Práctica Calificada 3', shortName: 'PC3', weight: 0.14 },
          { id: 'cp4', name: 'Práctica Calificada 4', shortName: 'PC4', weight: 0.14 },
          { id: 'cp5', name: 'Práctica Calificada 5', shortName: 'PC5', weight: 0.14 },
          { id: 'cprt', name: 'Participación en clase', shortName: 'Participación', weight: 0.05 },
        ],
      },
      {
        id: 'con0_exams',
        name: 'Exámenes (60%)',
        weightInCourse: 0.60,
        type: 'weighted_sum',
        items: [
          { id: 'cep', name: 'Examen Parcial', shortName: 'Parcial (30%)', weight: 0.30 },
          { id: 'cef', name: 'Examen Final', shortName: 'Final (30%)', weight: 0.30 },
        ],
      },
    ],
  },
  {
    id: 'emp0',
    cycleId: 'c0',
    name: 'Cs. Empresariales',
    code: 'EMP-001',
    icon: '🏢',
    credits: 3,
    customCalcType: 'emp0',
    groups: [
      {
        id: 'emp0_cl',
        name: 'Controles de Lectura (20%)',
        weightInCourse: 0.20,
        description: 'Promedio simple de 4 Controles de Lectura',
        type: 'simple_average',
        items: [
          { id: 'ecl1', name: 'Control de Lectura 1', shortName: 'CL1', weight: 0.05 },
          { id: 'ecl2', name: 'Control de Lectura 2', shortName: 'CL2', weight: 0.05 },
          { id: 'ecl3', name: 'Control de Lectura 3', shortName: 'CL3', weight: 0.05 },
          { id: 'ecl4', name: 'Control de Lectura 4', shortName: 'CL4', weight: 0.05 },
        ],
      },
      {
        id: 'emp0_work',
        name: 'Avances, Ensayos y Exámenes (80%)',
        weightInCourse: 0.80,
        type: 'weighted_sum',
        items: [
          { id: 'eav1', name: 'Avance 1 del Proyecto', shortName: 'Avance 1 (5%)', weight: 0.05 },
          { id: 'eav2', name: 'Avance 2 del Proyecto', shortName: 'Avance 2 (10%)', weight: 0.10 },
          { id: 'eens', name: 'Ensayo / Entrega Final', shortName: 'Ensayo (15%)', weight: 0.15 },
          { id: 'eep', name: 'Examen Parcial', shortName: 'Parcial (25%)', weight: 0.25 },
          { id: 'eef', name: 'Examen Final', shortName: 'Final (25%)', weight: 0.25 },
        ],
      },
    ],
  },

  // ── CICLO 1: PRIMER CICLO UNIVERSITARIO ───────────────
  {
    id: 'mat1',
    cycleId: 'c1',
    name: 'Matemáticas I',
    code: 'MAT-101',
    icon: '📐',
    credits: 5,
    customCalcType: 'mat1',
    groups: [
      {
        id: 'mat1_pcs',
        name: 'Prácticas y Controles (40%)',
        weightInCourse: 0.40,
        description: '4 PCs de 9% cada una (36%) + 2 Controles de 2% cada uno (4%)',
        type: 'weighted_sum',
        items: [
          { id: 'c1m1', name: 'Práctica Calificada 1', shortName: 'PC1 (9%)', weight: 0.09 },
          { id: 'c1m2', name: 'Práctica Calificada 2', shortName: 'PC2 (9%)', weight: 0.09 },
          { id: 'c1m3', name: 'Práctica Calificada 3', shortName: 'PC3 (9%)', weight: 0.09 },
          { id: 'c1m4', name: 'Práctica Calificada 4', shortName: 'PC4 (9%)', weight: 0.09 },
          { id: 'c1mc1', name: 'Control de Evaluación 1', shortName: 'Ctrl 1 (2%)', weight: 0.02 },
          { id: 'c1mc2', name: 'Control de Evaluación 2', shortName: 'Ctrl 2 (2%)', weight: 0.02 },
        ],
      },
      {
        id: 'mat1_exams',
        name: 'Exámenes (60%)',
        weightInCourse: 0.60,
        type: 'weighted_sum',
        items: [
          { id: 'c1mep', name: 'Examen Parcial', shortName: 'Parcial (30%)', weight: 0.30 },
          { id: 'c1mef', name: 'Examen Final', shortName: 'Final (30%)', weight: 0.30 },
        ],
      },
    ],
  },
  {
    id: 'eco1',
    cycleId: 'c1',
    name: 'Economía General I',
    code: 'ECO-101',
    icon: '📈',
    credits: 4,
    customCalcType: 'eco1',
    groups: [
      {
        id: 'eco1_pcs',
        name: 'Prácticas Calificadas (40%)',
        weightInCourse: 0.40,
        description: 'Promedio simple de 4 Prácticas Calificadas (40%)',
        type: 'simple_average',
        items: [
          { id: 'c1e1', name: 'Práctica Calificada 1', shortName: 'PC1', weight: 0.10 },
          { id: 'c1e2', name: 'Práctica Calificada 2', shortName: 'PC2', weight: 0.10 },
          { id: 'c1e3', name: 'Práctica Calificada 3', shortName: 'PC3', weight: 0.10 },
          { id: 'c1e4', name: 'Práctica Calificada 4', shortName: 'PC4', weight: 0.10 },
        ],
      },
      {
        id: 'eco1_exams',
        name: 'Exámenes (60%)',
        weightInCourse: 0.60,
        type: 'weighted_sum',
        items: [
          { id: 'c1eep', name: 'Examen Parcial', shortName: 'Parcial (30%)', weight: 0.30 },
          { id: 'c1eef', name: 'Examen Final', shortName: 'Final (30%)', weight: 0.30 },
        ],
      },
    ],
  },
  {
    id: 'len1',
    cycleId: 'c1',
    name: 'Lenguaje I',
    code: 'LEN-101',
    icon: '📖',
    credits: 4,
    customCalcType: 'len1',
    groups: [
      {
        id: 'len1_pcs',
        name: 'Prácticas Calificadas (35%)',
        weightInCourse: 0.35,
        description: 'Promedio simple de 3 Prácticas Calificadas (35%)',
        type: 'simple_average',
        items: [
          { id: 'c1l1', name: 'Práctica Calificada 1', shortName: 'PC1', weight: 0.35 / 3 },
          { id: 'c1l2', name: 'Práctica Calificada 2', shortName: 'PC2', weight: 0.35 / 3 },
          { id: 'c1l3', name: 'Práctica Calificada 3', shortName: 'PC3', weight: 0.35 / 3 },
        ],
      },
      {
        id: 'len1_exams',
        name: 'Exámenes (65%)',
        weightInCourse: 0.65,
        type: 'weighted_sum',
        items: [
          { id: 'c1lep', name: 'Examen Parcial', shortName: 'Parcial (30%)', weight: 0.30 },
          { id: 'c1lef', name: 'Examen Final', shortName: 'Final (35%)', weight: 0.35 },
        ],
      },
    ],
  },
  {
    id: 'eth1',
    cycleId: 'c1',
    name: 'Ética y Deontología',
    code: 'ETH-101',
    icon: '⚖️',
    credits: 3,
    customCalcType: 'eth1',
    groups: [
      {
        id: 'eth1_continuous',
        name: 'Evaluación Continua (35%)',
        weightInCourse: 0.35,
        type: 'weighted_sum',
        items: [
          { id: 'c1etg', name: 'Trabajos Grupales', shortName: 'Grupales (20%)', weight: 0.20 },
          { id: 'c1etp', name: 'Participación Activa', shortName: 'Participación (15%)', weight: 0.15 },
        ],
      },
      {
        id: 'eth1_exams',
        name: 'Exámenes (65%)',
        weightInCourse: 0.65,
        type: 'weighted_sum',
        items: [
          { id: 'c1etep', name: 'Examen Parcial', shortName: 'Parcial (30%)', weight: 0.30 },
          { id: 'c1etef', name: 'Examen Final', shortName: 'Final (35%)', weight: 0.35 },
        ],
      },
    ],
  },
];

export const CYCLE_LABELS: Record<CycleId, { title: string; subtitle: string; period: string }> = {
  c0: {
    title: 'Ciclo 0',
    subtitle: 'Nivelación / Propedéutico',
    period: 'Ciclo 0 — Nivelación Previa',
  },
  c1: {
    title: 'Ciclo 1',
    subtitle: 'Primer Semestre Regular',
    period: 'Ciclo 1 — 2026-02 Semestre',
  },
  custom: {
    title: 'Mis Cursos',
    subtitle: 'Cursos Personalizados',
    period: 'Malla Personalizada',
  },
};
