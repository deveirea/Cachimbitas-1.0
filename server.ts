import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: AI Syllabus Extractor
app.post('/api/parse-syllabus', async (req, res) => {
  try {
    const { text, fileBase64, mimeType } = req.body;

    if (!text && !fileBase64) {
      return res.status(400).json({ error: 'Debes proporcionar texto o un archivo del sílabo.' });
    }

    const contents: any[] = [];

    if (fileBase64 && mimeType) {
      contents.push({
        inlineData: {
          mimeType,
          data: fileBase64,
        },
      });
    }

    const promptText = `
Eres un asistente académico experto en sílabos y sistemas de evaluación de universidades (especialmente peruanas como UNMSM, UNI, PUCP, UTEC, UPC, etc.).
Analiza este sílabo o documento de evaluación académica y extrae:
1. Nombre del curso (name)
2. Código del curso si existe (code)
3. Cantidad de créditos (credits, número entero, usualmente entre 2 y 6, por defecto 3 o 4)
4. Ícono sugerido (un solo emoji representativo como 📐, 💻, 🔬, 📊, 📖, ⚖️, 📈, 🎨, 🩺, etc.)
5. Lista de todas las evaluaciones del curso con su ponderación porcentual (weight como porcentaje entre 1 y 100).
IMPORTANTE: La suma de todos los pesos 'weight' DEBE sumar exactamente 100%.
Si hay fórmulas complejas (ej. varias prácticas con un peso agrupado o examen parcial y final), desglosa las evaluaciones individuales o los rubros principales de tal manera que la suma de sus porcentajes equivalga al 100% de la nota final del curso.
Si alguna evaluación no especifica porcentaje exacto, distribuye los porcentajes de manera lógica para completar el 100%.

${text ? `Texto del sílabo / fórmula:\n"""\n${text}\n"""` : ''}
`;

    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Nombre oficial del curso' },
            code: { type: Type.STRING, description: 'Código del curso o sigla' },
            credits: { type: Type.INTEGER, description: 'Número de créditos' },
            icon: { type: Type.STRING, description: 'Emoji representativo' },
            evaluations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Nombre de la evaluación (ej. PC1, Examen Parcial)' },
                  weight: { type: Type.INTEGER, description: 'Porcentaje de ponderación (ej. 20 para 20%)' },
                },
                required: ['name', 'weight'],
              },
            },
          },
          required: ['name', 'credits', 'icon', 'evaluations'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    return res.json({ success: true, course: parsedJson });
  } catch (error: any) {
    console.error('Error parsing syllabus with Gemini:', error);
    return res.status(500).json({
      error: 'No se pudo procesar el documento automáticamente con IA. Puedes ingresar las evaluaciones manualmente o verificar el texto.',
      details: error.message,
    });
  }
});

// Helpers for normalizing day names
function normalizeDayName(rawDay: string): 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' {
  const clean = (rawDay || '').trim().toLowerCase();
  if (clean.includes('lun') || clean === 'lu') return 'Lunes';
  if (clean.includes('mar') || clean === 'ma') return 'Martes';
  if (clean.includes('mie') || clean.includes('mié') || clean === 'mi') return 'Miércoles';
  if (clean.includes('jue') || clean === 'ju') return 'Jueves';
  if (clean.includes('vie') || clean === 'vi') return 'Viernes';
  if (clean.includes('sab') || clean.includes('sáb') || clean === 'sa') return 'Sábado';
  if (clean.includes('dom') || clean === 'do') return 'Sábado'; // Map Sunday to nearest available
  return 'Lunes';
}



// Helper to sanitize time format HH:MM
function sanitizeTime(rawTime: string, defaultTime: string): string {
  if (!rawTime) return defaultTime;
  const clean = rawTime.trim().replace(/\./g, ':');
  const match = clean.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    const h = match[1].padStart(2, '0');
    const m = match[2];
    return `${h}:${m}`;
  }
  return defaultTime;
}

