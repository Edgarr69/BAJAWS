'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Briefcase, Plus, Trash2, MapPin, Users, X, Power, Pencil, Pen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { createJobPosting, updateJobPosting, toggleJobPosting, deleteJobPosting } from '@/lib/api';
import type { JobPosting } from '@/types/panel';

function parseItems(text: string | null): string[] {
  if (!text) return [];
  return text.split(/\r?\n/).map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
}

function TagInput({
  items,
  onAdd,
  onRemove,
  onEdit,
  input,
  onInputChange,
  placeholder,
  color = 'slate',
}: {
  items: string[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onEdit: (i: number, v: string) => void;
  input: string;
  onInputChange: (v: string) => void;
  placeholder: string;
  color?: 'slate' | 'accent';
}) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editVal, setEditVal]       = useState('');

  function startEdit(i: number) {
    setEditingIdx(i);
    setEditVal(items[i]);
  }

  function commitEdit() {
    if (editingIdx === null) return;
    const v = editVal.trim();
    if (v) onEdit(editingIdx, v);
    else onRemove(editingIdx);
    setEditingIdx(null);
  }

  const chipCls = color === 'accent'
    ? 'bg-accent-50 text-accent-700 border border-accent-200'
    : 'bg-slate-100 text-slate-700';
  const editCls = color === 'accent'
    ? 'border-accent-400 focus:ring-accent-400'
    : 'border-primary-400 focus:ring-primary-400';
  const addCls = color === 'accent'
    ? 'text-accent-600 hover:text-accent-700'
    : 'text-primary-600 hover:text-primary-700';

  return (
    <div className="border border-slate-200 rounded-lg p-3 focus-within:ring-2 focus-within:ring-primary-500 space-y-2">
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) =>
            editingIdx === i ? (
              <input
                key={i}
                autoFocus
                type="text"
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
                  if (e.key === 'Escape') setEditingIdx(null);
                }}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-2 ${editCls} text-slate-700 bg-white`}
                style={{ minWidth: '8rem' }}
              />
            ) : (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg ${chipCls}`}
              >
                <button
                  type="button"
                  onClick={() => startEdit(i)}
                  className="hover:underline text-left"
                  title="Editar"
                >
                  {item}
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(i)}
                  className="text-slate-400 hover:text-primary-600 transition-colors"
                  title="Editar"
                >
                  <Pen className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  title="Quitar"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
          className="flex-1 text-sm outline-none text-slate-700 placeholder:text-slate-300 bg-transparent"
        />
        <button type="button" onClick={onAdd} className={`shrink-0 transition-colors ${addCls}`}>
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


