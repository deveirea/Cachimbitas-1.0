import React, { useState, useEffect } from 'react';
import { getStoredApiKey, setStoredApiKey } from '../services/aiService';
import { Key, CheckCircle, ExternalLink, ShieldCheck, Eye, EyeOff, Sparkles, X, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(apiKey.trim());
    setStatusMessage('¡Clave guardada con éxito en tu navegador!');
    onKeyUpdated?.();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleRemove = () => {
    setStoredApiKey('');
    setApiKey('');
    setStatusMessage('Clave eliminada. El Capi usará el Consejero Local Autónomo.');
    onKeyUpdated?.();
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setStatusMessage('Ingresa una clave primero.');
      return;
    }
    setIsTesting(true);
    setStatusMessage('Probando conexión con Google Gemini...');
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Di hola en 3 palabras' }] }],
          }),
        }
      );
      if (res.ok) {
        setStatusMessage('✅ ¡Conexión exitosa con Google Gemini!');
        confetti({ particleCount: 50, spread: 70 });
      } else {
        const data = await res.json().catch(() => ({}));
        setStatusMessage(`❌ Error: ${data.error?.message || 'Clave no válida o sin permisos'}`);
      }
    } catch (e: any) {
      setStatusMessage(`❌ Error de red: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-800 dark:text-amber-300">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
              Activar IA en GitHub Pages
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Conexión directa con Google Gemini (Gratis)
            </p>
          </div>
        </div>

        <div className="text-xs text-stone-600 dark:text-stone-300 space-y-3 leading-relaxed">
          <p>
            Al hospedar en <strong>GitHub Pages</strong> (sitio estático sin servidor backend), para que el Capi pueda analizar imágenes, leer fotos de exámenes y responder con IA en tiempo real, solo necesitas una <strong>API Key gratuita de Google</strong>.
          </p>

          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
            <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>¿Cómo obtenerla en 1 minuto?</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300 text-[11px]">
              <li>Entra a Google AI Studio con tu cuenta de Gmail.</li>
              <li>Pulsa <strong>"Create API Key"</strong> (es 100% gratuita).</li>
              <li>Pégala aquí abajo.</li>
            </ol>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:underline pt-1"
            >
              <span>Abrir Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Tu Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Tu clave se guarda exclusivamente en tu navegador (localStorage). Nunca se comparte con nadie.</span>
          </div>

          {statusMessage && (
            <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 text-center">
              {statusMessage}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          {apiKey.trim() ? (
            <button
              onClick={handleRemove}
              className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Quitar</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestKey}
              disabled={isTesting || !apiKey.trim()}
              className="px-3 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-xl transition-colors disabled:opacity-50"
            >
              {isTesting ? 'Probando...' : 'Probar'}
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              Guardar y Conectar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