// Endpoint: AI University Schedule Screenshot Parser (Vision OCR - High Resilience)
app.post('/api/parse-schedule-image', async (req, res) => {
  try {
    let { imageBase64, mimeType = 'image/png' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Debes proporcionar una imagen o captura de pantalla de tu horario.' });
    }

    // Clean base64 header if present
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      if (parts[0].includes(':')) {
        mimeType = parts[0].split(':')[1];
      }
      imageBase64 = parts[1];
    }

    // Sanitize MIME type (Gemini requires image/jpeg, not image/jpg)
    mimeType = (mimeType || 'image/png').toLowerCase().trim();
    if (mimeType === 'image/jpg' || mimeType.includes('jpg')) {
      mimeType = 'image/jpeg';
    }

    // Clean whitespace and linebreaks from base64
    imageBase64 = imageBase64.replace(/\s/g, '');

    const promptText = `
Eres un asistente universitario experto en digitalizar horarios de clases a partir de imágenes y capturas de pantalla de portales universitarios (Banner, SIA, Intranet, tablas de Excel, horarios semanales, fotos de celular o PDF renderizados).
Instrucciones estrictas:
1. Revisa minuciosamente la cuadrícula o lista del horario.
2. Identifica cada curso, el día de la semana en que se dicta, la hora de inicio y la hora de fin.
3. Si un curso se dicta en varios días (ej. Lunes y Miércoles), genera una sesión separada para cada día.
4. Devuelve ÚNICAMENTE un JSON válido con la propiedad "schedule": lista de objetos con:
   - "courseName": nombre de la materia (ej. "Cálculo I", "Química General", "Física 1").
   - "day": nombre del día ("Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado").
   - "startTime": hora en formato 24h ("08:00", "09:00", "14:00").
   - "endTime": hora fin en formato 24h ("10:00", "11:00", "16:00").
   - "classroom": aula o laboratorio si aparece (ej. "A-201", "Lab 2", "Virtual"), o "Aula por asignar".
Si la imagen no tiene clases o está vacía, devuelve {"schedule": []}.
`;

    let rawList: any[] = [];

    // Attempt 1: Using gemini-2.5-flash with JSON mode
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          { text: promptText },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              schedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    courseName: { type: Type.STRING },
                    day: { type: Type.STRING },
                    startTime: { type: Type.STRING },
                    endTime: { type: Type.STRING },
                    classroom: { type: Type.STRING },
                  },
                  required: ['courseName', 'day', 'startTime', 'endTime'],
                },
              },
            },
            required: ['schedule'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (Array.isArray(parsed.schedule)) {
        rawList = parsed.schedule;
      }
    } catch (primaryErr: any) {
      console.warn('Attempt 1 failed, running fallback attempt without strict schema:', primaryErr?.message);
      // Attempt 2: Flexible fallback without responseSchema
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          { text: promptText + '\nResponde SOLAMENTE el JSON: {"schedule": [...]}' },
        ],
      });

      let text = fallbackResponse.text || '';
      if (text.includes('```json')) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      } else if (text.includes('```')) {
        text = text.replace(/```/g, '').trim();
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        rawList = parsed.schedule || [];
      } else {
        const arrMatch = text.match(/\[[\s\S]*\]/);
        if (arrMatch) {
          rawList = JSON.parse(arrMatch[0]);
        }
      }
    }

    const normalizedSchedule = rawList.map((item: any, idx: number) => ({
      courseName: (item.courseName || `Clase ${idx + 1}`).trim(),
      day: normalizeDayName(item.day),
      startTime: sanitizeTime(item.startTime, '08:00'),
      endTime: sanitizeTime(item.endTime, '10:00'),
      classroom: (item.classroom || 'Aula por asignar').trim(),
    }));

    return res.json({ success: true, schedule: normalizedSchedule });
  } catch (error: any) {
    console.error('Error parsing schedule image with Gemini:', error);
    return res.status(500).json({
      error: 'No se pudo leer la captura de horario automáticamente. Puedes intentarlo con otra imagen o agregar tus clases manualmente.',
      details: error.message,
    });
  }
});

// Endpoint: Capi AI Academic Advisor Chat (with Image Reading Capability)
app.post('/api/chat-capi', async (req, res) => {
  try {
    let { messages = [], context = {}, imageBase64, mimeType = 'image/png' } = req.body;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.content) {
      return res.status(400).json({ error: 'Mensaje vacío.' });
    }

    const systemInstruction = `
Eres el "Capi Consejero Académico Universitario" 🐾🎓 de El Capiómetro.
Tu misión exclusiva es asesorar a los estudiantes para cuidar su promedio ponderado y no jalar materias en la escala 0 a 20 (aprobatorio = 11.0).

CAPACIDADES ESPECIALES:
- Puedes leer e interpretar imágenes que te envíe el estudiante (capturas de su intranet de notas, enunciados de exámenes, fórmulas del sílabo o comunicados).
- Si te envían una imagen, analiza los números, las fechas y los pesos que aparecen en ella y explica con exactitud qué nota necesita o qué decisión conviene tomar.

CONTEXTO DEL ESTUDIANTE:
${context.coursesSummary ? context.coursesSummary : 'Sin notas detalladas aún.'}
${context.currentGpa ? `Promedio Ponderado General: ${context.currentGpa}` : ''}
${context.selectedCourse ? `Curso Enfocado: ${context.selectedCourse.name} (Acumulado actual: ${context.selectedCourse.accumulated || 0}/20)` : ''}

REGLAS DE RESPUESTA:
- Responde de forma RÁPIDA, DIRECTA y AL PUNTO (máximo 2 párrafos o 3 viñetas concisas).
- No uses rodeos ni saludos innecesariamente largos.
- Sé claro con los números: calcula cuánto necesita para llegar a 11.0 (o 14.0/16.0).
- Si necesita una nota imposible (>18 o >20), dile con calma que considere solicitar retiro antes de la fecha límite para evitar bica o trika.
`;

    const contents: any[] = [];

    // Clean imageBase64 if provided
    if (imageBase64) {
      if (imageBase64.includes(';base64,')) {
        const parts = imageBase64.split(';base64,');
        if (parts[0].includes(':')) {
          mimeType = parts[0].split(':')[1];
        }
        imageBase64 = parts[1];
      }

      contents.push({
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      });
    }

    // Pass last 4 messages for rapid context
    const recentMessages = messages.slice(-4);
    for (const msg of recentMessages) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.4,
        maxOutputTokens: 420,
      },
    });

    return res.json({
      success: true,
      reply: response.text || '🐾 ¡Aquí estoy! ¿Qué duda tienes sobre tus notas o cursos?',
    });
  } catch (error: any) {
    console.error('Error in chat-capi:', error);
    return res.json({
      success: true,
      reply: '🐾 Para salvar el curso con 11.0 necesitas enfocar tu tiempo en las evaluaciones que tengan mayor peso porcentual. Si en el examen final requieres más de 17 puntos y la carga es muy pesada, evalúa con calma el retiro del curso.',
    });
  }
});
// Endpoint: AI Flashcard Generator (Ultra Fast with gemini-3.1-flash-lite)
app.post('/api/generate-flashcards', async (req, res) => {
  try {
    const { topic, courseName } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Por favor indica el tema para generar tarjetas.' });
    }

    const prompt = `
Genera 5 tarjetas de estudio clave (flashcards) para el curso "${courseName || 'General'}":
Tema: "${topic}"
Front: Pregunta o concepto directo para active recall (sin dar la respuesta).
Back: Respuesta clara y resumida (máximo 2 líneas).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [{ text: prompt }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
        maxOutputTokens: 450,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING, description: 'Pregunta o concepto en el frente de la tarjeta' },
                  back: { type: Type.STRING, description: 'Respuesta o explicación en el reverso' },
                },
                required: ['front', 'back'],
              },
            },
          },
          required: ['cards'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{"cards":[]}');
    return res.json({ success: true, cards: parsedJson.cards || [] });
  } catch (error: any) {
    console.error('Error generating flashcards with Gemini:', error);
    const topic = req.body.topic || 'el tema';
    const fallbackCards = [
      {
        front: `¿Cuál es el concepto o definición clave de ${topic}?`,
        back: `Es el principio central que describe ${topic} y cómo interactúan sus componentes principales en el examen.`,
      },
      {
        front: `¿Cuál es la fórmula o teorema más preguntado en ${topic}?`,
        back: `La relación directa entre las variables fundamentales y sus condiciones de validez.`,
      },
      {
        front: `¿Qué error típico se debe evitar en ${topic}?`,
        back: `Confundir signos o supuestos iniciales antes de aplicar la regla o resolver el cálculo.`,
      },
    ];
    return res.json({ success: true, cards: fallbackCards });
  }
});

// Setup Vite Dev Server middlewares or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
