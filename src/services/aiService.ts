import { CourseConfig } from '../types';
import { calculateCourse, formatGrade } from '../utils/gradeCalculations';

const API_KEY_STORAGE_KEY = 'capi_gemini_api_key';

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  const localKey = localStorage.getItem(API_KEY_STORAGE_KEY);
  if (localKey && localKey.trim()) return localKey.trim();
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim()) return envKey.trim();
  return '';
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key.trim()) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

export function isStaticHost(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname.includes('github.io') ||
    window.location.protocol === 'file:' ||
    window.location.hostname.includes('pages.dev')
  );
}

export interface ChatApiMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

export interface ChatAcademicContext {
  courses: CourseConfig[];
  grades: Record<string, number | null>;
  currentGpa: number | null;
  selectedCourseId?: string;
}

/**
 * Intelligent local academic counselor fallback for static hosting / offline
 */
export function generateLocalCapiAdvice(
  userText: string,
  context: ChatAcademicContext,
  hasImage: boolean = false
): string {
  const { courses, grades, currentGpa, selectedCourseId } = context;
  const lowerText = userText.toLowerCase().trim();

  // Evaluate all current courses
  const evaluatedCourses = courses.map((course) => {
    const calc = calculateCourse(course, grades);
    return {
      course,
      calc,
      name: course.name,
      score: calc.accumulated,
      isPassing: calc.accumulated >= 11.0,
      neededFor11: calc.neededAverageFor11,
      neededFor14: calc.neededAverageFor14,
      status: calc.status,
    };
  });

  const inRisk = evaluatedCourses.filter((c) => c.score > 0 && c.score < 11.0);
  const passing = evaluatedCourses.filter((c) => c.score >= 11.0);
  const selected = evaluatedCourses.find((c) => c.course.id === selectedCourseId) || evaluatedCourses[0];

  // Case 1: Image sent but no API key configured on static host
  if (hasImage && !getStoredApiKey()) {
    return (
      `🐾 ¡He recibido tu imagen! Como estás usando la app en GitHub Pages (un servidor estático sin backend), para que pueda analizar imágenes y leer notas con visión artificial de Google Gemini, por favor pulsa el botón **"🔑 Activar Gemini"** arriba e ingresa tu API Key gratuita de Google AI Studio.\n\n` +
      `Mientras tanto, cuéntame en texto qué curso o notas aparecen en la imagen y te ayudo a calcularlo al instante.`
    );
  }

  // Case 2: Inquiries about withdrawal / dropping a course ("retiro", "retirarme", "dejar el curso")
  if (lowerText.includes('retiro') || lowerText.includes('retirar') || lowerText.includes('baja') || lowerText.includes('dejar')) {
    if (selected && selected.neededFor11 !== null && selected.neededFor11 > 17) {
      return (
        `🐾 **Consejo sobre Retiro de Curso:**\n\n` +
        `Para **${selected.name}**, tu acumulado actual es de **${formatGrade(selected.score)}/20** y necesitas promediar **${formatGrade(selected.neededFor11)}** en las evaluaciones restantes.\n\n` +
        `⚠️ Al ser una meta mayor a 17, el riesgo de reprobar y generar bica es alto. Si la fecha límite de retiro extraordinario de tu universidad sigue vigente y no quieres dañar tu promedio ponderado general (${currentGpa ? formatGrade(currentGpa) : 'actual'}), **el retiro es una decisión estratégica válida** para enfocarte con fuerza en tus demás materias.`
      );
    } else if (selected) {
      return (
        `🐾 **Evaluación de Retiro para ${selected.name}:**\n\n` +
        `Tu acumulado va en **${formatGrade(selected.score)}/20**. Necesitas un promedio de **${selected.neededFor11 !== null ? formatGrade(selected.neededFor11) : 'menos de 11'}** en lo que falta para aprobar con 11.0.\n\n` +
        `¡Aún es totalmente salvable! No te apresures a retirarte. Concéntrate en la evaluación que tenga mayor peso porcentual (usualmente el Parcial o Final) y asegura esos puntos.`
      );
    }
  }

  // Case 3: Inquiries about how to raise grades / save the course ("subir", "salvar", "aprobar", "como", "estrategia")
  if (lowerText.includes('sub') || lowerText.includes('salv') || lowerText.includes('aprob') || lowerText.includes('puedo') || lowerText.includes('estrategia')) {
    if (inRisk.length > 0) {
      const worst = inRisk.sort((a, b) => a.score - b.score)[0];
      return (
        `🐾 **Plan de Rescate Universitario:**\n\n` +
        `Tu curso con mayor urgencia ahora es **${worst.name}** (acumulado: **${formatGrade(worst.score)}/20**). ` +
        `Para alcanzar la valla de 11.0 necesitas un promedio de **${worst.neededFor11 !== null ? formatGrade(worst.neededFor11) : '12'}** en lo que queda.\n\n` +
        `💡 **3 Pasos Clave:**\n` +
        `1. Revisa qué evaluación pendiente tiene mayor porcentaje (ej. Examen Final o EP).\n` +
        `2. En ${worst.name}, no estudies teoría pasiva: resuelve exámenes pasados con cronómetro (técnica Pomodoro en la pestaña Pomodoro).\n` +
        `3. En tus cursos aprobados (${passing.map((p) => p.name).join(', ') || 'los demás'}), mantén el ritmo para que sumen a tu ponderado.`
      );
    } else if (evaluatedCourses.length > 0) {
      return (
        `🐾 **¡Vas por excelente camino!**\n\n` +
        `Tus cursos evaluados están en zona aprobatoria. Para aspirar al **Tercio Superior (≥ 14.0)**:\n` +
        evaluatedCourses.map((c) => `• **${c.name}**: necesitas ${c.neededFor14 !== null ? formatGrade(c.neededFor14) : 'mantener el ritmo'} para promediar 14.`).join('\n') +
        `\n\n¡Sigue asegurando los puntos en trabajos y prácticas para entrar al examen final con calma!`
      );
    }
  }

  // Case 4: How much do I need? ("cuanto necesito", "cuánto falta", "nota")
  if (lowerText.includes('cuanto') || lowerText.includes('cuánto') || lowerText.includes('necesito') || lowerText.includes('falta')) {
    if (selected) {
      return (
        `🐾 **Cálculo exacto para ${selected.name}:**\n\n` +
        `• **Acumulado actual:** ${formatGrade(selected.score)} / 20\n` +
        `• **Para aprobar con 11.0:** necesitas promediar **${selected.neededFor11 !== null ? formatGrade(selected.neededFor11) : '¡Ya estás aprobado!'}** en las evaluaciones pendientes.\n` +
        `• **Para Tercio Superior (14.0):** necesitas promediar **${selected.neededFor14 !== null ? formatGrade(selected.neededFor14) : 'Ya alcanzado'}**.\n\n` +
        `Puedes ver el detalle de cada evaluación en la pestaña "Cursos & Calificaciones".`
      );
    }
  }

  // Default friendly advice analyzing general situation
  const riskSummary = inRisk.length > 0
    ? `Atención prioritaria en: ${inRisk.map((r) => `${r.name} (${formatGrade(r.score)})`).join(', ')}.`
    : `¡Todos tus cursos con nota van sobre 11!`;

  return (
    `🐾 ¡Hola! Aquí el Capi Consejero.\n\n` +
    `Tu promedio ponderado del ciclo es de **${currentGpa ? formatGrade(currentGpa) : '—'}/20**. ${riskSummary}\n\n` +
    `¿Tienes dudas sobre si salvas algún curso, cuánto necesitas en el examen final o si te conviene retirarte para salvar el promedio? ¡Pregúntame!`
  );
}

