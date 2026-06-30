'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { GripVertical, Trash2, Upload, Eye, EyeOff, Save, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import FlotaGallery from '@/components/FlotaGallery';
import type { GaleriaFoto } from '@/types/panel';

// ── Sortable photo card ───────────────────────────────────────────────────────

interface SortablePhotoProps {
  foto: GaleriaFoto;
  onDelete: (id: string) => void;
  onToggleVisible: (id: string, visible: boolean) => void;
}

function SortablePhoto({ foto, onDelete, onToggleVisible }: SortablePhotoProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: foto.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
      className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm select-none"
    >
      <Image
        src={foto.url}
        alt={foto.alt}
        fill
        className={`object-cover pointer-events-none transition-opacity duration-200 ${foto.visible ? '' : 'opacity-40'} ${isDragging ? 'invisible' : ''}`}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        draggable={false}
      />

      {/* Badge oculta */}
      {!foto.visible && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Oculta
          </span>
        </div>
      )}

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="absolute top-1.5 left-1.5 z-10 w-7 h-7 flex items-center justify-center rounded-md bg-black/45 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Botones: ocultar + eliminar */}
      <div className="absolute top-1.5 right-1.5 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onToggleVisible(foto.id, foto.visible)}
          className={`w-7 h-7 flex items-center justify-center rounded-md text-white transition-colors ${
            foto.visible
              ? 'bg-black/45 hover:bg-amber-500/85'
              : 'bg-amber-500/85 hover:bg-amber-600/85'
          }`}
          aria-label={foto.visible ? 'Ocultar foto' : 'Mostrar foto'}
        >
          {foto.visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => onDelete(foto.id)}
          className="w-7 h-7 flex items-center justify-center rounded-md bg-black/45 text-white hover:bg-red-600/85 transition-colors"
          aria-label="Eliminar foto"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface GaleriaClientProps {
  fotos: GaleriaFoto[];
}

export function GaleriaClient({ fotos: initial }: GaleriaClientProps) {
  const [items, setItems]             = useState<GaleriaFoto[]>(initial);
  const [activeId, setActiveId]       = useState<string | null>(null);
  const [dirty, setDirty]             = useState(false);
  const [saving, setSaving]           = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [deleting, setDeleting]       = useState(false);
  const fileInputRef                  = useRef<HTMLInputElement>(null);
  // Estado comprometido en DB — se actualiza tras guardar, subir o borrar
  const savedItems                    = useRef<GaleriaFoto[]>(initial);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // ── Discard ───────────────────────────────────────────────────────────────
  const handleDiscard = useCallback(() => {
    setItems([...savedItems.current]);
    setDirty(false);
  }, []);

  // ── Drag start / end ──────────────────────────────────────────────────────
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems(prev => {
      const oldIdx = prev.findIndex(i => i.id === active.id);
      const newIdx = prev.findIndex(i => i.id === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
    setDirty(true);
  }, []);

  // ── Save order ────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/galeria', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item, i) => ({ id: item.id, orden: i + 1 })),
        }),
      });
      if (!res.ok) throw new Error();
      savedItems.current = [...items];
      setDirty(false);
      toast.success('Orden guardado');
    } catch {
      toast.error('Error al guardar el orden');
    } finally {
      setSaving(false);
    }
  }, [items]);

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const dims     = await getImageDimensions(file);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('width',  String(dims.width));
      formData.append('height', String(dims.height));
      formData.append('alt', 'Unidad Baja Wastewater Solution');

      const res = await fetch('/api/admin/galeria/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error();
      const { foto } = await res.json();
      setItems(prev => [...prev, foto]);
      savedItems.current = [...savedItems.current, foto];
      toast.success('Foto subida correctamente');
    } catch {
      toast.error('Error al subir la foto');
    } finally {
      setUploading(false);
    }
  }, []);

  // ── Toggle visible ────────────────────────────────────────────────────────
  const handleToggleVisible = useCallback(async (id: string, currentVisible: boolean) => {
    setItems(prev => prev.map(f => f.id === id ? { ...f, visible: !currentVisible } : f));
    const res = await fetch(`/api/admin/galeria/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: !currentVisible }),
    });
    if (res.ok) {
      savedItems.current = savedItems.current.map(f =>
        f.id === id ? { ...f, visible: !currentVisible } : f
      );
    } else {
      setItems(prev => prev.map(f => f.id === id ? { ...f, visible: currentVisible } : f));
      toast.error('Error al cambiar visibilidad');
    }
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────────
  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/galeria/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setItems(prev => prev.filter(i => i.id !== deleteId));
      savedItems.current = savedItems.current.filter(f => f.id !== deleteId);
      toast.success('Foto eliminada');
    } catch {
      toast.error('Error al eliminar la foto');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }, [deleteId]);

  const previewImages = items
    .filter(f => f.visible)
    .map(f => ({ src: f.url, alt: f.alt, width: f.width, height: f.height }));

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/webp,image/jpeg,image/jpg,image/png"
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Subir foto"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-700 text-white text-sm font-medium hover:bg-primary-800 disabled:opacity-60 transition-colors"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Subiendo...' : 'Subir foto'}
        </button>

        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          disabled={items.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Vista previa
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={!dirty || saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Descartar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-600 text-white text-sm font-medium hover:bg-accent-700 disabled:opacity-40 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar orden'}
          </button>
        </div>
      </div>

      {dirty && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-5">
          Tienes cambios sin guardar. Presiona Guardar orden para que los visitantes vean el nuevo orden.
        </p>
      )}

      {/* Sortable grid */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
        <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map(foto => (
              <SortablePhoto key={foto.id} foto={foto} onDelete={setDeleteId} onToggleVisible={handleToggleVisible} />
            ))}
          </div>
        </SortableContext>

        <DragOverlay modifiers={[restrictToWindowEdges]}>
          {activeId ? (() => {
            const foto = items.find(f => f.id === activeId);
            if (!foto) return null;
            return (
              <div className="aspect-square rounded-xl overflow-hidden shadow-2xl ring-2 ring-primary-400 opacity-95 cursor-grabbing">
                <Image
                  src={foto.url}
                  alt={foto.alt}
                  width={foto.width}
                  height={foto.height}
                  className="w-full h-full object-cover"
                  sizes="20vw"
                />
              </div>
            );
          })() : null}
        </DragOverlay>
      </DndContext>

      {items.length === 0 && (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-sm">No hay fotos en la galeria.</p>
          <p className="text-xs mt-1">Usa el boton Subir foto para agregar la primera.</p>
        </div>
      )}

      {/* Vista previa */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista previa — Nuestra Flota</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <FlotaGallery images={previewImages} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmacion de eliminacion */}
      <Dialog open={deleteId !== null} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar foto</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Esta accion no se puede deshacer. La foto sera eliminada permanentemente.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <button
              type="button"
              onClick={() => setDeleteId(null)}
              disabled={deleting}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload  = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')); };
    img.src = url;
  });
}
