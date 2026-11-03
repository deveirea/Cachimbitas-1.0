import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import { CourseConfig } from '../types';
import { calculateCourse, formatGrade } from '../utils/gradeCalculations';
import {
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  BarChart3,
  ListOrdered,
} from 'lucide-react';

interface CourseGradesChartProps {
  courses: CourseConfig[];
  grades: Record<string, number | null>;
  selectedCourseId?: string;
  onSelectCourse?: (courseId: string) => void;
}

export const CourseGradesChart: React.FC<CourseGradesChartProps> = ({
  courses,
  grades,
  selectedCourseId,
  onSelectCourse,
}) => {
  const [viewMode, setViewMode] = useState<'all_courses' | 'course_evals'>('all_courses');
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');
  
  // Pick active course for detailed evaluation breakdown
  const activeCourse =
    courses.find((c) => c.id === selectedCourseId) ||
    courses[0] ||
    null;

  // Process data for "All Courses in Cycle"
  const coursesData = courses.map((course) => {
    const calc = calculateCourse(course, grades);
    const score = calc.accumulated;
    const isPassing = score >= 11;
    const isTercio = score >= 14;

    return {
      courseId: course.id,
      name: course.name,
      shortName:
        course.name.length > 18 ? course.name.substring(0, 16) + '...' : course.name,
      score: parseFloat(score.toFixed(2)),
      displayScore: formatGrade(score),
      credits: course.credits,
      isComplete: calc.isComplete,
      status: calc.status,
      statusLabel: calc.statusLabel,
      isPassing,
      isTercio,
      isSelected: course.id === selectedCourseId,
    };
  });

  // Calculate highest and lowest courses
  const evaluatedCourses = coursesData.filter((c) => c.score > 0);
  const bestCourse = evaluatedCourses.length > 0
    ? [...evaluatedCourses].sort((a, b) => b.score - a.score)[0]
    : null;
  const lowestCourse = evaluatedCourses.length > 0
    ? [...evaluatedCourses].sort((a, b) => a.score - b.score)[0]
    : null;

  // Process data for "Selected Course Evaluations"
  const evalData = (() => {
    if (!activeCourse) return [];
    const points: Array<{
      id: string;
      evalName: string;
      shortName: string;
      weightPercent: string;
      weight: number;
      grade: number | null;
      displayGrade: string;
      isGraded: boolean;
      groupName: string;
    }> = [];

    activeCourse.groups.forEach((group) => {
      group.items.forEach((item) => {
        const gradeVal = grades[item.id];
        const isGraded = gradeVal !== null && gradeVal !== undefined;
        const short = item.shortName || item.name;
        points.push({
          id: item.id,
          evalName: item.name,
          shortName: short.length > 14 ? short.substring(0, 12) + '..' : short,
          weightPercent: `${Math.round(item.weight * group.weightInCourse * 100)}%`,
          weight: item.weight,
          grade: isGraded ? parseFloat(gradeVal.toFixed(1)) : null,
          displayGrade: isGraded ? formatGrade(gradeVal) : 'Pendiente',
          isGraded,
          groupName: group.name,
        });
      });
    });

    return points;
  })();

  const gradedEvalsCount = evalData.filter((e) => e.isGraded).length;

  // Custom Tooltip for Courses Comparison
  const CourseTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-3 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-xl text-xs space-y-1.5 min-w-[200px]">
          <div className="font-black text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-1.5 flex items-center justify-between">
            <span>{p.name}</span>
            <span className="text-[10px] text-stone-400 font-mono">
              {p.credits} créditos
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-stone-500 dark:text-stone-400">Nota Actual:</span>
            <span
              className={`font-mono text-base font-black ${
                p.score >= 11
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : p.score > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-stone-400'
              }`}
            >
              {p.displayScore}
              <span className="text-[10px] text-stone-400 ml-0.5">/20</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-stone-500 dark:text-stone-400">Condición:</span>
            <span
              className={`font-bold ${
                p.score >= 14
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : p.score >= 11
                  ? 'text-amber-800 dark:text-amber-300'
                  : p.score > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-stone-400'
              }`}
            >
              {p.score >= 14
                ? 'Tercio Superior'
                : p.score >= 11
                ? 'Aprobatorio'
                : p.score > 0
                ? 'En Riesgo'
                : 'Sin notas aún'}
            </span>
          </div>
          <p className="text-[10px] text-stone-400 italic pt-1 border-t border-stone-100 dark:border-stone-800">
            Haz clic en el gráfico para ver este curso
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Evaluations
  const EvalTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-3 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-xl text-xs space-y-1.5 min-w-[190px]">
          <div className="font-black text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-1.5">
            {p.evalName}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400">
            Grupo: <span className="font-semibold text-stone-700 dark:text-stone-300">{p.groupName}</span>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-stone-500 dark:text-stone-400">Calificación:</span>
            <span
              className={`font-mono text-base font-black ${
                p.grade !== null && p.grade >= 11
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : p.grade !== null
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-stone-400'
              }`}
            >
              {p.displayGrade}
              {p.grade !== null && <span className="text-[10px] text-stone-400 ml-0.5">/20</span>}
            </span>
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
            <span>Peso en el curso:</span>
            <span className="font-bold text-amber-800 dark:text-amber-300">{p.weightPercent}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
              Gráfica de Rendimiento por Curso
            </h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300">
              Capi Métricas
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {viewMode === 'all_courses'
              ? 'Comparativa del acumulado de tus asignaturas contra la valla de 11.0'
              : `Desglose de evaluaciones para ${activeCourse?.name || 'el curso'}`}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl shrink-0">
          <button
            onClick={() => setViewMode('all_courses')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'all_courses'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Por Curso (Ciclo)</span>
          </button>

          <button
            onClick={() => setViewMode('course_evals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'course_evals'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Por Evaluaciones</span>
          </button>
        </div>
      </div>

      {/* Sub-controls when in course evaluations mode */}
      {viewMode === 'course_evals' && (
        <div className="flex flex-wrap items-center gap-2 p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/60 dark:border-stone-800">
          <span className="text-xs font-bold text-stone-600 dark:text-stone-400 mr-1">
            Curso seleccionado:
          </span>
          {courses.map((c) => {
            const isSelected = activeCourse?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  onSelectCourse?.(c.id);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-amber-400'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Summary KPI row */}
      {viewMode === 'all_courses' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-stone-400 block truncate">
                Mayor Calificación
              </span>
              <span className="text-xs font-black text-stone-800 dark:text-stone-200 truncate block">
                {bestCourse ? bestCourse.name : '—'}
              </span>
              {bestCourse && (
                <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {bestCourse.displayScore} / 20
                </span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-stone-400 block truncate">
                Menor Calificación
              </span>
              <span className="text-xs font-black text-stone-800 dark:text-stone-200 truncate block">
                {lowestCourse ? lowestCourse.name : '—'}
              </span>
              {lowestCourse && (
                <span
                  className={`text-[11px] font-mono font-bold ${
                    lowestCourse.score >= 11
                      ? 'text-stone-600 dark:text-stone-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {lowestCourse.displayScore} / 20
                </span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-700 dark:text-blue-300 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-stone-400 block truncate">
                Total de Cursos
              </span>
              <span className="text-xs font-black text-stone-800 dark:text-stone-200">
                {courses.length} Asignaturas
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                {evaluatedCourses.length} con notas registradas
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CHART RENDERING */}
      <div className="w-full h-72 sm:h-80 select-none">
        {viewMode === 'all_courses' ? (
          coursesData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-stone-400 text-xs">
              No hay cursos en este ciclo para mostrar
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={coursesData}
                margin={{ top: 20, right: 20, left: -10, bottom: 25 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    const cId = e.activePayload[0].payload.courseId;
                    onSelectCourse?.(cId);
                  }
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-stone-200 dark:text-stone-800"
                  vertical={false}
                />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-stone-500 dark:text-stone-400 font-medium"
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  domain={[0, 20]}
                  ticks={[0, 5, 10, 11, 14, 16, 20]}
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  className="text-stone-400 dark:text-stone-500 font-mono"
                />
                <Tooltip content={<CourseTooltip />} />
                <ReferenceLine
                  y={11}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Aprobado (11.0)',
                    position: 'right',
                    fill: '#d97706',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}
                />
                <ReferenceLine
                  y={14}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Tercio (14.0)',
                    position: 'right',
                    fill: '#059669',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}
                />
                <Bar
                  dataKey="score"
                  radius={[8, 8, 0, 0]}
                  cursor="pointer"
                >
                  {coursesData.map((entry, index) => {
                    const fill =
                      entry.score >= 14
                        ? '#059669' // Emerald
                        : entry.score >= 11
                        ? '#854d0e' // Warm amber
                        : entry.score > 0
                        ? '#e11d48' // Rose (at risk)
                        : '#cbd5e1'; // Neutral
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={fill}
                        stroke={entry.isSelected ? '#78350f' : undefined}
                        strokeWidth={entry.isSelected ? 2 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )
        ) : (
          evalData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-stone-400 text-xs">
              No hay evaluaciones configuradas para este curso
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={evalData}
                margin={{ top: 20, right: 25, left: -10, bottom: 25 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-stone-200 dark:text-stone-800"
                  vertical={false}
                />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-stone-500 dark:text-stone-400 font-medium"
                  height={45}
                />
                <YAxis
                  domain={[0, 20]}
                  ticks={[0, 5, 10, 11, 14, 16, 20]}
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  className="text-stone-400 dark:text-stone-500 font-mono"
                />
                <Tooltip content={<EvalTooltip />} />
                <ReferenceLine
                  y={11}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Aprobado (11.0)',
                    position: 'right',
                    fill: '#d97706',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="grade"
                  stroke="#854d0e"
                  strokeWidth={2.5}
                  dot={{
                    r: 5,
                    fill: '#854d0e',
                    strokeWidth: 2,
                    stroke: '#fff',
                  }}
                  activeDot={{
                    r: 7,
                    fill: '#78350f',
                    stroke: '#fef3c7',
                    strokeWidth: 2,
                  }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          )
        )}
      </div>

      {/* Legend & Guide footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
            <span>Tercio Superior (≥ 14.0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-800 inline-block" />
            <span>Aprobado (11.0 - 13.9)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-600 inline-block" />
            <span>En riesgo (&lt; 11.0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-stone-300 dark:bg-stone-700 inline-block" />
            <span>Sin nota aún</span>
          </div>
        </div>

        <span className="text-[11px] text-stone-400 italic">
          💡 Haz clic en una barra para ver o editar sus calificaciones
        </span>
      </div>
    </div>
  );
};
