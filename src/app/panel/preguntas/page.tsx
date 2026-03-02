'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '@/lib/api';
import type { Question } from '@/types/panel';

const TOPICS = [
  { id: 1, name: 'Calidad en el servicio' },
  { id: 2, name: 'Presentación del personal' },
  { id: 3, name: 'Facturación' },
  { id: 4, name: 'Precios' },
  { id: 5, name: 'Atención a cliente' },
];

export default function PreguntasPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editQ, setEditQ]         = useState<Question | null>(null);
  const [editText, setEditText]   = useState('');
  const [newText, setNewText]     = useState('');
  const [newTopic, setNewTopic]   = useState(1);
  const [saving, setSaving]       = useState(false);
  const [delConfirm, setDelConfirm] = useState<Question | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getQuestions();
      setQuestions(data as Question[]);
    } catch { toast.error('Error cargando preguntas'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const byTopic = (tid: number) =>
    questions.filter(q => q.topic_id === tid).sort((a, b) => a.display_order - b.display_order);

  async function toggle(q: Question) {
    try {
      await updateQuestion(q.id, { is_active: !q.is_active });
      setQuestions(qs => qs.map(x => x.id === q.id ? { ...x, is_active: !x.is_active } : x));
    } catch { toast.error('Error al actualizar'); }
  }

  async function move(q: Question, dir: 'up' | 'down') {
    const siblings = byTopic(q.topic_id);
    const idx = siblings.findIndex(x => x.id === q.id);
    const target = dir === 'up' ? siblings[idx - 1] : siblings[idx + 1];
    if (!target) return;
    try {
      await Promise.all([
        updateQuestion(q.id, { display_order: target.display_order }),
        updateQuestion(target.id, { display_order: q.display_order }),
      ]);
      setQuestions(qs => qs.map(x => {
        if (x.id === q.id) return { ...x, display_order: target.display_order };
        if (x.id === target.id) return { ...x, display_order: q.display_order };
        return x;
      }));
    } catch { toast.error('Error al reordenar'); }
  }

  async function saveEdit() {
    if (!editQ) return;
    setSaving(true);
    try {
      await updateQuestion(editQ.id, { text: editText });
      setQuestions(qs => qs.map(x => x.id === editQ.id ? { ...x, text: editText } : x));
      setEditQ(null);
      toast.success('Pregunta actualizada');
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  }

  async function handleCreate() {
    if (!newText.trim()) return;
    setSaving(true);
    try {
      const qs = byTopic(newTopic);
      const order = qs.length > 0 ? Math.max(...qs.map(q => q.display_order)) + 1 : 0;
      const created = await createQuestion({ topic_id: newTopic, text: newText, display_order: order });
      setQuestions(qs => [...qs, created as Question]);
      setNewText('');
      toast.success('Pregunta creada');
    } catch { toast.error('Error al crear pregunta'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!delConfirm) return;
    try {
      await deleteQuestion(delConfirm.id);
      setQuestions(qs => qs.filter(x => x.id !== delConfirm.id));
      setDelConfirm(null);
      toast.success('Pregunta eliminada');
    } catch { toast.error('Error al eliminar'); }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-xl font-bold text-slate-800">Banco de preguntas</h1>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : (
        <Tabs defaultValue={String(TOPICS[0].id)}>
          <TabsList className="flex-wrap h-auto gap-1">
            {TOPICS.map(t => (
              <TabsTrigger key={t.id} value={String(t.id)} className="text-xs">
                {t.name.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {TOPICS.map(topic => (
            <TabsContent key={topic.id} value={String(topic.id)} className="mt-4">
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-700">{topic.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {byTopic(topic.id).length === 0 && (
                    <p className="text-sm text-slate-400 py-4 text-center">Sin preguntas en este tema</p>
                  )}
                  {byTopic(topic.id).map((q, i, arr) => (
                    <div key={q.id} className={`flex items-start gap-2 p-3 rounded-lg border transition-colors ${q.is_active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                      {/* Reordenar */}
                      <div className="flex flex-col gap-0.5 shrink-0 mt-0.5">
                        <button onClick={() => move(q, 'up')} disabled={i === 0} className="text-slate-300 hover:text-slate-600 disabled:opacity-20">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => move(q, 'down')} disabled={i === arr.length - 1} className="text-slate-300 hover:text-slate-600 disabled:opacity-20">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm text-slate-700 flex-1">{q.text}</p>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => toggle(q)} className={`p-1 rounded ${q.is_active ? 'text-accent-600 hover:bg-accent-50' : 'text-slate-400 hover:bg-slate-100'}`} title={q.is_active ? 'Desactivar' : 'Activar'}>
                          {q.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => { setEditQ(q); setEditText(q.text); }} className="p-1 rounded text-slate-400 hover:text-primary-700 hover:bg-primary-50">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDelConfirm(q)} className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Nueva pregunta */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                    <Input
                      placeholder="Nueva pregunta…"
                      value={newTopic === topic.id ? newText : ''}
                      onChange={e => { setNewTopic(topic.id); setNewText(e.target.value); }}
                      onFocus={() => setNewTopic(topic.id)}
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleCreate}
                      disabled={saving || newTopic !== topic.id || !newText.trim()}
                      className="bg-primary-700 hover:bg-primary-600 gap-1.5 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editQ} onOpenChange={open => !open && setEditQ(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Editar pregunta</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs">Texto</Label>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              rows={3}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditQ(null)}>Cancelar</Button>
            <Button onClick={saveEdit} disabled={saving} className="bg-primary-700 hover:bg-primary-600">
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!delConfirm} onOpenChange={open => !open && setDelConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>¿Eliminar pregunta?</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600 py-2">{delConfirm?.text}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelConfirm(null)}>Cancelar</Button>
            <Button onClick={handleDelete} variant="destructive">Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