/**
 * Universal Gemini Caller: Supports client-side direct calls (GitHub Pages) and server-side proxy
 */
export async function sendChatMessageToCapi(params: {
  messages: ChatApiMessage[];
  context: ChatAcademicContext;
  imageBase64?: string;
  mimeType?: string;
}): Promise<string> {
  const { messages, context, imageBase64, mimeType } = params;
  const storedKey = getStoredApiKey();
  const lastUserMsg = messages[messages.length - 1]?.content || '';

  // 1. Direct call to Google Gemini REST API if API Key is configured
  if (storedKey) {
    try {
      const coursesSummary = context.courses
        .map((c) => {
          const res = calculateCourse(c, context.grades);
          return `• ${c.name}: Acumulado ${res.accumulated}/20 (Estado: ${res.statusLabel}, Necesita promedio ${res.neededAverageFor11 ?? 'N/A'} para 11, Necesita ${res.neededAverageFor14 ?? 'N/A'} para 14)`;
        })
        .join('\n');

      const systemInstruction = `
Eres el "Capi Consejero Académico Universitario" 🐾🎓 de El Capiómetro.
Tu misión es asesorar a los estudiantes para cuidar su promedio ponderado y no jalar materias en la escala de 0 a 20 (aprobatorio = 11.0, tercio superior = 14.0).

CONTEXTO DEL ESTUDIANTE:
${coursesSummary || 'Sin notas detalladas aún.'}
${context.currentGpa ? `Promedio Ponderado General: ${context.currentGpa}` : ''}

REGLAS DE RESPUESTA:
- Responde de forma RÁPIDA, DIRECTA, AMIGABLE y AL PUNTO (máximo 2 párrafos concisos o viñetas).
- Si te envían una foto o captura de intranet/notas/examen, analízala minuciosamente y dale los cálculos exactos.
- Sé claro con los números: calcula cuánto necesita para llegar a 11.0 o 14.0.
- Si necesita una nota imposible (>18 o >20), dile con calma que considere solicitar retiro antes de la fecha límite para evitar bica o trika.
`;

      const contents: any[] = [];

      if (imageBase64) {
        let cleanBase64 = imageBase64;
        let cleanMime = mimeType || 'image/png';
        if (cleanBase64.includes(';base64,')) {
          const parts = cleanBase64.split(';base64,');
          if (parts[0].includes(':')) cleanMime = parts[0].split(':')[1];
          cleanBase64 = parts[1];
        }
        contents.push({
          parts: [
            {
              inlineData: {
                mimeType: cleanMime,
                data: cleanBase64,
              },
            },
            { text: lastUserMsg || 'Analiza esta imagen y mis notas.' },
          ],
        });
      } else {
        // Recent conversation context
        const recent = messages.slice(-5);
        for (const m of recent) {
          contents.push({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          });
        }
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${storedKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 450,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) return candidate;
      }
      console.warn('Direct Gemini API call failed, trying fallbacks...');
    } catch (directErr) {
      console.warn('Error calling Gemini directly:', directErr);
    }
  }

  // 2. Try backend endpoint if NOT strictly on a static host without server
  if (!isStaticHost()) {
    try {
      const coursesSummary = context.courses
        .map((c) => {
          const res = calculateCourse(c, context.grades);
          return `• ${c.name}: Acumulado ${res.accumulated}/20 (Estado: ${res.statusLabel}, Necesita promedio ${res.neededAverageFor11 ?? 'N/A'} para 11)`;
        })
        .join('\n');

      const selectedCourse = context.courses.find((c) => c.id === context.selectedCourseId);

      const res = await fetch('/api/chat-capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'advisor',
          messages: messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.content,
          })),
          imageBase64,
          mimeType,
          context: {
            coursesSummary,
            currentGpa: context.currentGpa,
            selectedCourse: selectedCourse
              ? {
                  name: selectedCourse.name,
                  accumulated: calculateCourse(selectedCourse, context.grades).accumulated,
                }
              : null,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.reply) {
          return data.reply;
        }
      }
    } catch (serverErr) {
      console.warn('Backend /api/chat-capi unreachable, switching to local advisor:', serverErr);
    }
  }

  // 3. Fallback to Autonomous Local Academic Counselor
  const localAdvice = generateLocalCapiAdvice(lastUserMsg, context, !!imageBase64);
  return localAdvice;
}

