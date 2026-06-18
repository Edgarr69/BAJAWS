'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Briefcase, Plus, Trash2, ToggleLeft, ToggleRight, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { createJobPosting, toggleJobPosting, deleteJobPosting } from '@/lib/api';
import type { JobPosting } from '@/types/panel';


export function VacantesClient({ initialItems }: { initialItems: JobPosting[] }) {
  const [items, setItems]         = useState<JobPosting[]>(initialItems);
  const [showAdd, setShowAdd]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [toggling, setToggling]   = useState<string | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<JobPosting | null>(null);
  const [attempted, setAttempted] = useState(false);

  const [titulo, setTitulo]             = useState('');
  const [descripcion, setDescripcion]   = useState('');
  const [requisitos, setRequisitos]     = useState('');
  const [prestaciones, setPrestaciones] = useState('');
  const [ubicacion, setUbicacion]       = useState('Tijuana, B.C.');

  const tituloValid      = titulo.trim().length >= 2;
  const descripcionValid = descripcion.trim().length >= 10;

  function resetForm() {
    setTitulo('');
    setDescripcion('');
    setRequisitos('');
    setPrestaciones('');
    setUbicacion('Tijuana, B.C.');
    setAttempted(false);
  }

  function handleCloseAdd() {
    if (saving) return;
    setShowAdd(false);
    resetForm();
  }

  async function handleAdd() {
    setAttempted(true);
    if (!tituloValid || !descripcionValid) return;
    setSaving(true);
    try {
      const created = await createJobPosting({
        titulo:       titulo.trim(),
        descripcion:  descripcion.trim(),
        requisitos:   requisitos.trim() || null,
        prestaciones: prestaciones.trim() || null,
        ubicacion:    ubicacion.trim() || 'Tijuana, B.C.',
        modalidad:    'presencial',
        is_active:    true,
      });
      setItems(prev => [created, ...prev]);
      setShowAdd(false);
      resetForm();
      toast.success('Vacante publicada');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al crear la vacante');
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
        <Button
          size="sm"
          className="bg-primary-700 hover:bg-primary-600 shrink-0"
          onClick={() => setShowAdd(true)}
        >
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
                <div
                  key={item.id}
                  className="flex items-start justify-between px-5 py-4 hover:bg-slate-50 transition-colors gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-slate-800 truncate">
                        {item.titulo}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          item.is_active
                            ? 'text-accent-700 border-accent-300 bg-accent-50 text-[10px] px-1.5 py-0'
                            : 'text-slate-500 border-slate-200 bg-slate-50 text-[10px] px-1.5 py-0'
                        }
                      >
                        {item.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.ubicacion}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.descripcion}</p>

                    <p className="text-[10px] text-slate-300 mt-1">
                      Creada el{' '}
                      {new Date(item.created_at).toLocaleDateString('es-MX', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-slate-500 border-slate-200"
                      title={item.is_active ? 'Desactivar vacante' : 'Activar vacante'}
                      disabled={toggling === item.id}
                      onClick={() => handleToggle(item)}
                    >
                      {item.is_active
                        ? <ToggleRight className="w-4 h-4 text-accent-600" />
                        : <ToggleLeft className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
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

      {/* Dialog nueva vacante */}
      <Dialog open={showAdd} onOpenChange={open => !open && handleCloseAdd()}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva vacante</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">
                Título <span className="text-red-500">*</span>
              </Label>
              <input
                type="text"
                placeholder="Ej. Operador de planta de tratamiento"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                maxLength={120}
                autoFocus
                className={`w-full text-base md:text-sm border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 text-slate-700 placeholder:text-slate-300 ${
                  attempted && !tituloValid
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-200 focus:ring-primary-500'
                }`}
              />
              {attempted && !tituloValid && (
                <p className="text-xs text-red-500 pl-1">El título es requerido (mín. 2 caracteres)</p>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">Ubicación</Label>
              <input
                type="text"
                placeholder="Tijuana, B.C."
                value={ubicacion}
                onChange={e => setUbicacion(e.target.value)}
                maxLength={100}
                className="w-full text-base md:text-sm border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">
                Descripción del puesto <span className="text-red-500">*</span>
              </Label>
              <textarea
                placeholder="Describe las responsabilidades y el perfil del puesto..."
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                maxLength={3000}
                rows={5}
                className={`w-full text-base md:text-sm border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 text-slate-700 placeholder:text-slate-300 resize-y ${
                  attempted && !descripcionValid
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-200 focus:ring-primary-500'
                }`}
              />
              {attempted && !descripcionValid && (
                <p className="text-xs text-red-500 pl-1">La descripción es requerida (mín. 10 caracteres)</p>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">Requisitos (opcional)</Label>
              <textarea
                placeholder="Lista los requisitos: experiencia, habilidades, documentos, etc."
                value={requisitos}
                onChange={e => setRequisitos(e.target.value)}
                maxLength={3000}
                rows={4}
                className="w-full text-base md:text-sm border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 placeholder:text-slate-300 resize-y"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">Prestaciones (opcional)</Label>
              <textarea
                placeholder="Lista las prestaciones: seguro, vacaciones, horario, etc."
                value={prestaciones}
                onChange={e => setPrestaciones(e.target.value)}
                maxLength={3000}
                rows={4}
                className="w-full text-base md:text-sm border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 placeholder:text-slate-300 resize-y"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAdd} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={handleAdd}
              disabled={saving || (attempted && (!tituloValid || !descripcionValid))}
              className="bg-primary-700 hover:bg-primary-600"
            >
              {saving ? 'Publicando…' : 'Publicar vacante'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmar eliminación */}
      <Dialog open={!!confirmDel} onOpenChange={open => !open && setConfirmDel(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar vacante</DialogTitle>
          </DialogHeader>
          {confirmDel && (
            <p className="text-sm text-slate-600 py-2">
              ¿Eliminar <strong>{confirmDel.titulo}</strong>?
              Esta acción es <strong>permanente</strong> y eliminará también todas las postulaciones asociadas.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDel(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={!!deleting}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
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
          <a
            href="/panel/postulaciones"
            className="text-xs text-primary-700 hover:underline font-medium"
          >
            Ver postulaciones
          </a>
        </div>
      )}
    </div>
  );
}
