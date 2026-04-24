'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getAutorizaciones, createAutorizacion, updateAutorizacion, deleteAutorizacion } from '@/lib/api';
import type { Autorizacion } from '@/types/panel';

const EMPTY_FORM = {
  clasificacion:       '',
  dependencia:         '',
  modalidad:           '',
  residuo:             '',
  numero_autorizacion: '',
  vigencia:            '',
  display_order:       0,
};

type FormData = typeof EMPTY_FORM;

const REQUIRED_TEXT_FIELDS: (keyof FormData)[] = [
  'clasificacion', 'dependencia', 'modalidad',
  'residuo', 'numero_autorizacion', 'vigencia',
];

function validateForm(f: FormData): string | null {
  for (const key of REQUIRED_TEXT_FIELDS) {
    if (!(f[key] as string).trim()) return 'Todos los campos son requeridos.';
  }
  return null;
}

function AutorizacionForm({
  value,
  onChange,
  submitted,
}: {
  value: FormData;
  onChange: (f: FormData) => void;
  submitted: boolean;
}) {
  const field = (
    key: keyof FormData,
    label: string,
    placeholder = '',
    maxLength = 200,
  ) => {
    const isRequired = REQUIRED_TEXT_FIELDS.includes(key as typeof REQUIRED_TEXT_FIELDS[number]);
    const hasError = submitted && isRequired && !(value[key] as string).trim();
    return (
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-500">
          {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
        <input
          type={key === 'display_order' ? 'number' : 'text'}
          placeholder={placeholder}
          maxLength={maxLength}
          value={value[key] as string}
          onChange={e =>
            onChange({
              ...value,
              [key]: key === 'display_order' ? Number(e.target.value) : e.target.value,
            })
          }
          className={`w-full text-base md:text-sm border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 text-slate-700 placeholder:text-slate-300 ${
            hasError
              ? 'border-red-400 focus:ring-red-400 bg-red-50'
              : 'border-slate-200 focus:ring-primary-500'
          }`}
        />
        {hasError && (
          <p className="text-xs text-red-500">Este campo es requerido.</p>
        )}
      </div>
    );
  };

  return (
    <div className="py-2 space-y-3">
      {field('clasificacion',       'Clasificación',      'Peligrosos / Manejo especial…', 100)}
      {field('dependencia',         'Dependencia',        'SEMARNAT / CESPT…',             100)}
      {field('modalidad',           'Modalidad',          'Transporte / Acopio…',          100)}
      {field('residuo',             'Residuo',            'Descripción del residuo',       300)}
      {field('numero_autorizacion', 'No. Autorización',   'Número oficial',                100)}
      {field('vigencia',            'Vigencia',           '26/10/2025 / Indefinido…',       50)}
      {field('display_order',       'Orden de visualización', '0',                           6)}
    </div>
  );
}

export default function AutorizacionesPage() {
  const [rows, setRows]         = useState<Autorizacion[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]         = useState(false);

  // Dialog crear
  const [newForm, setNewForm]       = useState<FormData | null>(null);
  const [newSubmitted, setNewSubmitted] = useState(false);
  // Dialog editar
  const [editTarget, setEditTarget] = useState<{ id: string; form: FormData; original: FormData } | null>(null);
  const [editSubmitted, setEditSubmitted] = useState(false);
  // Dialog eliminar
  const [delTarget, setDelTarget]   = useState<Autorizacion | null>(null);

  useEffect(() => {
    getAutorizaciones()
      .then(setRows)
      .catch(() => toast.error('Error cargando autorizaciones'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!newForm) return;
    setNewSubmitted(true);
    const err = validateForm(newForm);
    if (err) { toast.error(err); return; }
    setSaving(true);
    try {
      const created = await createAutorizacion(newForm);
      setRows(r => [...r, created].sort((a, b) => a.display_order - b.display_order));
      setNewForm(null);
      setNewSubmitted(false);
      toast.success('Autorización creada');
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Error al crear');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!editTarget) return;
    setEditSubmitted(true);
    const err = validateForm(editTarget.form);
    if (err) { toast.error(err); return; }
    setSaving(true);
    try {
      const updated = await updateAutorizacion(editTarget.id, editTarget.form);
      setRows(r =>
        r
          .map(row => (row.id === editTarget.id ? updated : row))
          .sort((a, b) => a.display_order - b.display_order),
      );
      setEditTarget(null);
      setEditSubmitted(false);
      toast.success('Autorización actualizada');
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!delTarget) return;
    setSaving(true);
    try {
      await deleteAutorizacion(delTarget.id);
      setRows(r => r.filter(row => row.id !== delTarget.id));
      setDelTarget(null);
      toast.success('Autorización eliminada');
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Error al eliminar');
    } finally {
      setSaving(false);
    }
  }

  const openEdit = (row: Autorizacion) => {
    const form: FormData = {
      clasificacion:       row.clasificacion,
      dependencia:         row.dependencia,
      modalidad:           row.modalidad,
      residuo:             row.residuo,
      numero_autorizacion: row.numero_autorizacion,
      vigencia:            row.vigencia,
      display_order:       row.display_order,
    };
    setEditTarget({ id: row.id, form, original: form });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Autorizaciones</h1>
          <p className="text-xs text-slate-400 mt-1">
            Permisos oficiales emitidos por SEMARNAT, CESPT, SEMAR y SCT.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-primary-700 hover:bg-primary-600 shrink-0"
          onClick={() => setNewForm({ ...EMPTY_FORM })}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nueva autorización
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">
              Sin autorizaciones registradas
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                    <th className="text-left px-4 py-3 font-medium">Clasificación</th>
                    <th className="text-left px-4 py-3 font-medium">Dependencia</th>
                    <th className="text-left px-4 py-3 font-medium">Modalidad</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Residuo</th>
                    <th className="text-left px-4 py-3 font-medium">No. Autorización</th>
                    <th className="text-left px-4 py-3 font-medium">Vigencia</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{row.clasificacion}</td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap font-medium">{row.dependencia}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.modalidad}</td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell max-w-xs truncate">{row.residuo}</td>
                      <td className="px-4 py-3 text-slate-700 font-mono text-xs whitespace-nowrap">{row.numero_autorizacion}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.vigencia}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-slate-500"
                            onClick={() => openEdit(row)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
                            onClick={() => setDelTarget(row)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Dialog nueva autorización ─────────────────────────────────── */}
      <Dialog open={!!newForm} onOpenChange={open => { if (!open) { setNewForm(null); setNewSubmitted(false); } }}>
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Nueva autorización</DialogTitle>
          </DialogHeader>
          {newForm && (
            <AutorizacionForm value={newForm} onChange={setNewForm} submitted={newSubmitted} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setNewForm(null); setNewSubmitted(false); }}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving}
              className="bg-primary-700 hover:bg-primary-600"
            >
              {saving ? 'Guardando…' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog editar autorización ────────────────────────────────── */}
      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) { setEditTarget(null); setEditSubmitted(false); } }}>
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Editar autorización</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <AutorizacionForm
              value={editTarget.form}
              onChange={form => setEditTarget(t => t ? { ...t, form } : null)}
              submitted={editSubmitted}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditTarget(null); setEditSubmitted(false); }}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={saving || JSON.stringify(editTarget?.form) === JSON.stringify(editTarget?.original)}
              className="bg-primary-700 hover:bg-primary-600"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog confirmar eliminación ──────────────────────────────── */}
      <Dialog open={!!delTarget} onOpenChange={open => !open && setDelTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar autorización</DialogTitle>
          </DialogHeader>
          {delTarget && (
            <p className="text-sm text-slate-600 py-2">
              ¿Eliminar la autorización{' '}
              <strong className="font-mono">{delTarget.numero_autorizacion}</strong> (
              {delTarget.dependencia} — {delTarget.modalidad})?{' '}
              Esta acción es <strong>permanente</strong>.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelTarget(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={saving}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {saving ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