/**
 * Universal Syllabus Extractor for both backend and direct GitHub Pages
 */
export async function parseSyllabusAI(params: {
  text?: string;
  fileBase64?: string;
  mimeType?: string;
}): Promise<any> {
  const { text, fileBase64, mimeType } = params;
  const storedKey = getStoredApiKey();

  // Try direct client-side call if key present
  if (storedKey) {
    try {
      const prompt = `
Eres un asistente académico experto en sílabos y sistemas de evaluación universitaria.
Analiza este sílabo y devuelve ÚNICAMENTE un JSON con:
{
  "name": "Nombre oficial del curso",
  "code": "Código opcional",
  "credits": 4,
  "icon": "📖",
  "evaluations": [
    { "name": "PC1", "weight": 20 },
    { "name": "PC2", "weight": 20 },
    { "name": "Examen Parcial", "weight": 30 },
    { "name": "Examen Final", "weight": 30 }
  ]
}
Importante: La suma de todos los pesos 'weight' debe ser 100%.
${text ? `Texto:\n${text}` : ''}
`;

      const contents: any[] = [];
      if (fileBase64 && mimeType) {
        contents.push({
          inlineData: {
            mimeType: mimeType.includes('jpg') ? 'image/jpeg' : mimeType,
            data: fileBase64.replace(/\s/g, ''),
          },
        });
      }
      contents.push({ text: prompt });

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${storedKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: contents }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const jsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          if (parsed.name && parsed.evaluations) return parsed;
        }
      }
    } catch (e) {
      console.warn('Direct syllabus extraction failed:', e);
    }
  }

  // Try backend proxy if available
  if (!isStaticHost()) {
    const res = await fetch('/api/parse-syllabus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, fileBase64, mimeType }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.course) return data.course;
    }
  }

  throw new Error('No se pudo procesar automáticamente');
}

