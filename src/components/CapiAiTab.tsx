import React, { useState, useRef, useEffect } from 'react';
import { CourseConfig, ChatConversation, ChatMessage, CapySkin, OutfitId } from '../types';
import { CapybaraAvatar } from './CapybaraAvatar';
import {
  Send,
  Plus,
  Trash2,
  Paperclip,
  X,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';

interface CapiAiTabProps {
  courses: CourseConfig[];
  grades: Record<string, number | null>;
  gpa: number | null;
  outfit: OutfitId;
  skin: CapySkin;
  conversations: ChatConversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onCreateConversation: (mode: 'advisor' | 'tutor', title?: string) => string;
  onDeleteConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string, imageBase64?: string, mimeType?: string) => Promise<void>;
  isSending: boolean;
  selectedCourseId?: string;
}

export const CapiAiTab: React.FC<CapiAiTabProps> = ({
  courses,
  grades,
  gpa,
  outfit,
  skin,
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onSendMessage,
  isSending,
  selectedCourseId,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [attachedMimeType, setAttachedMimeType] = useState<string>('image/png');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv =
    conversations.find((c) => c.id === activeConversationId) ||
    conversations[0] ||
    null;

  const focusedCourse =
    courses.find((c) => c.id === selectedCourseId) || courses[0] || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages, isSending]);

  // Handle image file selection
  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.includes(';base64,') ? result.split(';base64,')[1] : result;
      setAttachedImageBase64(base64Data);
      setAttachedMimeType(file.type || 'image/png');
      setImagePreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setAttachedImageBase64(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Ctrl+V paste on textarea
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!e.clipboardData) return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleFileSelect(file);
          break;
        }
      }
    }
  };

  const handleSend = async () => {
    if ((!inputMessage.trim() && !attachedImageBase64) || isSending || !activeConv) return;
    const msg = inputMessage.trim() || (attachedImageBase64 ? 'Analiza esta imagen y aconjéseme sobre mi situación académica.' : '');
    const imgData = attachedImageBase64 || undefined;
    const mime = attachedMimeType;

    setInputMessage('');
    handleClearImage();

    await onSendMessage(activeConv.id, msg, imgData, mime);
  };

  const handleStarterPrompt = async (promptText: string) => {
    if (isSending || !activeConv) return;
    await onSendMessage(activeConv.id, promptText);
  };

  const handleCreateNew = () => {
    const newId = onCreateConversation('advisor', 'Consulta Académica');
    onSelectConversation(newId);
  };

  // Parses bold **text** and bullet points without raw asterisks
  const renderFormattedMessage = (content: string, isUser: boolean) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((rawLine, idx) => {
          const trimmed = rawLine.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
          }

          const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
          const isNumbered = /^\d+\.\s/.test(trimmed);
          const lineText = isBullet
            ? trimmed.replace(/^[•\-\*]\s*/, '')
            : isNumbered
            ? trimmed.replace(/^\d+\.\s*/, '')
            : rawLine;

          const parts = lineText.split(/(\*\*[^*]+?\*\*)/g);

          const formattedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              const cleanBold = part.slice(2, -2);
              return (
                <strong
                  key={pIdx}
                  className={
                    isUser
                      ? 'font-black text-white underline decoration-white/30'
                      : 'font-black text-amber-950 dark:text-amber-100'
                  }
                >
                  {cleanBold}
                </strong>
              );
            }
            return part;
          });

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                <span className="flex-1">{formattedLine}</span>
              </div>
            );
          }

          if (isNumbered) {
            const numMatch = trimmed.match(/^(\d+)\.\s/);
            const numStr = numMatch ? numMatch[1] : '1';
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0 text-xs mt-0.5">
                  {numStr}.
                </span>
                <span className="flex-1">{formattedLine}</span>
              </div>
            );
          }

          return <div key={idx}>{formattedLine}</div>;
        })}
      </div>
    );
  };

  return (
    <div className="h-[76vh] min-h-[540px] flex flex-col md:flex-row gap-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
      {/* Sidebar: Conversation history */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-stone-200 dark:border-stone-800 bg-[#FAF7F2]/60 dark:bg-stone-900/60 flex flex-col justify-between p-3.5">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-200/60 dark:border-stone-800">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-950 dark:text-amber-100">
                Capi Consejero
              </h3>
              <p className="text-[10px] text-stone-400">Consultas de notas & rescate</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="p-1.5 rounded-xl bg-amber-900 text-white hover:bg-amber-800 transition-colors shadow-xs"
              title="Nueva conversación"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Conversations List */}
          <div className="space-y-1.5 overflow-y-auto max-h-[140px] md:max-h-[50vh]">
            {conversations.map((conv) => {
              const isSelected = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`p-2.5 rounded-2xl cursor-pointer text-xs font-semibold flex items-center justify-between group transition-all ${
                    isSelected
                      ? 'bg-amber-900 text-white shadow-xs dark:bg-amber-700'
                      : 'hover:bg-stone-200/60 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <span className="truncate pr-2">{conv.title || 'Consulta académica'}</span>
                  {conversations.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Capybara Status Footer */}
        <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800 flex items-center gap-2.5">
          <CapybaraAvatar outfit={outfit} skin={skin} mood="great" size={36} />
          <div>
            <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Consejero Activo</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Analiza texto e imágenes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col justify-between bg-white dark:bg-stone-900 overflow-hidden">
        {/* Chat Messages Log */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Quick starter prompts banner */}
          {activeConv && activeConv.messages.length <= 1 && (
            <div className="p-4 rounded-3xl bg-[#FAF7F2] dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  Consultas rápidas recomendadas:
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() =>
                    handleStarterPrompt(
                      focusedCourse
                        ? `¿Puedo salvar ${focusedCourse.name} o me conviene retirarme?`
                        : '¿Puedo salvar mis materias restantes con 11.0?'
                    )
                  }
                  className="p-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-400 text-left text-stone-700 dark:text-stone-300 transition-colors"
                >
                  {focusedCourse
                    ? `¿Salvo ${focusedCourse.name} o me retiro?`
                    : '¿Salvo mis cursos o me retiro?'}
                </button>
                <button
                  onClick={() =>
                    handleStarterPrompt(
                      focusedCourse
                        ? `¿Cuánto necesito sacar exactamente en el examen final de ${focusedCourse.name} para aprobar?`
                        : '¿Cuánto necesito en mi próximo examen para no jalar?'
                    )
                  }
                  className="p-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-400 text-left text-stone-700 dark:text-stone-300 transition-colors"
                >
                  ¿Cuánto necesito sacar en el final para 11?
                </button>
                <button
                  onClick={() =>
                    handleStarterPrompt('¿Cuál es mi curso más en peligro de acuerdo con mis notas actuales?')
                  }
                  className="p-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-400 text-left text-stone-700 dark:text-stone-300 transition-colors"
                >
                  ¿Cuál es mi curso más crítico hoy?
                </button>
                <button
                  onClick={() =>
                    handleStarterPrompt('¿Cómo afecta una nota jalada a mi promedio ponderado y matrícula?')
                  }
                  className="p-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-400 text-left text-stone-700 dark:text-stone-300 transition-colors"
                >
                  ¿Cómo afecta un jalado mi ponderado?
                </button>
              </div>
            </div>
          )}

          {/* Render Messages */}
          {activeConv?.messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs sm:text-sm ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="shrink-0 mt-0.5">
                    <CapybaraAvatar outfit={outfit} skin={skin} mood="great" size={32} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3.5 sm:p-4 rounded-3xl ${
                    isUser
                      ? 'bg-amber-900 text-white rounded-br-xs shadow-xs dark:bg-amber-700'
                      : 'bg-[#FAF7F2] dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 text-stone-800 dark:text-stone-100 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  {/* User image attachment if present */}
                  {msg.imageUrl && (
                    <div className="mb-2.5 overflow-hidden rounded-2xl border border-white/20">
                      <img
                        src={msg.imageUrl}
                        alt="Captura adjunta"
                        className="max-h-60 w-auto object-contain rounded-xl"
                      />
                    </div>
                  )}

                  {renderFormattedMessage(msg.content, isUser)}
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-stone-400 p-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>El Capi Consejero está calculando tu respuesta...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Image Attachment Preview */}
        {imagePreviewUrl && (
          <div className="px-4 py-2 border-t border-stone-100 dark:border-stone-800 bg-[#FAF7F2] dark:bg-stone-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={imagePreviewUrl}
                alt="Preview"
                className="w-12 h-12 object-cover rounded-xl border border-stone-300 dark:border-stone-700"
              />
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  Captura adjunta
                </span>
                <span className="text-[10px] text-stone-400">El Capi analizará esta imagen</span>
              </div>
            </div>
            <button
              onClick={handleClearImage}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              title="Quitar imagen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar with Image Attachment */}
        <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-[#FAF7F2]/40 dark:bg-stone-900/40">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Adjuntar captura de examen, notas o sílabo (o pega con Ctrl+V)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <textarea
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Pregúntale al Capi Consejero o pega una captura con Ctrl+V..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 resize-none"
            />

            <button
              onClick={handleSend}
              disabled={(!inputMessage.trim() && !attachedImageBase64) || isSending}
              className="p-2.5 rounded-2xl bg-amber-900 hover:bg-amber-800 text-white disabled:opacity-40 transition-colors shadow-xs"
              title="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
