import React from 'react';
import { CourseConfig, CourseAttendance } from '../types';
import { ShieldAlert, AlertTriangle, CheckCircle2, UserX, Plus, Minus, Info } from 'lucide-react';

interface AttendanceTrackerTabProps {
  courses: CourseConfig[];
  attendances: Record<string, CourseAttendance>;
  onUpdateAttendance: (courseId: string, absences: number) => void;
}

export const AttendanceTrackerTab: React.FC<AttendanceTrackerTabProps> = ({
  courses,
  attendances,
  onUpdateAttendance,
}) => {
  return (
    <div className="space-y-6">
      {/* Informative Top Card */}
      <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">
            Regla Universitaria del Límite de Inasistencias (DPI)
          </h3>
          <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5 leading-relaxed">
            En la mayoría de universidades, superar el <strong>30% de inasistencias</strong> injustificadas
            conlleva al temido <strong>DPI (Desaprobado por Inasistencias)</strong>, perdiendo el derecho al examen final.
            Lleva la cuenta exacta aquí para nunca poner en riesgo tu matrícula.
          </p>
        </div>
      </div>

      {/* Courses Attendance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course) => {
          const attendance = attendances[course.id] || {
            courseId: course.id,
            totalHoursPerWeek: 4,
            totalWeeks: 16,
            maxAbsencePercentage: 30,
            absencesRecorded: 0,
          };

          const totalSessions = attendance.totalWeeks; // e.g. 16 sessions
          const maxAllowed = Math.floor((totalSessions * attendance.maxAbsencePercentage) / 100); // e.g. 4.8 -> 4 absences
          const recorded = attendance.absencesRecorded;
          const remaining = maxAllowed - recorded;

          const isDpi = recorded > maxAllowed;
          const isDanger = remaining === 1;
          const isWarning = remaining === 2;
          const isSafe = remaining > 2;

          let statusBadge = '';
          let badgeText = '';

          if (isDpi) {
            statusBadge = 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-300';
            badgeText = '¡Límite DPI Superado!';
          } else if (isDanger) {
            statusBadge = 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300';
            badgeText = '¡Última falta permitida!';
          } else if (isWarning) {
            statusBadge = 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300 border border-yellow-300';
            badgeText = 'Cuidado: 2 faltas restantes';
          } else {
            statusBadge = 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300';
            badgeText = 'Asistencia segura';
          }

          return (
            <div
              key={course.id}
              className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{course.icon}</span>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                      {course.name}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${statusBadge}`}>
                    {badgeText}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-3 mb-1 text-xs">
                  <span className="text-stone-500 dark:text-stone-400">
                    Inasistencias registradas:
                  </span>
                  <span className="font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
                    {recorded} de {maxAllowed} permitidas
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isDpi ? 'bg-rose-600' : isDanger ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (recorded / maxAllowed) * 100)}%` }}
                  />
                </div>

                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
                  {isDpi ? (
                    <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                      <UserX className="w-3.5 h-3.5" />
                      Has acumulado {recorded} faltas. Justifica en secretaría académica.
                    </span>
                  ) : remaining === 0 ? (
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      No puedes faltar a ninguna clase más.
                    </span>
                  ) : (
                    <span>
                      Puedes faltar como máximo <strong>{remaining} vez{remaining > 1 ? 'es' : ''} más</strong> sin jalar.
                    </span>
                  )}
                </div>
              </div>

              {/* Counter Controls */}
              <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                <span className="text-xs font-semibold text-stone-400">Anotar falta:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateAttendance(course.id, Math.max(0, recorded - 1))}
                    disabled={recorded === 0}
                    className="w-8 h-8 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 disabled:opacity-30 hover:bg-stone-100 transition-colors"
                    title="Restar 1 falta"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-black text-stone-800 dark:text-stone-200 tabular-nums">
                    {recorded}
                  </span>
                  <button
                    onClick={() => onUpdateAttendance(course.id, recorded + 1)}
                    className="w-8 h-8 rounded-xl border border-stone-200 dark:border-stone-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-center justify-center hover:bg-amber-100 transition-colors"
                    title="Sumar 1 falta"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