/**
 * Universal Schedule OCR for both backend and direct GitHub Pages
 */
export async function parseScheduleImageAI(params: {
  imageBase64: string;
  mimeType?: string;
}): Promise<any[]> {
  const { imageBase64, mimeType } = params;
  const storedKey = getStoredApiKey();

  // Try direct Gemini if key available
  if (storedKey) {
    try {
      let cleanMime = (mimeType || 'image/png').toLowerCase().trim();
      if (cleanMime.includes('jpg')) cleanMime = 'image/jpeg';
      let cleanBase64 = imageBase64.replace(/\s/g, '');
      if (cleanBase64.includes(';base64,')) {
        cleanBase64 = cleanBase64.split(';base64,')[1];
      }

      const prompt = `
Digitaliza este horario de clases universitario a partir de la imagen.
Devuelve ÚNICAMENTE un JSON válido con este formato:
{
  "schedule": [
    {
      "courseName": "Nombre del curso",
      "day": "Lunes",
      "startTime": "08:00",
      "endTime": "10:00",
      "classroom": "A-201"
    }
  ]
}
Días válidos: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado. Horas en formato 24h.
`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${storedKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: cleanMime,
                      data: cleanBase64,
                    },
                  },
                  { text: prompt },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const jsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          if (Array.isArray(parsed.schedule)) return parsed.schedule;
        }
      }
    } catch (e) {
      console.warn('Direct schedule OCR failed:', e);
    }
  }

  // Try backend proxy if available
  if (!isStaticHost()) {
    const res = await fetch('/api/parse-schedule-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.schedule)) return data.schedule;
    }
  }

  throw new Error('No se pudo leer la captura de horario automáticamente.');
}
