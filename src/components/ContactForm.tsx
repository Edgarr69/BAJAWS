"use client";

import { useRef, useState } from "react";
import { siteContent } from "@/content/site";

interface ContactFormProps {
  ctaLabel?: string;
  source?: 'contacto' | 'cotizacion';
}

type FormStatus = "idle" | "sending" | "success" | "error" | "rate_limited";

// ── Límites de longitud para prevenir payloads excesivos ────────────────────
const LIMITS = {
  nombre:   80,
  telefono: 20,
  correo:   120,
  mensaje:  1000,
} as const;

// ── Patrón para correo electrónico (validación client-side básica) ──────────
const EMAIL_RE = /^[^\s@<>"']{1,64}@[^\s@<>"']{1,200}\.[a-zA-Z]{2,}$/;

// ── Patrón para teléfono: solo dígitos, espacios, guiones y paréntesis ──────
const PHONE_RE = /^[\d\s()\-+.]{7,20}$/;

// ── Rate limit: mínimo 45 s entre envíos ────────────────────────────────────
const RATE_LIMIT_MS = 45_000;

export default function ContactForm({ ctaLabel = "Enviar", source = "contacto" }: ContactFormProps) {
  const { honeypotLabel } = siteContent.contacto;

  const [form, setForm] = useState({
    nombre:   "",
    telefono: "",
    correo:   "",
    mensaje:  "",
    hp:       "",
  });

  const [errors, setErrors]   = useState<Partial<typeof form>>({});
  const [status, setStatus]   = useState<FormStatus>("idle");
  const lastSubmitRef         = useRef<number>(0);

  // ── Cambio de campo con límite de longitud ─────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const limit = LIMITS[name as keyof typeof LIMITS];
    const trimmed = limit ? value.slice(0, limit) : value;
    setForm((prev) => ({ ...prev, [name]: trimmed }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // ── Validación client-side ─────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Partial<typeof form> = {};

    if (!form.nombre.trim() || form.nombre.trim().length < 2)
      errs.nombre = "Ingresa tu nombre completo.";

    if (form.telefono && !PHONE_RE.test(form.telefono))
      errs.telefono = "Formato de teléfono inválido.";

    if (!form.correo.trim() || !EMAIL_RE.test(form.correo.trim()))
      errs.correo = "Ingresa un correo electrónico válido.";

    if (!form.mensaje.trim() || form.mensaje.trim().length < 10)
      errs.mensaje = "El mensaje debe tener al menos 10 caracteres.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Envío del formulario ───────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Honeypot — bots que completan campos ocultos son bloqueados silenciosamente
    if (form.hp) return;

    // 2. Rate limiting cliente
    const now = Date.now();
    if (now - lastSubmitRef.current < RATE_LIMIT_MS) {
      setStatus("rate_limited");
      return;
    }

    // 3. Validación de campos
    if (!validate()) return;

    setStatus("sending");
    lastSubmitRef.current = now;

    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre:   form.nombre.trim(),
          telefono: form.telefono.trim(),
          correo:   form.correo.trim().toLowerCase(),
          mensaje:  form.mensaje.trim(),
          fuente:   source,
        }),
      });
      if (!res.ok) throw new Error("server_error");
      setStatus("success");
      setForm({ nombre: "", telefono: "", correo: "", mensaje: "", hp: "" });
    } catch {
      setStatus("error");
    }
  };

  // ── Estado: enviado con éxito ──────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="bg-accent-50 border border-accent-200 rounded-xl p-8 text-center">
        <div className="w-14 h-14 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-accent-800 mb-2">¡Mensaje enviado!</h3>
        <p className="text-accent-700 text-sm">Nos pondremos en contacto contigo a la brevedad.</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-5 text-primary-600 hover:text-primary-800 underline text-sm transition-colors"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">

      {/* Honeypot — oculto para usuarios reales, visible para bots */}
      <div
        className="hidden"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
      >
        <label htmlFor="hp_field">{honeypotLabel}</label>
        <input
          type="text"
          id="hp_field"
          name="hp"
          value={form.hp}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-primary-600">*</span>
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            required
            maxLength={LIMITS.nombre}
            value={form.nombre}
            onChange={handleChange}
            placeholder="Tu nombre completo"
            autoComplete="name"
            className={`input-base ${errors.nombre ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`}
          />
          {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            maxLength={LIMITS.telefono}
            value={form.telefono}
            onChange={handleChange}
            placeholder="(664) 000-0000"
            autoComplete="tel"
            className={`input-base ${errors.telefono ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`}
          />
          {errors.telefono && <p className="text-xs text-red-600 mt-1">{errors.telefono}</p>}
        </div>
      </div>

      {/* Correo */}
      <div>
        <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
          Correo electrónico <span className="text-primary-600">*</span>
        </label>
        <input
          type="email"
          id="correo"
          name="correo"
          required
          maxLength={LIMITS.correo}
          value={form.correo}
          onChange={handleChange}
          placeholder="tu@empresa.com"
          autoComplete="email"
          className={`input-base ${errors.correo ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`}
        />
        {errors.correo && <p className="text-xs text-red-600 mt-1">{errors.correo}</p>}
      </div>

      {/* Mensaje */}
      <div>
        <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje <span className="text-primary-600">*</span>
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={3}
          maxLength={LIMITS.mensaje}
          value={form.mensaje}
          onChange={handleChange}
          placeholder="Describe tu necesidad o consulta…"
          className={`input-base resize-none ${errors.mensaje ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.mensaje
            ? <p className="text-xs text-red-600">{errors.mensaje}</p>
            : <span />}
          <p className="text-xs text-gray-400 ml-auto">
            {form.mensaje.length}/{LIMITS.mensaje}
          </p>
        </div>
      </div>

      {/* Errores generales */}
      {status === "error" && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          Ocurrió un error. Por favor intenta de nuevo o contáctanos directamente.
        </p>
      )}

      {status === "rate_limited" && (
        <p className="text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Por favor espera unos momentos antes de enviar otro mensaje.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-primary-700 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
      >
        {status === "sending" ? "Enviando…" : ctaLabel}
      </button>

      <p className="text-xs text-gray-400 text-center">
        <span className="text-primary-600">*</span> Campos requeridos
      </p>
    </form>
  );
}
