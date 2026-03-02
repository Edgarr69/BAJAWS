'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Question {
  id: number;
  text: string;
  type: string;
  topic: string;
  order: number;
}

interface FormData {
  form_version_id: number;
  expires_at: string;
  questions: Question[];
}

type Answers = Record<number, { value: number; comment: string }>;
type PageState = 'loading' | 'form' | 'error' | 'success';

const ERROR_MESSAGES: Record<string, string> = {
  INVALID:  'Este enlace no es válido.',
  EXPIRED:  'Este enlace ha expirado.',
  USED:     'Este formulario ya fue completado anteriormente.',
  BLOQUEADO:'Este enlace ha sido bloqueado.',
};

const RATING_LABELS = ['Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];
const RATING_COLORS = [
  'border-red-400 bg-red-50 text-red-700',
  'border-orange-400 bg-orange-50 text-orange-700',
  'border-amber-400 bg-amber-50 text-amber-700',
  'border-lime-500 bg-lime-50 text-lime-700',
  'border-green-500 bg-green-50 text-green-700',
];

export default function FormularioPage() {
  const { code } = useParams<{ code: string }>();
  const [state, setState]       = useState<PageState>('loading');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [answers, setAnswers]   = useState<Answers>({});
  const [topicIdx, setTopicIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [globalScore, setGlobalScore] = useState(0);

  useEffect(() => {
    fetch(`/api/public/form?code=${code}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setErrorMsg(ERROR_MESSAGES[data.error] ?? 'Este enlace no está disponible.');
          setState('error');
        } else {
          setFormData(data);
          setState('form');
        }
      })
      .catch(() => {
        setErrorMsg('Error de conexión. Intenta de nuevo.');
        setState('error');
      });
  }, [code]);

  // Agrupar preguntas por tema
  const topics = formData
    ? Array.from(new Set(formData.questions.map(q => q.topic))).map(topic => ({
        name: topic,
        questions: formData.questions.filter(q => q.topic === topic).sort((a, b) => a.order - b.order),
      }))
    : [];

  const currentTopic = topics[topicIdx];
  const totalTopics  = topics.length;

  function setAnswer(qId: number, value: number) {
    setAnswers(prev => ({ ...prev, [qId]: { value, comment: prev[qId]?.comment ?? '' } }));
  }

  function setComment(qId: number, comment: string) {
    setAnswers(prev => ({ ...prev, [qId]: { value: prev[qId]?.value ?? 0, comment } }));
  }

  function currentComplete() {
    return currentTopic?.questions.every(q => (answers[q.id]?.value ?? 0) > 0) ?? false;
  }

  function isAllComplete() {
    return topics.every(t => t.questions.every(q => (answers[q.id]?.value ?? 0) > 0));
  }

  async function handleSubmit() {
    if (!isAllComplete()) return;
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([qId, a]) => ({
        question_id: Number(qId),
        value: a.value,
        comment: a.comment || undefined,
      }));
      const res = await fetch('/api/public/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, answers: payload }),
      });
      const data = await res.json();
      if (data.ok) {
        const total = Object.values(answers).reduce((s, a) => s + a.value, 0);
        setGlobalScore(total / Object.values(answers).length);
        setState('success');
      } else {
        setErrorMsg(ERROR_MESSAGES[data.error] ?? data.message ?? 'Error al enviar.');
        setState('error');
      }
    } catch {
      setErrorMsg('Error de conexión al enviar. Intenta de nuevo.');
      setState('error');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-10 h-10 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Cargando formulario…</p>
        </div>
      </Shell>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Enlace no disponible</h2>
          <p className="text-slate-500 text-sm max-w-xs">{errorMsg}</p>
        </div>
      </Shell>
    );
  }

  // ── Éxito ──────────────────────────────────────────────────────────────────
  if (state === 'success') {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-5 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">¡Gracias por tu evaluación!</h2>
          <p className="text-slate-500 text-sm max-w-xs">
            Tu opinión es muy importante para nosotros y nos ayuda a mejorar nuestros servicios.
          </p>
          {globalScore >= 4 && (
            <div className="mt-2 p-4 bg-accent-50 border border-accent-200 rounded-xl max-w-xs">
              <p className="text-sm text-accent-800 font-medium mb-2">
                Nos alegra que hayas tenido una buena experiencia.
              </p>
              <a
                href="https://g.page/r/baja-wastewater/review"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-accent-600 hover:bg-accent-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Dejar reseña en Google
              </a>
            </div>
          )}
        </div>
      </Shell>
    );
  }

  // ── Formulario ─────────────────────────────────────────────────────────────
  return (
    <Shell>
      {/* Progreso */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-medium text-slate-500">
            Sección {topicIdx + 1} de {totalTopics}
          </p>
          <p className="text-xs font-semibold text-primary-700">
            {currentTopic?.name}
          </p>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div
            className="bg-primary-700 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${((topicIdx + 1) / totalTopics) * 100}%` }}
          />
        </div>
      </div>

      {/* Preguntas del tema actual */}
      <div className="space-y-6">
        {currentTopic?.questions.map(q => (
          <div key={q.id} className="space-y-3">
            <p className="text-sm font-medium text-slate-800 leading-snug">{q.text}</p>

            {/* Escala Likert */}
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map(v => (
                <button
                  key={v}
                  onClick={() => setAnswer(q.id, v)}
                  className={`
                    flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all
                    ${answers[q.id]?.value === v
                      ? RATING_COLORS[v - 1] + ' border-opacity-100 scale-105 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}
                  `}
                >
                  <span className="text-lg font-bold">{v}</span>
                  <span className="text-[9px] font-medium leading-tight text-center hidden sm:block">
                    {RATING_LABELS[v - 1]}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 sm:hidden px-1">
              <span>Muy malo</span>
              <span>Excelente</span>
            </div>

            {/* Comentario opcional */}
            {(answers[q.id]?.value ?? 0) > 0 && (answers[q.id]?.value ?? 5) <= 3 && (
              <textarea
                placeholder="¿Qué podemos mejorar? (opcional)"
                value={answers[q.id]?.comment ?? ''}
                onChange={e => setComment(q.id, e.target.value)}
                rows={2}
                maxLength={300}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-slate-700 placeholder:text-slate-300"
              />
            )}
          </div>
        ))}
      </div>

      {/* Navegación */}
      <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
        <button
          onClick={() => setTopicIdx(i => i - 1)}
          disabled={topicIdx === 0}
          className="text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Anterior
        </button>

        {topicIdx < totalTopics - 1 ? (
          <button
            onClick={() => setTopicIdx(i => i + 1)}
            disabled={!currentComplete()}
            className="bg-primary-700 hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isAllComplete() || submitting}
            className="bg-accent-600 hover:bg-accent-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Enviando…
              </>
            ) : 'Enviar evaluación'}
          </button>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-700 mb-3">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </div>
          <h1 className="text-base font-bold text-primary-900">Baja Wastewater Solution</h1>
          <p className="text-xs text-slate-400 mt-0.5">Evaluación del servicio · Menos de 1 minuto</p>
        </div>

        {children}
      </div>
    </div>
  );
}