export function VacantesClient({ initialItems }: { initialItems: JobPosting[] }) {
  const [items, setItems]           = useState<JobPosting[]>(initialItems);
  const [saving, setSaving]         = useState(false);
  const [toggling, setToggling]     = useState<string | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<JobPosting | null>(null);

  // ── Crear ──
  const [showAdd, setShowAdd]       = useState(false);
  const [addAttempted, setAddAttempted] = useState(false);
  const [addTitulo, setAddTitulo]   = useState('');
  const [addDesc, setAddDesc]       = useState('');
  const [addUbic, setAddUbic]       = useState('Tijuana, B.C.');
  const [addReqItems, setAddReqItems] = useState<string[]>([]);
  const [addReqInput, setAddReqInput] = useState('');
  const [addPresItems, setAddPresItems] = useState<string[]>([]);
  const [addPresInput, setAddPresInput] = useState('');

  // ── Editar ──
  const [editing, setEditing]       = useState<JobPosting | null>(null);
  const [editAttempted, setEditAttempted] = useState(false);
  const [editTitulo, setEditTitulo] = useState('');
  const [editDesc, setEditDesc]     = useState('');
  const [editUbic, setEditUbic]     = useState('');
  const [editReqItems, setEditReqItems] = useState<string[]>([]);
  const [editReqInput, setEditReqInput] = useState('');
  const [editPresItems, setEditPresItems] = useState<string[]>([]);
  const [editPresInput, setEditPresInput] = useState('');

  const addTituloValid = addTitulo.trim().length >= 2;
  const addDescValid   = addDesc.trim().length >= 10;
  const editTituloValid = editTitulo.trim().length >= 2;
  const editDescValid   = editDesc.trim().length >= 10;

  function resetAdd() {
    setAddTitulo(''); setAddDesc(''); setAddUbic('Tijuana, B.C.');
    setAddReqItems([]); setAddReqInput('');
    setAddPresItems([]); setAddPresInput('');
    setAddAttempted(false);
  }

  function openEdit(item: JobPosting) {
    setEditing(item);
    setEditTitulo(item.titulo);
    setEditDesc(item.descripcion);
    setEditUbic(item.ubicacion);
    setEditReqItems(parseItems(item.requisitos));
    setEditReqInput('');
    setEditPresItems(parseItems(item.prestaciones));
    setEditPresInput('');
    setEditAttempted(false);
  }

  async function handleAdd() {
    setAddAttempted(true);
    if (!addTituloValid || !addDescValid) return;
    setSaving(true);
    try {
      const created = await createJobPosting({
        titulo:       addTitulo.trim(),
        descripcion:  addDesc.trim(),
        requisitos:   addReqItems.length  > 0 ? addReqItems.join('\n')  : null,
        prestaciones: addPresItems.length > 0 ? addPresItems.join('\n') : null,
        ubicacion:    addUbic.trim() || 'Tijuana, B.C.',
        modalidad:    'presencial',
        is_active:    true,
      });
      setItems(prev => [created, ...prev]);
      setShowAdd(false);
      resetAdd();
      toast.success('Vacante publicada');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al crear la vacante');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit() {
    if (!editing) return;
    setEditAttempted(true);
    if (!editTituloValid || !editDescValid) return;
    setSaving(true);
    try {
      const updated = await updateJobPosting(editing.id, {
        titulo:       editTitulo.trim(),
        descripcion:  editDesc.trim(),
        requisitos:   editReqItems.length  > 0 ? editReqItems.join('\n')  : null,
        prestaciones: editPresItems.length > 0 ? editPresItems.join('\n') : null,
        ubicacion:    editUbic.trim() || 'Tijuana, B.C.',
      });
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
      setEditing(null);
      toast.success('Vacante actualizada');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item: JobPosting) {
    setToggling(item.id);
    try {
      const updated = await toggleJobPosting(item.id, !item.is_active);
      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
      toast.success(updated.is_active ? 'Vacante activada' : 'Vacante desactivada');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al actualizar');
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete() {
    if (!confirmDel) return;
    setDeleting(confirmDel.id);
    try {
      await deleteJobPosting(confirmDel.id);
      setItems(prev => prev.filter(i => i.id !== confirmDel.id));
      setConfirmDel(null);
      toast.success('Vacante eliminada');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setDeleting(null);
    }
  }

  const active   = items.filter(i => i.is_active).length;
  const inactive = items.filter(i => !i.is_active).length;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Vacantes</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestiona las convocatorias visibles en la sección de empleo del sitio.
          </p>
        </div>
        <Button size="sm" className="bg-primary-700 hover:bg-primary-600 shrink-0" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Nueva vacante
        </Button>
      </div>

      {items.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-500 inline-block" />
            {active} activa{active !== 1 ? 's' : ''}
          </span>
          {inactive > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
              {inactive} inactiva{inactive !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary-600" />
            Convocatorias
            {items.length > 0 && (
              <span className="ml-1 bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-400">No hay vacantes publicadas</p>
              <p className="text-xs text-slate-300 mt-1">
                Crea la primera convocatoria para que aparezca en el sitio.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map(item => (
                <div key={item.id} className="flex items-start justify-between px-5 py-4 hover:bg-slate-50 transition-colors gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-slate-800 truncate">{item.titulo}</span>
                      <Badge
                        variant="outline"
                        className={item.is_active
                          ? 'text-accent-700 border-accent-300 bg-accent-50 text-[10px] px-1.5 py-0'
                          : 'text-slate-500 border-slate-200 bg-slate-50 text-[10px] px-1.5 py-0'}
                      >
                        {item.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {item.ubicacion}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.descripcion}</p>
                    <p className="text-[10px] text-slate-300 mt-1">
                      Creada el{' '}
                      {new Date(item.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      title={item.is_active
                        ? 'Desactivar — la vacante dejará de verse en el sitio'
                        : 'Activar — la vacante se publicará en el sitio'}
                      disabled={toggling === item.id}
                      onClick={() => handleToggle(item)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                        item.is_active
                          ? 'bg-accent-50 text-accent-700 border-accent-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-accent-50 hover:text-accent-700 hover:border-accent-200'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {toggling === item.id ? '…' : item.is_active ? 'Activa' : 'Inactiva'}
                    </button>
                    <Button
                      size="sm"
                      variant="outline"
                      title="Editar vacante"
                      className="h-8 w-8 p-0 text-slate-500 border-slate-200 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      title="Eliminar vacante permanentemente"
                      className="h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-50"
                      disabled={deleting === item.id}
                      onClick={() => setConfirmDel(item)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Dialog nueva vacante ── */}
      <Dialog open={showAdd} onOpenChange={open => { if (!open && !saving) { setShowAdd(false); resetAdd(); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nueva vacante</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">Título <span className="text-red-500">*</span></Label>
              <input
                type="text"
                placeholder="Ej. Operador de planta de tratamiento"
                value={addTitulo}
                onChange={e => setAddTitulo(e.target.value)}
                maxLength={120}
                autoFocus
                className={`w-full text-base md:text-sm border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 text-slate-700 placeholder:text-slate-300 ${addAttempted && !addTituloValid ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-primary-500'}`}
              />
              {addAttempted && !addTituloValid && <p className="text-xs text-red-500 pl-1">El título es requerido (mín. 2 caracteres)</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">Ubicación</Label>
              <input type="text" placeholder="Tijuana, B.C." value={addUbic} onChange={e => setAddUbic(e.target.value)} maxLength={100}
                className="w-full text-base md:text-sm border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 placeholder:text-slate-300" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">Descripción del puesto <span className="text-red-500">*</span></Label>
              <textarea placeholder="Describe las responsabilidades y el perfil del puesto..." value={addDesc} onChange={e => setAddDesc(e.target.value)} maxLength={3000} rows={5}
                className={`w-full text-base md:text-sm border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 text-slate-700 placeholder:text-slate-300 resize-y ${addAttempted && !addDescValid ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-primary-500'}`} />
              {addAttempted && !addDescValid && <p className="text-xs text-red-500 pl-1">La descripción es requerida (mín. 10 caracteres)</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">Requisitos (opcional)</Label>
              <TagInput items={addReqItems} input={addReqInput} onInputChange={setAddReqInput} placeholder="Escribe un requisito y presiona Enter o +"
                onAdd={() => { const v = addReqInput.trim(); if (v) { setAddReqItems(p => [...p, v]); setAddReqInput(''); } }}
                onRemove={i => setAddReqItems(p => p.filter((_, j) => j !== i))}
                onEdit={(i, v) => setAddReqItems(p => p.map((x, j) => j === i ? v : x))} color="slate" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">Prestaciones (opcional)</Label>
              <TagInput items={addPresItems} input={addPresInput} onInputChange={setAddPresInput} placeholder="Escribe una prestación y presiona Enter o +"
                onAdd={() => { const v = addPresInput.trim(); if (v) { setAddPresItems(p => [...p, v]); setAddPresInput(''); } }}
                onRemove={i => setAddPresItems(p => p.filter((_, j) => j !== i))}
                onEdit={(i, v) => setAddPresItems(p => p.map((x, j) => j === i ? v : x))} color="accent" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); resetAdd(); }} disabled={saving}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={saving || (addAttempted && (!addTituloValid || !addDescValid))} className="bg-primary-700 hover:bg-primary-600">
              {saving ? 'Publicando…' : 'Publicar vacante'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog editar vacante ── */}
      <Dialog open={!!editing} onOpenChange={open => { if (!open && !saving) setEditing(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar vacante</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">Título <span className="text-red-500">*</span></Label>
              <input type="text" placeholder="Ej. Operador de planta de tratamiento" value={editTitulo} onChange={e => setEditTitulo(e.target.value)} maxLength={120}
                className={`w-full text-base md:text-sm border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 text-slate-700 placeholder:text-slate-300 ${editAttempted && !editTituloValid ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-primary-500'}`} />
              {editAttempted && !editTituloValid && <p className="text-xs text-red-500 pl-1">El título es requerido (mín. 2 caracteres)</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">Ubicación</Label>
              <input type="text" placeholder="Tijuana, B.C." value={editUbic} onChange={e => setEditUbic(e.target.value)} maxLength={100}
                className="w-full text-base md:text-sm border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 placeholder:text-slate-300" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">Descripción del puesto <span className="text-red-500">*</span></Label>
              <textarea placeholder="Describe las responsabilidades y el perfil del puesto..." value={editDesc} onChange={e => setEditDesc(e.target.value)} maxLength={3000} rows={5}
                className={`w-full text-base md:text-sm border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 text-slate-700 placeholder:text-slate-300 resize-y ${editAttempted && !editDescValid ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-primary-500'}`} />
              {editAttempted && !editDescValid && <p className="text-xs text-red-500 pl-1">La descripción es requerida (mín. 10 caracteres)</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">Requisitos (opcional)</Label>
              <TagInput items={editReqItems} input={editReqInput} onInputChange={setEditReqInput} placeholder="Escribe un requisito y presiona Enter o +"
                onAdd={() => { const v = editReqInput.trim(); if (v) { setEditReqItems(p => [...p, v]); setEditReqInput(''); } }}
                onRemove={i => setEditReqItems(p => p.filter((_, j) => j !== i))}
                onEdit={(i, v) => setEditReqItems(p => p.map((x, j) => j === i ? v : x))} color="slate" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">Prestaciones (opcional)</Label>
              <TagInput items={editPresItems} input={editPresInput} onInputChange={setEditPresInput} placeholder="Escribe una prestación y presiona Enter o +"
                onAdd={() => { const v = editPresInput.trim(); if (v) { setEditPresItems(p => [...p, v]); setEditPresInput(''); } }}
                onRemove={i => setEditPresItems(p => p.filter((_, j) => j !== i))}
                onEdit={(i, v) => setEditPresItems(p => p.map((x, j) => j === i ? v : x))} color="accent" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={saving || (editAttempted && (!editTituloValid || !editDescValid))} className="bg-primary-700 hover:bg-primary-600">
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog confirmar eliminación ── */}
      <Dialog open={!!confirmDel} onOpenChange={open => !open && setConfirmDel(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Eliminar vacante</DialogTitle></DialogHeader>
          {confirmDel && (
            <p className="text-sm text-slate-600 py-2">
              ¿Eliminar <strong>{confirmDel.titulo}</strong>?
              Esta acción es <strong>permanente</strong> y eliminará también todas las postulaciones asociadas.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDel(null)}>Cancelar</Button>
            <Button onClick={handleDelete} disabled={!!deleting} className="bg-red-600 hover:bg-red-500 text-white">
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link a postulaciones */}
      {items.length > 0 && (
        <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="w-4 h-4 text-primary-600" />
            Postulaciones recibidas
          </div>
          <a href="/panel/postulaciones" className="text-xs text-primary-700 hover:underline font-medium">
            Ver postulaciones
          </a>
        </div>
      )}
    </div>
  );
}
